'use client';

import { useState, useEffect } from 'react';
import { ValidationRule, DEFAULT_RULES, RuleType } from '@/lib/validation';

interface RuleSettingsProps {
    isOpen: boolean;
    onClose: () => void;
    rules: ValidationRule[];
    onSave: (rules: ValidationRule[]) => void;
}

const XML_FIELDS: Record<string, string[]> = {
    'XML1': [
        'MA_LK', 'MA_BN', 'HO_TEN', 'NGAY_SINH', 'GIOI_TINH', 'DIA_CHI', 'MA_THE', 'MA_DKBD',
        'GT_THE_TU', 'GT_THE_DEN', 'MIEN_CUNG_CT', 'TEN_BENH', 'MA_BENH', 'MA_BENHKHAC',
        'MA_LYDO_VVIEN', 'MA_NOI_CHUYEN', 'MA_TAI_NAN', 'NGAY_VAO', 'NGAY_RA', 'SO_NGAY_DTRI',
        'KET_QUA_DTRI', 'TINH_TRANG_RV', 'NGAY_TTOAN', 'T_TONGCHI', 'T_XETNGHIEM', 'T_CDHA',
        'T_THUOC', 'T_MAU', 'T_PTTT', 'T_VTYT', 'T_DVKT_TYLE', 'T_THUOC_TYLE', 'T_VTYT_TYLE',
        'T_KHAM', 'T_GIUONG', 'T_VCHUYEN', 'T_BNTT', 'T_BHTT', 'T_NGUONKHAC', 'T_NGOAIDS',
        'NAM_QT', 'THANG_QT', 'MA_LOAI_KCB', 'MA_KHOA', 'MA_CSKCB', 'MA_KHUVUC', 'MA_PTTT_QT', 'CAN_NANG'
    ],
    'XML2': [
        'MA_LK', 'STT', 'MA_THUOC', 'MA_NHOM', 'TEN_THUOC', 'DON_VI_TINH', 'HAM_LUONG',
        'DUONG_DUNG', 'LIEU_DUNG', 'SO_DANG_KY', 'TT_THAU', 'PHAM_VI', 'TY_LE_TT', 'SO_LUONG',
        'DON_GIA', 'THANH_TIEN', 'MUC_HUONG', 'T_NGUONKHAC', 'T_BNTT', 'T_BHTT', 'T_BNCCT',
        'T_NGOAIDS', 'MA_KHOA', 'MA_BAC_SI', 'MA_BENH', 'NGAY_YL', 'NGAY_KQ', 'MA_PTTT'
    ],
    'XML3': [
        'MA_LK', 'STT', 'MA_DICH_VU', 'MA_VAT_TU', 'MA_NHOM', 'TEN_DICH_VU', 'DON_VI_TINH',
        'SO_LUONG', 'DON_GIA', 'TY_LE_TT', 'THANH_TIEN', 'T_TRANTT', 'MUC_HUONG', 'T_NGUONKHAC',
        'T_BNTT', 'T_BHTT', 'T_BNCCT', 'T_NGOAIDS', 'MA_KHOA', 'MA_GIUONG', 'MA_BAC_SI',
        'MA_BENH', 'NGAY_YL', 'NGAY_TH_YL', 'NGAY_KQ', 'MA_PTTT'
    ],
    'XML4': [
        'MA_LK', 'STT', 'MA_DICH_VU', 'MA_CHI_SO', 'TEN_CHI_SO', 'GIA_TRI', 'DON_VI_DO',
        'MO_TA', 'KET_LUAN', 'NGAY_KQ'
    ],
    'XML5': [
        'MA_LK', 'STT', 'DIEN_BIEN', 'HOI_CHAN', 'PHAU_THUAT', 'NGAY_YL'
    ],
    'XML6': [], // Placeholder
    'XML7': [
        'MA_LK', 'SO_LUU_TRU', 'MA_YTE', 'MA_KHOA', 'NGAY_VAO', 'NGAY_RA', 'MA_BENH',
        'CHAN_DOAN', 'PP_DIEU_TRI', 'LOI_DAN_BS', 'GHI_CHU', 'MA_TTDV', 'NGAY_CT', 'MA_THE_TAM'
    ],
    'XML8': [],
    'XML9': [],
    'XML10': [],
    'XML11': [],
    'XML12': [],
    'XML13': [],
    'XML14': [],
    'XML15': [],
};

