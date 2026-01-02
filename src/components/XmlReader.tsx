'use client';

import React, { useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { XMLParser } from 'fast-xml-parser';
import { HosoRecord, parseXmlContent, getXmlDataList, ExtendedHosoRecord } from '@/lib/xml';
import RuleSettings from './RuleSettings';
import { DEFAULT_RULES, ValidationEngine, ValidationRule, ValidationResult } from '@/lib/validation';
import { useRules } from "@/hooks/useRules";
import { saveRecordsToDB, loadRecordsFromDB } from '@/lib/db';

const formatGender = (gender: any) => {
    const g = String(gender);
    if (g === '1') return 'Nam';
    if (g === '2') return 'Nữ';
    return 'Khác';
};

const renderValue = (val: any) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') {
        return val.__cdata !== undefined ? String(val.__cdata) : '';
    }
    return String(val);
};

const formatDateTime = (dateStr: any) => {
    const s = renderValue(dateStr);
    if (s.length === 12) { // YYYYMMDDHHmm
        return `${s.substring(6, 8)}/${s.substring(4, 6)}/${s.substring(0, 4)} ${s.substring(8, 10)}:${s.substring(10, 12)}`;
    }
    if (s.length >= 14) { // YYYYMMDDHHmmss - User asked for hh:mm but if sec exists we might as well keep consistent or truncate. Let's truncate to hh:mm as requested.
        return `${s.substring(6, 8)}/${s.substring(4, 6)}/${s.substring(0, 4)} ${s.substring(8, 10)}:${s.substring(10, 12)}`;
    }
    if (s.length >= 8) {
        return `${s.substring(6, 8)}/${s.substring(4, 6)}/${s.substring(0, 4)}`;
    }
    return s;
};

// Helper to extract keys dynamically
const getAllKeys = (dataList: any[]) => {
    const keys = new Set<string>();
    dataList.forEach(item => {
        if (item && typeof item === 'object') {
            Object.keys(item).forEach(k => {
                if (k !== '__cdata' && !k.startsWith('_') && k !== 'STT') {
                    keys.add(k);
                }
            });
        }
    });
    return Array.from(keys);
};



