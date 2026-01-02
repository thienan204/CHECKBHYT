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
        'MO_TA', 'KET_LUAN', 'NGAY_KQ', 'MA_BS_DOC_KQ'
    ],
    'XML5': [
        'MA_LK', 'STT', 'DIEN_BIEN', 'HOI_CHAN', 'PHAU_THUAT', 'NGAY_YL'
    ],
    'XML6': [],
    'XML7': [
        'MA_LK', 'SO_LUU_TRU', 'MA_YTE', 'MA_KHOA', 'NGAY_VAO', 'NGAY_RA', 'MA_BENH',
        'CHAN_DOAN', 'PP_DIEU_TRI', 'LOI_DAN_BS', 'GHI_CHU', 'MA_TTDV', 'NGAY_CT', 'MA_THE_TAM',
        'HO_TEN_CHA', 'HO_TEN_ME', 'NGUOI_GIAM_HO'
    ],
    'XML8': ['MA_LK', 'MA_LO', 'CO_SO_SX', 'HAN_DUNG', 'SO_LUONG'],
    'XML9': [
        'MA_LK', 'MA_BHXH_NND', 'MA_THE_NND', 'HO_TEN_NND', 'NGAYSINH_NND', 'MA_DANTOC_NND',
        'SO_CCCD_NND', 'NGAYCAP_CCCD_NND', 'NOICAP_CCCD_NND', 'NOI_CU_TRU_NND', 'MA_QUOCTICH',
        'MATINH_CU_TRU', 'MAXA_CU_TRU', 'HO_TEN_CHA', 'MA_THE_TAM', 'HO_TEN_CON', 'GIOI_TINH_CON',
        'SO_CON', 'LAN_SINH', 'SO_CON_SONG', 'CAN_NANG_CON', 'NGAY_SINH_CON', 'NOI_SINH_CON',
        'TINH_TRANG_CON', 'SINHCON_PHAUTHUAT', 'SINHCON_DUOI32TUAN', 'GHI_CHU', 'NGUOI_DO_DE',
        'NGAY_CT', 'SO', 'QUYEN_SO', 'NGUOI_GHI_PHIEU'
    ],
    'XML10': [],
    'XML11': [
        'MA_LK', 'S0_SERI', 'SO_CT', 'NGAY_CT', 'MA_NHOM', 'MA_DV', 'THANH_TIEN',
        'THUE_SUAT', 'TIEN_THUE', 'TONG_TIEN', 'TY_LE', 'MA_TIEU_CHI'
    ],
    'XML12': [],
    'XML13': ['MA_LK', 'SO_HO_SO', 'MA_TTHC', 'MA_DOI_TUONG_KCB', 'NGAY_KY', 'NGUOI_KY'],
    'XML14': ['MA_LK', 'SO_GIAY_HEN', 'NGAY_HEN'],
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

    console.log('RuleSettings debug:', {
        rulesCount: rules.length,
        searchTerm,
        selectedXmlType,
        sampleRule: rules[0]
    });

    const filteredRules = rules.filter(r => {
        // Safe access guards
        const name = r.name || '';
        const xmlType = r.xmlType || '';

        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            xmlType.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedXmlType === 'ALL' || xmlType === selectedXmlType;
        return matchesSearch && matchesType;
    });

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRule) return;

        // Check if it's a NEW rule or update
        // Logic: if ID exists in rules list -> update. Else -> new.
        const isExisting = rules.some(r => r.id === editingRule.id);

        let newRules;
        if (isExisting) {
            newRules = rules.map(r => r.id === editingRule.id ? editingRule : r);
        } else {
            newRules = [...rules, { ...editingRule, createdAt: new Date() } as ValidationRule];
        }

        setRules(newRules);
        onSave(newRules); // Persist immediately
        setEditingRule(null);
        alert('Đã lưu quy tắc thành công!');
    };

    const handleAddNew = () => {
        const newRule: ValidationRule = {
            id: Date.now().toString(),
            active: true,
            type: 'Xuất toán',
            xmlType: selectedXmlType !== 'ALL' ? selectedXmlType : 'XML1', // Default to selected type
            name: 'Quy tắc mới',
            code: '',
            mathExpression: '',
            errorMessage: '',
            description: '',
            field: '',
            conditionField: '',
            conditionValue: ''
        };
        // DO NOT add to rules list yet. Just open modal.
        setEditingRule(newRule);
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
                        {/* Edit Modal Overlay */}
                        {editingRule && (
                            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-slate-200 flex flex-col animate-in zoom-in-95 duration-200">
                                    {/* Modal Header */}
                                    <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                                        <div>
                                            <h3 className="text-xl font-black text-slate-800 tracking-tight">
                                                {rules.some(r => r.id === editingRule.id) ? 'Cập nhật quy tắc' : 'Thêm quy tắc mới'}
                                            </h3>
                                            <p className="text-xs text-slate-500 font-medium mt-1">Thiết lập các thông số kiểm tra logic cho hồ sơ XML</p>
                                        </div>
                                        <button
                                            onClick={() => setEditingRule(null)}
                                            className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto bg-slate-50/50">
                                        <form onSubmit={handleSaveEdit} className="p-8">
                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                                {/* LEFT COLUMN: General Info */}
                                                <div className="lg:col-span-5 space-y-6">
                                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                            </div>
                                                            <h4 className="text-sm font-black uppercase text-slate-700 tracking-wide">Thông tin chung</h4>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Mã lỗi (ID)</label>
                                                                    <input type="text" value={editingRule.id} disabled className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-400 cursor-not-allowed" />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Trạng thái</label>
                                                                    <label className={`block w-full px-3 py-2 rounded-lg border cursor-pointer transition-all ${editingRule.active ? 'bg-cyan-50 border-cyan-200' : 'bg-slate-50 border-slate-200'}`}>
                                                                        <div className="flex items-center justify-between">
                                                                            <span className={`text-xs font-bold ${editingRule.active ? 'text-cyan-700' : 'text-slate-500'}`}>
                                                                                {editingRule.active ? 'Đang bật' : 'Đang tắt'}
                                                                            </span>
                                                                            <div className={`w-8 h-4 rounded-full relative transition-colors ${editingRule.active ? 'bg-cyan-500' : 'bg-slate-300'}`}>
                                                                                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${editingRule.active ? 'left-[18px]' : 'left-0.5'}`}></div>
                                                                            </div>
                                                                        </div>
                                                                        <input
                                                                            type="checkbox"
                                                                            className="hidden"
                                                                            checked={editingRule.active}
                                                                            onChange={e => setEditingRule({ ...editingRule, active: e.target.checked })}
                                                                        />
                                                                    </label>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-1.5">
                                                                <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Tên quy tắc</label>
                                                                <input
                                                                    type="text"
                                                                    value={editingRule.name}
                                                                    onChange={e => setEditingRule({ ...editingRule, name: e.target.value })}
                                                                    placeholder="VD: Kiểm tra ngày vào viện"
                                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                                                                />
                                                            </div>

                                                            <div className="space-y-1.5">
                                                                <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">File XML</label>
                                                                <div className="relative">
                                                                    <select
                                                                        value={editingRule.xmlType}
                                                                        onChange={e => setEditingRule({ ...editingRule, xmlType: e.target.value })}
                                                                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all appearance-none cursor-pointer"
                                                                    >
                                                                        {XML_TYPES.map(type => (
                                                                            <option key={type} value={type}>{type}</option>
                                                                        ))}
                                                                    </select>
                                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-1.5">
                                                                <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Trường kiểm tra</label>
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
                                                                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-700 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all appearance-none cursor-pointer"
                                                                    >
                                                                        <option value="">-- Chọn trường --</option>
                                                                        {(XML_FIELDS[editingRule.xmlType] || []).map(field => (
                                                                            <option key={field} value={field}>{field}</option>
                                                                        ))}
                                                                        <option value="___CUSTOM___">Khác (Nhập thủ công)...</option>
                                                                    </select>
                                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                                                    </div>
                                                                </div>
                                                                {((editingRule.field && !XML_FIELDS[editingRule.xmlType]?.includes(editingRule.field)) || editingRule.field === '___CUSTOM___') && (
                                                                    <input
                                                                        type="text"
                                                                        value={editingRule.field === '___CUSTOM___' ? '' : editingRule.field}
                                                                        placeholder="Nhập mã trường thủ công..."
                                                                        className="mt-2 w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                                                                        onChange={e => setEditingRule({ ...editingRule, field: e.target.value })}
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* RIGHT COLUMN: Logic & Settings */}
                                                <div className="lg:col-span-7 space-y-6">
                                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5 h-full flex flex-col">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                                            </div>
                                                            <h4 className="text-sm font-black uppercase text-slate-700 tracking-wide">Thiết lập Logic</h4>
                                                        </div>

                                                        {/* Code Block */}
                                                        <div className="space-y-1.5 flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Biểu thức kiểm tra</label>
                                                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold cursor-help" title="Ví dụ: NGAY_YL < XML1.NGAY_VAO">Hỗ trợ cú pháp</span>
                                                            </div>
                                                            <div className="relative h-32 lg:h-40">
                                                                <textarea
                                                                    value={editingRule.code}
                                                                    onChange={e => setEditingRule({ ...editingRule, code: e.target.value })}
                                                                    placeholder="VD: NGAY_YL < XML1.NGAY_VAO"
                                                                    className="w-full h-full p-4 border border-slate-300 rounded-xl text-sm font-mono font-medium focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all resize-none bg-slate-50 text-slate-800 leading-relaxed"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Math Expression Block */}
                                                        <div className="space-y-1.5 flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Biểu thức toán học</label>
                                                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold cursor-help" title="Ví dụ: XML1.TONG_CHI - XML2.THANH_TIEN">Hỗ trợ cú pháp</span>
                                                            </div>
                                                            <div className="relative">
                                                                <input
                                                                    type="text"
                                                                    value={editingRule.mathExpression || ''}
                                                                    onChange={e => setEditingRule({ ...editingRule, mathExpression: e.target.value })}
                                                                    placeholder="VD: A + B * C"
                                                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm font-mono font-medium focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all bg-slate-50 text-slate-800"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Condition Block */}
                                                        <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                                                                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Điều kiện áp dụng (Tùy chọn)</h4>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-1">
                                                                    <label className="text-[9px] font-bold uppercase text-slate-400">Trường điều kiện</label>
                                                                    <input
                                                                        type="text"
                                                                        value={editingRule.conditionField || ''}
                                                                        onChange={e => setEditingRule({ ...editingRule, conditionField: e.target.value })}
                                                                        placeholder="VD: MA_NHOM"
                                                                        className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-mono focus:border-cyan-500 outline-none transition-all"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[9px] font-bold uppercase text-slate-400">Giá trị cho phép</label>
                                                                    <input
                                                                        type="text"
                                                                        value={editingRule.conditionValue || ''}
                                                                        onChange={e => setEditingRule({ ...editingRule, conditionValue: e.target.value })}
                                                                        placeholder="VD: 1, 2, 3"
                                                                        className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-mono focus:border-cyan-500 outline-none transition-all"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <label className="text-[11px] font-bold uppercase text-red-400 tracking-wider">Nội dung báo lỗi</label>
                                                            <textarea
                                                                rows={2}
                                                                value={editingRule.errorMessage || ''}
                                                                onChange={e => setEditingRule({ ...editingRule, errorMessage: e.target.value })}
                                                                placeholder="Nhập nội dung thông báo lỗi hiển thị cho người dùng..."
                                                                className="w-full px-4 py-3 border border-red-100 bg-red-50/30 rounded-xl text-sm font-medium text-red-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all placeholder:text-red-300/70 resize-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="pt-6 flex items-center justify-end gap-3 mt-4 border-t border-slate-200/50">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingRule(null)}
                                                    className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-95"
                                                >
                                                    Hủy bỏ
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-cyan-200 transition-all active:scale-95 flex items-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                    {rules.some(r => r.id === editingRule.id) ? 'Lưu cập nhật' : 'Tạo quy tắc mới'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
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