const XML_TYPES = Array.from({ length: 15 }, (_, i) => `XML${i + 1}`);

export default function RuleSettings({ isOpen, onClose, rules: initialRules, onSave, isModal = true }: RuleSettingsProps & { isModal?: boolean }) {
    // Initialize state with props, but also sync when props change
    const [rules, setRules] = useState<ValidationRule[]>(initialRules.length > 0 ? initialRules : DEFAULT_RULES);
    const [editingRule, setEditingRule] = useState<ValidationRule | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedXmlType, setSelectedXmlType] = useState<string>('ALL');

    // Sync state when props.rules changes (important for persistence to reflect back)
    useEffect(() => {
        setRules(initialRules);
    }, [initialRules]);

    if (isModal && !isOpen) return null;

    const filteredRules = rules.filter(r => {
        const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.xmlType.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedXmlType === 'ALL' || r.xmlType === selectedXmlType;
        return matchesSearch && matchesType;
    });

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRule) return;

        const newRules = rules.map(r => r.id === editingRule.id ? editingRule : r);
        setRules(newRules);
        onSave(newRules); // Persist immediately
        setEditingRule(null);
    };

    const handleAddNew = () => {
        const newRule: ValidationRule = {
            id: Date.now().toString(),
            active: true,
            type: 'Xuất toán',
            xmlType: selectedXmlType !== 'ALL' ? selectedXmlType : 'XML1', // Default to selected type
            name: 'Quy tắc mới',
            code: ''
        };
        const newRules = [...rules, newRule];
        setRules(newRules);
        setEditingRule(newRule); // Enter edit mode immediately
        onSave(newRules); // Persist immediately
    };

    const handleDelete = (id: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa quy tắc này?')) {
            const newRules = rules.filter(r => r.id !== id);
            setRules(newRules);
            if (editingRule?.id === id) {
                setEditingRule(null);
            }
            onSave(newRules); // Persist immediately
        }
    };

    // Toggle active status
    const handleToggleActive = (id: string, checked: boolean) => {
        const newRules = rules.map(r => r.id === id ? { ...r, active: checked } : r);
        setRules(newRules);
        onSave(newRules); // Persist immediately
    };

    // Conditional styles based on isModal
    const containerClasses = isModal
        ? "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        : "w-full h-full min-h-screen bg-slate-50 flex flex-col";

    const contentClasses = isModal
        ? "bg-white w-full max-w-6xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200"
        : "flex-1 flex flex-col overflow-hidden bg-white/50"; // Simplified for full page

    return (
        <div className={containerClasses}>
            <div className={contentClasses}>
                {/* Header */}
                <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Cài đặt quy tắc kiểm tra</h2>
                    {isModal ? (
                        <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            {/* Non-modal header actions if needed */}
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-hidden flex">
                    {/* Sidebar */}
                    <div className="w-64 bg-slate-50 border-r border-slate-100 flex flex-col overflow-y-auto">
                        <div className="p-4 space-y-1">
                            <button
                                onClick={() => setSelectedXmlType('ALL')}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between group transition-all ${selectedXmlType === 'ALL' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-200' : 'text-slate-600 hover:bg-white hover:shadow-sm'}`}
                            >
                                <span>Tất cả</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] ${selectedXmlType === 'ALL' ? 'bg-cyan-500/50 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                    {rules.length}
                                </span>
                            </button>
                            <div className="my-2 border-b border-slate-100"></div>
                            {XML_TYPES.map(type => {
                                const count = rules.filter(r => r.xmlType === type).length;
                                return (
                                    <button
                                        key={type}
                                        onClick={() => setSelectedXmlType(type)}
                                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between group transition-all ${selectedXmlType === type ? 'bg-white text-cyan-600 shadow-md border border-cyan-100' : 'text-slate-500 hover:bg-white hover:text-slate-700'}`}
                                    >
                                        <span>File {type}</span>
                                        {count > 0 && (
                                            <span className={`px-2 py-0.5 rounded text-[10px] ${selectedXmlType === type ? 'bg-cyan-50 text-cyan-600' : 'bg-slate-200 text-slate-400'}`}>
                                                {count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main List View */}
                    <div className="flex-1 flex flex-col bg-white overflow-hidden">
                        {/* Edit Pane (Moved to Top) */}
                        {editingRule && (
                            <div className="w-full border-b border-slate-100 bg-white p-6 animate-in slide-in-from-top-10 duration-300 shadow-lg z-20 shrink-0 max-h-[60vh] overflow-y-auto">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Chi tiết quy tắc</h3>
                                    <button
                                        onClick={() => setEditingRule(null)}
                                        className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                                <form onSubmit={handleSaveEdit} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Mã lỗi</label>
                                            <input type="text" value={editingRule.id} disabled className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-400" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Sử dụng</label>
                                            <div className="flex items-center h-[38px]">
                                                <input
                                                    type="checkbox"
                                                    checked={editingRule.active}
                                                    onChange={e => setEditingRule({ ...editingRule, active: e.target.checked })}
                                                    className="w-5 h-5 text-cyan-600 rounded-lg border-slate-300 focus:ring-cyan-500 cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tên quy tắc</label>
                                        <input
                                            type="text"
                                            value={editingRule.name}
                                            onChange={e => setEditingRule({ ...editingRule, name: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">File XML</label>
                                            <select
                                                value={editingRule.xmlType}
                                                onChange={e => setEditingRule({ ...editingRule, xmlType: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                                            >
                                                {XML_TYPES.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 space-y-4">
                                        <h4 className="text-sm font-bold text-purple-800">Conditional Application (Optional)</h4>
                                        <p className="text-[11px] text-purple-600">Only apply this rule if another field has a specific value.</p>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-purple-400 tracking-widest">Condition Field</label>
                                                <input
                                                    type="text"
                                                    value={editingRule.conditionField || ''}
                                                    onChange={e => setEditingRule({ ...editingRule, conditionField: e.target.value })}
                                                    placeholder="e.g. MA_NHOM"
                                                    className="w-full px-4 py-2.5 border border-purple-200 bg-white rounded-xl text-sm text-purple-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-purple-400 tracking-widest">Condition Value(s)</label>
                                                <input
                                                    type="text"
                                                    value={editingRule.conditionValue || ''}
                                                    onChange={e => setEditingRule({ ...editingRule, conditionValue: e.target.value })}
                                                    placeholder="e.g. 1, 3, 5 (comma separated)"
                                                    className="w-full px-4 py-2.5 border border-purple-200 bg-white rounded-xl text-sm text-purple-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Trường kiểm tra</label>
                                        <div className="relative">
                                            <select
                                                value={
                                                    (editingRule.field && !XML_FIELDS[editingRule.xmlType]?.includes(editingRule.field)) || editingRule.field === '___CUSTOM___'
                                                        ? '___CUSTOM___'
                                                        : (editingRule.field || '')
                                                }
                                                onChange={e => {
                                                    if (e.target.value === '___CUSTOM___') {
                                                        setEditingRule({ ...editingRule, field: '___CUSTOM___' });
                                                    } else {
                                                        setEditingRule({ ...editingRule, field: e.target.value });
                                                    }
                                                }}
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="">-- Chọn trường --</option>
                                                {(XML_FIELDS[editingRule.xmlType] || []).map(field => (
                                                    <option key={field} value={field}>{field}</option>
                                                ))}
                                                <option value="___CUSTOM___">Khác (Nhập thủ công)...</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                        {((editingRule.field && !XML_FIELDS[editingRule.xmlType]?.includes(editingRule.field)) || editingRule.field === '___CUSTOM___') && (
                                            <input
                                                type="text"
                                                autoFocus
                                                value={editingRule.field === '___CUSTOM___' ? '' : editingRule.field}
                                                placeholder="Nhập mã trường..."
                                                className="mt-2 w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                                                onChange={e => setEditingRule({ ...editingRule, field: e.target.value })}
                                            />
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Biểu thức điều kiện (Code)</label>
                                        <textarea
                                            rows={4}
                                            value={editingRule.code}
                                            onChange={e => setEditingRule({ ...editingRule, code: e.target.value })}
                                            placeholder="NGAY_YL < XML1.NGAY_VAO"
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all resize-none bg-slate-50"
                                        />
                                        <p className="text-[10px] text-slate-400 italic">Dùng dấu so sánh: &lt;, &gt;, === null, v.v.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nội dung báo lỗi (Message)</label>
                                        <input
                                            type="text"
                                            value={editingRule.errorMessage || ''}
                                            onChange={e => setEditingRule({ ...editingRule, errorMessage: e.target.value })}
                                            placeholder="Nhập nội dung thông báo lỗi hiển thị cho người dùng..."
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all placeholder:font-normal"
                                        />
                                    </div>

                                    <div className="flex items-center gap-3 pt-4 border-t border-slate-50 mt-8">
                                        <button
                                            type="submit"
                                            className="flex-1 px-8 py-3 bg-cyan-600 text-white rounded-xl text-sm font-black tracking-widest uppercase hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-200"
                                        >
                                            Lưu thay đổi
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditingRule(null)}
                                            className="px-8 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-black tracking-widest uppercase hover:bg-slate-50 transition-all"
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="p-6 flex items-center justify-between gap-4 border-b border-slate-50 shrink-0">
                            <div className="relative flex-1 max-w-md">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </span>
                                <input
                                    type="text"
                                    placeholder={`Tìm kiếm trong ${selectedXmlType === 'ALL' ? 'tất cả' : selectedXmlType}...`}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:bg-white transition-all outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={handleAddNew}
                                className="px-5 py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-bold hover:bg-cyan-700 transition-all flex items-center gap-2 shadow-lg shadow-cyan-200"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                Thêm quy tắc {selectedXmlType !== 'ALL' ? selectedXmlType : ''}
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead className="bg-slate-50/80 sticky top-0 border-b border-slate-100">
                                        <tr>
                                            <th className="py-4 px-4 font-bold text-slate-400 w-16 text-center">ID</th>
                                            <th className="py-4 px-4 font-bold text-slate-400 w-16 text-center">Bật</th>

                                            <th className="py-4 px-4 font-bold text-slate-400 w-20">File</th>
                                            <th className="py-4 px-4 font-bold text-slate-400 w-32">Trường</th>
                                            <th className="py-4 px-4 font-bold text-slate-400">Nội dung lỗi</th>
                                            <th className="py-4 px-4 w-24"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredRules.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                                                    Chưa có quy tắc nào cho {selectedXmlType !== 'ALL' ? selectedXmlType : 'mục này'}
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredRules.map((rule) => (
                                                <tr key={rule.id} className="hover:bg-cyan-50/20 transition-colors group">
                                                    <td className="py-4 px-4 text-center font-mono text-slate-400">{rule.id}</td>
                                                    <td className="py-4 px-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={rule.active}
                                                            onChange={(e) => handleToggleActive(rule.id, e.target.checked)}
                                                            className="w-4 h-4 text-cyan-600 rounded border-slate-300 focus:ring-cyan-500 cursor-pointer"
                                                        />
                                                    </td>

                                                    <td className="py-4 px-4 font-bold text-slate-600">{rule.xmlType}</td>
                                                    <td className="py-4 px-4 font-mono text-slate-500">{rule.field || '-'}</td>
                                                    <td className="py-4 px-4 font-medium text-slate-900">{rule.errorMessage || rule.name}</td>
                                                    <td className="py-4 px-4 text-right flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => setEditingRule(rule)}
                                                            className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all"
                                                            title="Chỉnh sửa"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(rule.id)}
                                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                            title="Xóa"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" /></svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>


                </div>

                {/* Footer buttons (Conditional) */}
                {isModal && (
                    <div className="px-8 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white shrink-0">
                        <button onClick={onClose} className="px-10 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-black tracking-widest uppercase hover:bg-slate-900 transition-all shadow-xl shadow-slate-200">
                            Đóng
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