const GenericXmlTable = ({
    dataList,
    xmlType,
    validationResults,
    filterMode,
    setFilterMode,
    isFilterOpen,
    setIsFilterOpen,
    columnFilters,
    handleColumnFilterChange
}: any) => {
    const keys = getAllKeys(dataList).sort((a, b) => {
        const priority = [
            'MA_LK', 'NGAY_YL', 'NGAY_TH_YL', 'NGAY_KQ',
            'MA_DICH_VU', 'TEN_DICH_VU',
            'MA_THUOC', 'TEN_THUOC'
        ];
        const idxA = priority.indexOf(a);
        const idxB = priority.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
    });
    const showSearch = true; // Always show search

    const filteredData = dataList.filter((d: any) => {
        if (filterMode === 'ERROR') {
            const idx = dataList.indexOf(d);
            const hasError = validationResults.some((v: any) => v.xmlType === xmlType && v.index === idx);
            if (!hasError) return false;
        }
        if (filterMode === 'VALID') {
            const idx = dataList.indexOf(d);
            const hasError = validationResults.some((v: any) => v.xmlType === xmlType && v.index === idx);
            if (hasError) return false;
        }

        return Object.entries(columnFilters).every(([key, value]) => {
            if (!key.startsWith(`${xmlType}_`) || !value) return true;
            const field = key.replace(`${xmlType}_`, '').trim();
            const cellValue = renderValue(d[field]).toLowerCase();
            return cellValue.includes((value as string).toLowerCase());
        });
    });

    const [copiedLoc, setCopiedLoc] = React.useState<{ row: number, col: string } | null>(null);

    const handleCopy = (text: string, row: number, col: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedLoc({ row, col });
        setTimeout(() => setCopiedLoc(null), 1000);
    };

    // Pagination State for Detail View
    const [currentPage, setCurrentPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);

    // Reset page when filter changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [filterMode, columnFilters]);

    const totalPages = Math.ceil(filteredData.length / pageSize);
    const startIdx = (currentPage - 1) * pageSize;
    const paginatedData = filteredData.slice(startIdx, startIdx + pageSize);

    if (keys.length === 0) return <div className="p-4 text-center text-slate-400 italic">Không có dữ liệu bảng</div>;

    return (
        <div className="overflow-x-auto border border-slate-100 rounded-xl min-h-[300px]">
            <table className="w-full text-left text-xs font-medium text-slate-600 border-collapse min-w-[1200px]">
                <thead className="bg-slate-100/90 sticky top-0 z-20 shadow-sm backdrop-blur-sm">
                    <tr className="border-b border-slate-300">
                        <th className="py-4 px-4 border-r border-slate-200 w-16 text-center align-middle relative group bg-slate-100">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">STT</span>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsFilterOpen(!isFilterOpen); }}
                                    className={`p-1.5 rounded-full shadow-lg border transition-all duration-200 ${filterMode !== 'ALL' ? 'bg-cyan-500 text-white border-cyan-600 scale-100 opacity-100' : 'bg-white text-slate-500 border-slate-200 hover:text-cyan-600 hover:border-cyan-300'}`}
                                    title="Lọc trạng thái"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                                </button>
                            </div>
                            {filterMode !== 'ALL' && (
                                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-500"></div>
                            )}
                            {isFilterOpen && (
                                <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-xl shadow-2xl border border-slate-100 py-1.5 z-50 text-left animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-3 py-2 text-[10px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-50 mb-1">Lọc theo trạng thái</div>
                                    <button onClick={() => { setFilterMode('ALL'); setIsFilterOpen(false); }} className={`w-full px-4 py-2 text-xs font-bold flex items-center gap-2 hover:bg-slate-50 ${filterMode === 'ALL' ? 'text-cyan-600 bg-cyan-50/50' : 'text-slate-600'}`}>
                                        <span className={`w-2 h-2 rounded-full ${filterMode === 'ALL' ? 'bg-cyan-500' : 'bg-slate-300'}`}></span> Tất cả
                                    </button>
                                    <button onClick={() => { setFilterMode('ERROR'); setIsFilterOpen(false); }} className={`w-full px-4 py-2 text-xs font-bold flex items-center gap-2 hover:bg-slate-50 ${filterMode === 'ERROR' ? 'text-red-600 bg-red-50/50' : 'text-slate-600'}`}>
                                        <span className={`w-2 h-2 rounded-full ${filterMode === 'ERROR' ? 'bg-red-500' : 'bg-slate-300'}`}></span> Dòng lỗi
                                    </button>
                                    <button onClick={() => { setFilterMode('VALID'); setIsFilterOpen(false); }} className={`w-full px-4 py-2 text-xs font-bold flex items-center gap-2 hover:bg-slate-50 ${filterMode === 'VALID' ? 'text-green-600 bg-green-50/50' : 'text-slate-600'}`}>
                                        <span className={`w-2 h-2 rounded-full ${filterMode === 'VALID' ? 'bg-green-500' : 'bg-slate-300'}`}></span> Dòng đúng
                                    </button>
                                </div>
                            )}
                        </th>
                        <th className="py-4 px-2 border-r border-slate-200 w-12 text-center bg-slate-100">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">KQ</span>
                        </th>
                        <th className="py-4 px-4 border-r border-slate-200 min-w-[200px] text-center bg-slate-100">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nội dung lỗi</span>
                        </th>
                        {keys.map((key) => (
                            <th key={key} className="py-4 px-4 border-r border-slate-200 min-w-[180px] align-top bg-slate-100 group">
                                <div className="flex flex-col gap-3">
                                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">{key}</span>
                                    {showSearch && (
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Tìm..."
                                                className="w-full pl-8 pr-3 py-1.5 rounded-full border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 font-medium normal-case text-slate-700 text-[11px] shadow-sm transition-all"
                                                value={columnFilters[`${xmlType}_${key}`] || ''}
                                                onChange={(e) => handleColumnFilterChange(xmlType, key, e.target.value)}
                                            />
                                            <svg className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                        </div>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                    {paginatedData.map((d: any, i: number) => {
                        const originalIndex = dataList.indexOf(d);
                        const rowErrors = validationResults.filter((v: any) => v.xmlType === xmlType && v.index === originalIndex);
                        const hasError = rowErrors.length > 0;

                        return (
                            <tr key={originalIndex} className={`hover:bg-cyan-50/20 transition-colors ${hasError ? 'bg-red-50/30' : ''}`}>
                                <td
                                    className={`py-4 px-4 text-center font-mono border-r border-slate-50 relative ${hasError ? 'bg-red-50 text-red-600 font-bold' : 'text-slate-400'}`}
                                >
                                    {hasError ? (
                                        <div className="flex items-center justify-center gap-1">
                                            <svg className="w-3 h-3 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                            {startIdx + i + 1}
                                        </div>
                                    ) : (
                                        startIdx + i + 1
                                    )}
                                </td>
                                <td className="py-3 px-2 border-r border-slate-50 text-center">
                                    {hasError ? (
                                        <div className="w-4 h-4 rounded-full border border-red-200 bg-red-50 flex items-center justify-center mx-auto">
                                            <svg className="w-2.5 h-2.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </div>
                                    ) : (
                                        <div className="w-4 h-4 rounded-full border border-green-200 bg-green-50 flex items-center justify-center mx-auto">
                                            <svg className="w-2.5 h-2.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                    )}
                                </td>
                                <td className="py-3 px-4 border-r border-slate-50 text-left">
                                    {hasError ? (
                                        <div className="flex flex-col gap-1 max-w-[300px]">
                                            {rowErrors.map((err: any, idx: number) => (
                                                <div key={idx} className="text-[10px] font-medium text-red-600 bg-red-50/50 px-2 py-1 rounded border border-red-100/50 break-words leading-tight">
                                                    {err.message}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex justify-center">
                                            <span className="text-[10px] text-slate-300 italic">--</span>
                                        </div>
                                    )}
                                </td>
                                {keys.map((key) => {
                                    const rawValue = d[key];
                                    const displayValue = (key.includes('NGAY') || key.includes('THOI_GIAN')) ? formatDateTime(rawValue) : renderValue(rawValue);
                                    const isCopied = copiedLoc?.row === originalIndex && copiedLoc?.col === key;

                                    return (
                                        <td
                                            key={key}
                                            onClick={() => handleCopy(displayValue, originalIndex, key)}
                                            className="py-4 px-4 border-r border-slate-50 text-slate-700 whitespace-pre-wrap min-w-[150px] cursor-copy hover:bg-cyan-100/50 active:bg-cyan-200/50 transition-colors relative group"
                                            title="Click để copy"
                                        >
                                            {displayValue}
                                            {isCopied && (
                                                <span className="absolute top-1 right-1 bg-cyan-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm animate-in fade-in zoom-in duration-200">
                                                    Đã copy
                                                </span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Pagination Controls for Detail Table */}
            {filteredData.length > 0 && (
                <div className="bg-slate-50 border-t border-slate-100 p-2 flex items-center justify-between sticky bottom-0 z-10">
                    <div className="text-[10px] text-slate-500 font-medium pl-2">
                        {startIdx + 1}-{Math.min(startIdx + pageSize, filteredData.length)} / {filteredData.length} dòng
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={pageSize}
                            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                            className="bg-white border border-slate-200 text-slate-600 text-[10px] rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1 rounded hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent text-slate-500 transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <span className="text-[10px] font-bold text-slate-700 min-w-[20px] text-center">{currentPage}/{totalPages}</span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1 rounded hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent text-slate-500 transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!filteredData.length && (
                <div className="p-8 text-center text-slate-400 text-sm">Không tìm thấy dữ liệu phù hợp</div>
            )}

        </div>
    );
};

export default function XmlReader() {
    const [records, setRecords] = useState<ExtendedHosoRecord[]>([]);
    const [selectedRecord, setSelectedRecord] = useState<ExtendedHosoRecord | null>(null);
    const [activeTab, setActiveTab] = useState<string>('XML1');
    const [error, setError] = useState<string | null>(null);
    const [processingProgress, setProcessingProgress] = useState<{ current: number, total: number } | null>(null);
    const [isRuleSettingsOpen, setIsRuleSettingsOpen] = useState(false);
    const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
    const { rules, saveRules, isLoaded: isRulesLoaded } = useRules();
    const [dbLoadTrigger, setDbLoadTrigger] = useState(0);

    // Load records from DB on mount
    React.useEffect(() => {
        const load = async () => {
            try {
                const savedRecords = await loadRecordsFromDB();
                if (savedRecords && savedRecords.length > 0) {
                    // Just set records. The effect below[rules] will handle validation 
                    // IF rules change. But if rules are already loaded, we need to ensure validation runs.
                    // The problem is: if rules are already loaded and stable, setting records won't trigger the [rules] effect?
                    // actually, setting records triggers render. But the effect [rules] only runs if rules reference changes.

                    // We need to force validation on these loaded records.
                    // But we can't access 'rules' here safely if we don't depend on it.
                    setRecords(savedRecords);
                }
            } catch (error) {
                console.error("Failed to load records from DB:", error);
            }
        };
        load();
    }, []);

    // Re-validate when rules change OR when records are first loaded
    // We add a check: if we have records but they haven't been validated against current rules? 
    // It's hard to know.
    // Simplest fix: Re-run validation whenever 'rules' changes OR 'records' length changes? 
    // No, 'records' logic updates 'records' -> infinite loop.

    // Better: use a ref to track if initial validation is done?
    // Or just run validation when `isLoaded` (from useRules) becomes true?


    // Re-validate when rules change OR records are just loaded?
    // Actually, simply watching rules is enough if we trust the dependency.
    // Issue: 'records' inside useEffect is from closure.


    // Re-validate process
    React.useEffect(() => {
        if (!isRulesLoaded || records.length === 0) return;

        // Check if we need to re-validate? 
        // Ideally we should comparing hash or something, but for now let's just re-validate 
        // if rules have changed (dependency) or if we just loaded records (dependency on records length? no).

        // We can use a functional update to re-validate current records
        setRecords(prevRecords => {
            if (prevRecords.length === 0) return prevRecords;
            const validator = new ValidationEngine(rules);

            // Optimization: Maybe check if validationResults already match current rules? Hard.
            // Just re-run. It's fast enough for client side < 1000 records.
            return prevRecords.map(r => ({
                ...r,
                validationResults: validator.validate(r)
            }));
        });
        // We depend on 'rules' so it runs when rules update.
        // We also want to run when records are loaded from DB. 
        // But we can't depend on 'records' without loops.
        // Solution: The 'load' effect above sets records. 
        // If we simply depend on `rules` and `isRulesLoaded`, it handles rule updates.
        // To handle "Loading Records" updates, we can trigger this effect manually or use a "dataVersion" state?
    }, [rules, isRulesLoaded]);

    // Fix: When loading from DB, we want to re-validate immediately if rules are ready.
    // If we modify the loadRecordsFromDB to be aware of rules:
    React.useEffect(() => {
        const load = async () => {
            try {
                const savedRecords = await loadRecordsFromDB();
                if (savedRecords && savedRecords.length > 0) {
                    // If rules are already loaded, we can validate right here before setting!
                    // But 'rules' is in closure scope of this effect (empty).
                    // We can't access fresh rules here without dependency.

                    // Workaround: Set records. Then rely on an effect that watches 'records' changes? 
                    // No, that loops.

                    setRecords(savedRecords);
                }
            } catch (error) { /**/ }
        };
        load();
    }, []);

    // The MISSING PIECE: When records are set from DB, they might be stale.
    // We need an effect that says: "If records exist, and rules exist, ensure they are validated".
    // Since we can't detect "stale" easily, we might just re-run validation when `isRulesLoaded` becomes true.
    // But if `isRulesLoaded` is already true?

    // Let's add a separate effect that runs ONCE when records are loaded?
    // Or just use a requestRef.

    // Actually, simply adding a trigger/version when DB loads helps.


    // Unified Validation Effect
    React.useEffect(() => {
        if (!isRulesLoaded) return;

        setRecords(prev => {
            if (prev.length === 0) return prev;
            const validator = new ValidationEngine(rules);
            return prev.map(r => ({ ...r, validationResults: validator.validate(r) }));
        });
    }, [rules, isRulesLoaded, dbLoadTrigger]); // Run when rules change OR when DB loads


    const [filterMode, setFilterMode] = useState<'ALL' | 'ERROR' | 'VALID'>('ALL');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
    const [maBnFilter, setMaBnFilter] = useState('');
    const [mainFilterMode, setMainFilterMode] = useState<'ALL' | 'ERROR' | 'VALID'>('ERROR');
    const [isMainFilterOpen, setIsMainFilterOpen] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const filteredRecords = records.filter(record => {
        // Status Filter
        if (mainFilterMode === 'ERROR') {
            if (record.validationResults.length === 0 && !record.validationResults.some(v => v.isError)) return false; // This logic is slightly wrong. record.validationResults contains errors/warnings.
            // Correct logic: show if there are ANY validation results that are errors
            if (!record.validationResults.some(v => v.isError)) return false;
        }
        if (mainFilterMode === 'VALID') {
            if (record.validationResults.some(v => v.isError)) return false;
        }

        // MA_BN Filter
        if (!maBnFilter) return true;
        const maBn = record.summary?.MA_BN ? String(record.summary.MA_BN) : '';
        return maBn.toLowerCase().includes(maBnFilter.toLowerCase());
    });

    // Reset pagination when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [mainFilterMode, maBnFilter, rules, records]);

    // Derived State for Pagination
    const totalPages = Math.ceil(filteredRecords.length / pageSize);
    const startIdx = (currentPage - 1) * pageSize;
    const paginatedRecords = filteredRecords.slice(startIdx, startIdx + pageSize);

    const handleColumnFilterChange = (xmlType: string, field: string, value: string) => {
        setColumnFilters(prev => ({
            ...prev,
            [`${xmlType}_${field}`]: value
        }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setError(null);
        setProcessingProgress({ current: 0, total: files.length });

        const allNewRecords: ExtendedHosoRecord[] = [];
        const validator = new ValidationEngine(rules); // Use rules from hook

        try {
            const filePromises = Array.from(files).map(file => {
                return new Promise<void>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        try {
                            const buffer = event.target?.result as ArrayBuffer;
                            const decoder = new TextDecoder('utf-8');
                            const content = decoder.decode(buffer);

                            const parsed = parseXmlContent(content);
                            const recordsWithSource = parsed.records.map(r => ({
                                ...r,
                                sourceFile: file.name,
                                validationResults: validator.validate(r) // Validate here
                            }));
                            allNewRecords.push(...recordsWithSource);
                            setProcessingProgress(prev => prev ? { ...prev, current: prev.current + 1 } : null);
                            resolve();
                        } catch (err: any) {
                            reject(new Error(`Lỗi file ${file.name}: ${err.message} `));
                        }
                    };
                    reader.onerror = () => reject(new Error(`Không thể đọc file ${file.name} `));
                    reader.readAsArrayBuffer(file);
                });
            });

            await Promise.all(filePromises);
            setRecords(allNewRecords);
            await saveRecordsToDB(allNewRecords);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Lỗi khi xử lý các file XML.');
            setRecords([]);
        } finally {
            setProcessingProgress(null);
        }
    };

    const handleTabChange = (newTab: string) => {
        setActiveTab(newTab);
        if (selectedRecord && newTab !== 'VALIDATION') {
            const hasErrors = selectedRecord.validationResults.some(v => v.xmlType === newTab);
            setFilterMode(hasErrors ? 'ERROR' : 'ALL');
        } else {
            setFilterMode('ALL');
        }
    };

    const handleRowClick = (record: ExtendedHosoRecord) => {
        setSelectedRecord(record);
        // Default to XML1 or the first available tab
        const firstTab = record.groups.find(g => g.type === 'XML1') ? 'XML1' : record.groups[0]?.type;
        const initialTab = firstTab || '';
        setActiveTab(initialTab);

        // Initial filter mode for the first tab
        if (initialTab && initialTab !== 'VALIDATION') {
            const hasErrors = record.validationResults.some(v => v.xmlType === initialTab);
            setFilterMode(hasErrors ? 'ERROR' : 'ALL');
        } else {
            setFilterMode('ALL');
        }
    };

    const handleExportExcel = async () => {
        if (records.length === 0) return;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Báo cáo lỗi');

        // Define columns
        worksheet.columns = [
            { header: 'STT', key: 'stt', width: 5 },
            { header: 'Mã LK', key: 'ma_lk', width: 14 },
            { header: 'Mã BN', key: 'ma_bn', width: 14 },
            { header: 'Họ tên', key: 'ho_ten', width: 25 },
            { header: 'Ngày sinh', key: 'ngay_sinh', width: 12 },
            { header: 'Mã thẻ', key: 'ma_the', width: 20 },
            { header: 'NGAY_YL', key: 'ngay_loi', width: 16 },
            { header: 'Mã dịch vụ', key: 'ma_dich_vu', width: 15 },
            { header: 'Chi tiết lỗi', key: 'error_details', width: 60 },
        ];

        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFCCE5FF' }
        };

        // Add rows
        filteredRecords.forEach((record, index) => {
            const errors = record.validationResults.filter(v => v.isError);

            if (errors.length === 0) {
                // No errors, add single row
                worksheet.addRow({
                    stt: index + 1,
                    ma_lk: renderValue(record.summary?.MA_LK),
                    ma_bn: renderValue(record.summary?.MA_BN),
                    ho_ten: renderValue(record.summary?.HO_TEN),
                    ngay_sinh: renderValue(record.summary?.NGAY_SINH),
                    ma_the: renderValue(record.summary?.MA_THE_BHYT),
                    ngay_loi: '',
                    ma_dich_vu: '',
                    error_details: ''
                });
            } else {
                // Has errors, add one row per error
                errors.forEach(err => {
                    let extractedDate = '';
                    let extractedCode = '';

                    // Try to find the specific item
                    if (err.xmlType && err.index !== undefined) {
                        const group = record.groups.find(g => g.type === err.xmlType);
                        if (group) {
                            const dataList = getXmlDataList(group);
                            const item = dataList[err.index];
                            if (item) {
                                // Try common code fields
                                extractedCode = item.MA_DICH_VU || item.MA_THUOC || item.MA_VAT_TU || item.MA_BENH || '';
                                // Try common date fields
                                extractedDate = item.NGAY_YL || item.NGAY_KQ || item.NGAY_TH_YL || item.NGAY_VAO || item.NGAY_RA || '';
                            }
                        }
                    }

                    worksheet.addRow({
                        stt: index + 1,
                        ma_lk: renderValue(record.summary?.MA_LK),
                        ma_bn: renderValue(record.summary?.MA_BN),
                        ho_ten: renderValue(record.summary?.HO_TEN),
                        ngay_sinh: renderValue(record.summary?.NGAY_SINH),
                        ma_the: renderValue(record.summary?.MA_THE_BHYT),
                        ngay_loi: extractedDate ? formatDateTime(extractedDate) : '',
                        ma_dich_vu: renderValue(extractedCode),
                        error_details: `[${err.xmlType}] ${err.message || err.ruleName}`
                    });
                });
            }
        });

        // Apply Global Font Style
        worksheet.eachRow((row, rowNumber) => {
            row.font = { name: 'Times New Roman', size: 10, bold: rowNumber === 1 };
            row.alignment = { vertical: 'middle', wrapText: true };
        });

        // Generate buffer and save
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `Danh_sach_loi_BHXH_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    return (
        <div className="space-y-8 relative">
            {/* Progress Overlay */}
            {processingProgress && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 border border-slate-100">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full border-4 border-cyan-100 border-t-cyan-500 animate-spin"></div>
                            <div className="text-center">
                                <h3 className="text-lg font-bold text-slate-800">Đang xử lý hồ sơ...</h3>
                                <p className="text-slate-500 text-sm mt-1">
                                    Đã hoàn thành {processingProgress.current} / {processingProgress.total} file
                                </p>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-cyan-500 h-full transition-all duration-300 ease-out rounded-full"
                                    style={{ width: `${(processingProgress.current / processingProgress.total) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Area */}
            {records.length === 0 && (
                <div className="max-w-2xl mx-auto">
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-300 border-dashed rounded-3xl cursor-pointer bg-white hover:bg-slate-50 transition-all group overflow-hidden relative">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                            <div className="w-16 h-16 bg-cyan-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                                <svg className="w-8 h-8 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            <p className="mb-2 text-sm text-slate-700 font-bold tracking-tight">
                                <span className="text-cyan-600">Nhấn để tải lên nhiều file</span> hoặc kéo thả
                            </p>
                            <p className="text-xs text-slate-400 font-medium">Bạn có thể chọn cùng lúc nhiều file .xml</p>
                        </div>
                        <input type="file" className="hidden" accept=".xml" multiple onChange={handleFileUpload} />
                    </label>
                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-bold animate-pulse">
                            {error}
                        </div>
                    )}
                </div>
            )}

            {records.length > 0 && !selectedRecord && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="bg-white p-2 pr-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => { setRecords([]); }}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 text-slate-500 font-bold text-xs hover:bg-cyan-500 hover:text-white transition-all shadow-sm hover:shadow-cyan-200"
                                title="Tải File XML khác"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                <span>Tải File XML</span>
                            </button>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Kết quả phân tích</span>
                                <h2 className="text-lg font-bold text-slate-800">
                                    {filteredRecords.length} hồ sơ <span className="text-slate-400 font-medium text-xs">từ {new Set(records.map(r => r.sourceFile)).size} file XML</span>
                                </h2>
                            </div>
                        </div>


                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleExportExcel}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-all shadow-sm shadow-green-200"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Xuất Excel
                            </button>

                        </div>
                    </div>

                    {/* Data Grid */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[300px]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs font-medium text-slate-600 border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="py-4 px-2 font-bold text-slate-400 uppercase tracking-tighter w-16 text-center relative z-20">
                                            <div className="flex items-center justify-center gap-1">
                                                <span>TT</span>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setIsMainFilterOpen(!isMainFilterOpen); }}
                                                    className={`p - 1 rounded - lg transition - all ${isMainFilterOpen || mainFilterMode !== 'ALL' ? 'bg-cyan-100 text-cyan-600' : 'hover:bg-slate-100 text-slate-400'}`}
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                                                </button>
                                            </div>
                                            {mainFilterMode !== 'ALL' && (
                                                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-500"></div>
                                            )}
                                            {isMainFilterOpen && (
                                                <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-xl shadow-2xl border border-slate-100 py-1.5 z-50 text-left animate-in fade-in zoom-in-95 duration-200">
                                                    <div className="px-3 py-2 text-[10px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-50 mb-1">Lọc theo trạng thái</div>
                                                    <button onClick={() => { setMainFilterMode('ALL'); setIsMainFilterOpen(false); }} className={`w - full px - 4 py - 2 text - xs font - bold flex items - center gap - 2 hover: bg - slate - 50 ${mainFilterMode === 'ALL' ? 'text-cyan-600 bg-cyan-50/50' : 'text-slate-600'} `}>
                                                        <span className={`w - 2 h - 2 rounded - full ${mainFilterMode === 'ALL' ? 'bg-cyan-500' : 'bg-slate-300'} `}></span> Tất cả
                                                    </button>
                                                    <button onClick={() => { setMainFilterMode('ERROR'); setIsMainFilterOpen(false); }} className={`w - full px - 4 py - 2 text - xs font - bold flex items - center gap - 2 hover: bg - slate - 50 ${mainFilterMode === 'ERROR' ? 'text-red-600 bg-red-50/50' : 'text-slate-600'} `}>
                                                        <span className={`w - 2 h - 2 rounded - full ${mainFilterMode === 'ERROR' ? 'bg-red-500' : 'bg-slate-300'} `}></span> Có lỗi
                                                    </button>
                                                    <button onClick={() => { setMainFilterMode('VALID'); setIsMainFilterOpen(false); }} className={`w - full px - 4 py - 2 text - xs font - bold flex items - center gap - 2 hover: bg - slate - 50 ${mainFilterMode === 'VALID' ? 'text-green-600 bg-green-50/50' : 'text-slate-600'} `}>
                                                        <span className={`w - 2 h - 2 rounded - full ${mainFilterMode === 'VALID' ? 'bg-green-500' : 'bg-slate-300'} `}></span> Không lỗi
                                                    </button>
                                                </div>
                                            )}
                                        </th>
                                        <th className="py-4 px-4 font-bold text-slate-400 uppercase tracking-tighter w-32 text-center">Kiểm tra</th>
                                        <th className="py-4 px-2 font-bold text-slate-400 uppercase tracking-tighter w-12 text-center">KQ</th>
                                        <th className="py-4 px-4 font-bold text-slate-400 uppercase tracking-tighter">Ngày sinh</th>
                                        <th className="py-4 px-4 font-bold text-slate-400 uppercase tracking-tighter">Họ tên</th>
                                        <th className="py-4 px-4 font-bold text-slate-400 uppercase tracking-tighter group min-w-[150px]">
                                            <div className="flex flex-col gap-2">
                                                <span>Mã BN</span>
                                                <input
                                                    type="text"
                                                    placeholder="Tìm..."
                                                    className="w-full px-2 py-1 rounded border border-slate-200 text-[10px] font-normal focus:outline-none focus:border-cyan-500"
                                                    value={maBnFilter}
                                                    onChange={(e) => setMaBnFilter(e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        </th>
                                        <th className="py-4 px-4 font-bold text-slate-400 uppercase tracking-tighter">Giới tính</th>
                                        <th className="py-4 px-4 font-bold text-slate-400 uppercase tracking-tighter">Mã thẻ BHYT</th>
                                        <th className="py-4 px-4 font-bold text-slate-400 uppercase tracking-tighter">Mã LK</th>
                                        <th className="py-4 px-4 font-bold text-slate-400 uppercase tracking-tighter">Nguồn File</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {paginatedRecords.map((record, i) => {
                                        const actualIndex = startIdx + i;
                                        const s = record.summary;
                                        return (
                                            <tr
                                                key={`${record.id}-${actualIndex}`}
                                                onClick={() => handleRowClick(record)}
                                                className="hover:bg-cyan-50/30 cursor-pointer transition-colors group"
                                            >
                                                <td className="py-4 px-4 text-center text-slate-400 font-mono">{actualIndex + 1}</td>
                                                <td className="py-4 px-4 text-center">
                                                    {record.validationResults.length > 0 ? (
                                                        <span className={`px - 2 py - 0.5 rounded text - [10px] font - black ${record.validationResults.some(v => v.isError)
                                                            ? 'bg-red-100 text-red-600 animate-pulse'
                                                            : 'bg-amber-100 text-amber-600'
                                                            } `}>
                                                            {record.validationResults.length} lỗi
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-green-50 text-green-600">Đạt</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-2 text-center">
                                                    <div className="w-5 h-5 rounded-full border border-green-200 bg-green-50 flex items-center justify-center mx-auto">
                                                        <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-slate-500 font-mono text-xs">{formatDateTime(s?.NGAY_SINH)}</td>
                                                <td className="py-4 px-4 font-black text-slate-900 uppercase italic tracking-tighter">{renderValue(s?.HO_TEN)}</td>
                                                <td className="py-4 px-4 font-bold text-slate-700">{renderValue(s?.MA_BN)}</td>
                                                <td className="py-4 px-4 text-slate-500">{formatGender(s?.GIOI_TINH)}</td>
                                                <td className="py-4 px-4 font-bold text-slate-700">{renderValue(s?.MA_THE_BHYT)}</td>
                                                <td className="py-4 px-4 font-bold text-slate-700">{renderValue(s?.MA_LK)}</td>
                                                <td className="py-4 px-4">
                                                    <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100">{record.sourceFile}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {filteredRecords.length > 0 && (
                            <div className="bg-slate-50 border-t border-slate-100 p-4 flex items-center justify-between">
                                <div className="text-xs text-slate-500 font-medium">
                                    Hiển thị {startIdx + 1}-{Math.min(startIdx + pageSize, filteredRecords.length)} trong tổng số {filteredRecords.length} hồ sơ
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={pageSize}
                                        onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                                        className="bg-white border border-slate-200 text-slate-600 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                    >
                                        <option value={10}>10 / trang</option>
                                        <option value={20}>20 / trang</option>
                                        <option value={50}>50 / trang</option>
                                        <option value={100}>100 / trang</option>
                                    </select>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="p-1.5 rounded-lg hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent text-slate-500 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                        </button>
                                        <span className="text-xs font-bold text-slate-700 w-8 text-center">{currentPage} / {totalPages || 1}</span>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-1.5 rounded-lg hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent text-slate-500 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {selectedRecord && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden min-h-[80vh] flex flex-col">
                    {/* Professional Header */}
                    <header className="px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => setSelectedRecord(null)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-cyan-600"
                                title="Quay lại danh sách"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            </button>
                            <h1 className="text-lg font-bold text-slate-800 uppercase tracking-tight">THÔNG TIN ĐỢT KHÁM CHỮA BỆNH</h1>
                        </div>
                        <div className="flex items-center gap-2">

                            <button onClick={() => setSelectedRecord(null)} className="flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                Hủy
                            </button>
                        </div>
                    </header>

                    {/* Tabs Navigation (Refined) */}
                    <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                        <div className="flex overflow-x-auto no-scrollbar pt-2 px-4 gap-2">
                            {selectedRecord.groups.map((group) => {
                                const groupErrors = selectedRecord.validationResults.filter(v => v.xmlType === group.type);
                                const isActive = activeTab === group.type;
                                return (
                                    <button
                                        key={group.type}
                                        onClick={() => handleTabChange(group.type)}
                                        className={`
                                            relative flex items-center gap-2 px-4 py-3 text-sm font-bold transition-all whitespace-nowrap rounded-t-lg border-b-2
                                            ${isActive
                                                ? 'border-cyan-500 text-cyan-700 bg-cyan-50/50'
                                                : 'border-transparent text-slate-500 hover:text-cyan-600 hover:bg-slate-50'
                                            }
                                        `}
                                    >
                                        <span>{group.type}</span>
                                        {groupErrors.length > 0 && (
                                            <span className={`
                                                flex items-center justify-center w-5 h-5 text-[10px] rounded-full 
                                                ${isActive ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600'}
                                            `}>
                                                {groupErrors.length}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => handleTabChange('VALIDATION')}
                                className={`
                                    relative flex items-center gap-2 px-4 py-3 text-sm font-bold transition-all whitespace-nowrap rounded-t-lg border-b-2 ml-4
                                    ${activeTab === 'VALIDATION'
                                        ? 'border-red-500 text-red-700 bg-red-50/50'
                                        : 'border-transparent text-slate-500 hover:text-red-600 hover:bg-slate-50'
                                    }
                                `}
                            >
                                <span>KIỂM TRA</span>
                                {selectedRecord.validationResults.length > 0 && (
                                    <span className={`
                                        flex items-center justify-center w-5 h-5 text-[10px] rounded-full 
                                        ${activeTab === 'VALIDATION' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-600'}
                                    `}>
                                        {selectedRecord.validationResults.length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Detail Body */}
                    <div className="flex-1 overflow-y-auto p-8 bg-white">
                        {/* Detailed groups */}
                        <div className="flex flex-col gap-6">
                            {selectedRecord.groups.filter(g => g.type === activeTab).map((group, groupIdx) => (
                                <section key={groupIdx} className="animate-in fade-in zoom-in-95 duration-300">


                                    {/* Inline Validation Errors for this Tab (General/Summary errors only) */}
                                    {(() => {
                                        // Only show errors that don't have a specific row index here
                                        const groupErrors = selectedRecord.validationResults.filter(v => v.xmlType === group.type && v.index === undefined);
                                        if (groupErrors.length === 0) return null;
                                        return (
                                            <div className="mb-6 space-y-3">
                                                {groupErrors.map((v, i) => (
                                                    <div key={i} className={`p - 4 rounded - xl border flex items - start gap - 4 animate -in slide -in -from - top - 2 duration - 300 ${v.isError ? 'bg-red-50/80 border-red-100' : 'bg-amber-50/80 border-amber-100'} `}>
                                                        <div className={`mt - 0.5 p - 1.5 rounded - lg border shrink - 0 ${v.isError ? 'bg-red-100 border-red-200 text-red-600' : 'bg-amber-100 border-amber-200 text-amber-600'} `}>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                {v.isError
                                                                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                }
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                <span className={`text - [9px] font - black uppercase px - 1.5 py - 0.5 rounded border ${v.isError ? 'bg-red-600 text-white border-red-600' : 'bg-amber-500 text-white border-amber-500'} `}>{v.type}</span>
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{v.field}</span>
                                                            </div>
                                                            <p className={`text - sm font - bold ${v.isError ? 'text-red-900' : 'text-amber-900'} `}>{v.ruleName}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })()}

                                    {['XML2', 'XML3', 'XML4', 'XML5'].includes(group.type) && (
                                        <GenericXmlTable
                                            dataList={getXmlDataList(group)}
                                            xmlType={group.type}
                                            validationResults={selectedRecord.validationResults}
                                            filterMode={filterMode}
                                            setFilterMode={setFilterMode}
                                            isFilterOpen={isFilterOpen}
                                            setIsFilterOpen={setIsFilterOpen}
                                            columnFilters={columnFilters}
                                            handleColumnFilterChange={handleColumnFilterChange}
                                        />
                                    )}

                                    {group.type === 'XML7' && group.data?.CHI_TIEU_DU_LIEU_GIAY_RA_VIEN && (
                                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                                            <div className="flex items-center gap-3 mb-8">
                                                <div className="w-2 h-8 bg-red-600 rounded-full shadow-lg shadow-red-200"></div>
                                                <h3 className="text-xl font-bold text-slate-800">Dữ liệu giấy ra viện (XML7)</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                                {Object.entries(group.data.CHI_TIEU_DU_LIEU_GIAY_RA_VIEN).map(([key, value]: [string, any], i) => (
                                                    value && typeof value !== 'object' && (
                                                        <div key={i} className="flex flex-col border-b border-slate-50 pb-3 group/item">
                                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 group-hover/item:text-red-500 transition-colors">{key}</span>
                                                            <span className="text-sm font-bold text-slate-700">{key.includes('NGAY') || key.includes('THOI_GIAN') ? formatDateTime(value) : renderValue(value)}</span>
                                                        </div>
                                                    )
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {group.type !== 'XML2' && group.type !== 'XML3' && group.type !== 'XML4' && group.type !== 'XML5' && group.type !== 'XML7' && (
                                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-2 h-8 bg-cyan-600 rounded-full shadow-lg shadow-cyan-200"></div>
                                                <h3 className="text-lg font-bold text-slate-800">Dữ liệu tổng hợp ({group.type})</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
                                                {(function renderNested(obj: any, prefix = ''): any[] {
                                                    return Object.entries(obj).flatMap(([key, value]: [string, any]) => {
                                                        if (value && typeof value === 'object' && !value.__cdata) {
                                                            return renderNested(value, `${prefix}${key} > `);
                                                        }
                                                        return value ? [
                                                            <div key={prefix + key} className="flex flex-col border-b border-slate-50 pb-2 group/item">
                                                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 group-hover/item:text-cyan-500 transition-colors">{key}</span>
                                                                <span className="text-xs font-bold text-slate-600 truncate">{(key.includes('NGAY') || key.includes('THOI_GIAN')) ? formatDateTime(value) : renderValue(value)}</span>
                                                            </div>
                                                        ] : [];
                                                    });
                                                })(group.data.TONG_HOP || group.data || {})}
                                            </div>
                                        </div>
                                    )}
                                </section>
                            ))}

                            {activeTab === 'VALIDATION' && (
                                <section className="animate-in fade-in zoom-in-95 duration-300">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="h-px flex-1 bg-slate-200"></div>
                                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 bg-red-50 px-4 py-1.5 rounded-full border border-red-100 italic">
                                            KẾT QUẢ KIỂM TRA DỮ LIỆU
                                        </h2>
                                        <div className="h-px flex-1 bg-slate-200"></div>
                                    </div>

                                    {selectedRecord.validationResults.length === 0 ? (
                                        <div className="bg-green-50 border border-green-100 rounded-3xl p-12 text-center">
                                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            <h3 className="text-xl font-black text-green-900 mb-2">Dữ liệu đạt yêu cầu</h3>
                                            <p className="text-green-700/60 font-medium">Không phát hiện lỗi nào theo các tiêu chí đã cài đặt.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {selectedRecord.validationResults.map((v, i) => (
                                                <div key={i} className={`p - 6 rounded - 2xl border flex items - start gap - 6 transition - all hover: scale - [1.01] ${v.isError ? 'bg-red-50/50 border-red-100' : 'bg-amber-50/50 border-amber-100'
                                                    } `}>
                                                    <div className={`mt - 1 p - 2 rounded - xl border ${v.isError ? 'bg-red-100 border-red-200 text-red-600' : 'bg-amber-100 border-amber-200 text-amber-600'
                                                        } `}>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            {v.isError
                                                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            }
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{v.xmlType} • {v.field || 'General'}</span>
                                                            <span className={`text - [8px] font - black uppercase px - 2 py - 0.5 rounded border ${v.isError ? 'bg-red-600 text-white border-red-600' : 'bg-amber-500 text-white border-amber-500'
                                                                } `}>{v.type}</span>
                                                        </div>
                                                        <h4 className="text-base font-bold text-slate-800 mb-1">{v.ruleName}</h4>
                                                        <p className="text-xs text-slate-500 font-medium">Quy tắc ID: {v.ruleId}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            )}
                        </div>
                    </div>

                    {/* Quick Summary Footer */}
                    <div className="px-8 py-3 bg-slate-900 text-white flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                        <div className="flex items-center gap-6">
                            <span>BN: {renderValue(selectedRecord.summary?.HO_TEN)}</span>
                            <span className="text-white/40">|</span>
                            <span>Mã LK: {renderValue(selectedRecord.summary?.MA_LK)}</span>
                            <span className="text-white/40">|</span>
                            <span>Mã BN: {renderValue(selectedRecord.summary?.MA_BN)}</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <span>Tổng chi phí (BHYT): <span className="text-cyan-400 font-black">{Number(renderValue(selectedRecord.summary?.T_TONGCHI_BH)).toLocaleString()} VND</span></span>
                        </div>
                    </div>
                </div >
            )}

            <RuleSettings
                isOpen={isRuleSettingsOpen}
                onClose={() => setIsRuleSettingsOpen(false)}
                rules={rules}
                onSave={(newRules) => {
                    saveRules(newRules);
                    // Rerun validation on all records using functional update to guarantee fresh state
                    setRecords(prevRecords => {
                        const validator = new ValidationEngine(newRules);
                        return prevRecords.map(r => ({
                            ...r,
                            validationResults: validator.validate(r)
                        }));
                    });
                }}
            />


        </div >
    );
}

const formatDateWithTime = (dateStr: any) => {
    const s = renderValue(dateStr);
    if (s.length >= 12) {
        return (
            <div className="leading-tight">
                <span className="font-bold text-slate-700">{s.substring(6, 8)}/{s.substring(4, 6)}/{s.substring(0, 4)}</span>
                <br />
                <span className="text-xs text-slate-400 font-mono italic">{s.substring(8, 10)}:{s.substring(10, 12)}</span>
            </div>
        );
    }
    return formatDateTime(s);
};
