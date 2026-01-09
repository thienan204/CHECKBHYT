'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Tag, message, Card, Breadcrumb, Select, Space, Tooltip } from 'antd';
import { FileExcelOutlined, ArrowLeftOutlined, FilterOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { loadRecordsFromDB } from '@/lib/db';
import { ExtendedHosoRecord, getXmlDataList } from '@/lib/xml';

// --- Helper Functions ---
const renderValue = (val: any) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') {
        return val.__cdata !== undefined ? String(val.__cdata) : '';
    }
    return String(val);
};

const formatDateTime = (dateStr: any) => {
    const s = renderValue(dateStr);
    if (!s) return '';
    if (s.length === 12) { // YYYYMMDDHHmm
        return `${s.substring(6, 8)}/${s.substring(4, 6)}/${s.substring(0, 4)} ${s.substring(8, 10)}:${s.substring(10, 12)}`;
    }
    if (s.length >= 14) {
        return `${s.substring(6, 8)}/${s.substring(4, 6)}/${s.substring(0, 4)} ${s.substring(8, 10)}:${s.substring(10, 12)}`;
    }
    if (s.length >= 8) {
        return `${s.substring(6, 8)}/${s.substring(4, 6)}/${s.substring(0, 4)}`;
    }
    return s;
};

// --- Types ---
interface ReportRow {
    key: string;
    stt: number;
    ma_lk: string;
    ma_bn: string;
    ho_ten: string;
    ma_the: string;
    ngay_vao: string;
    ngay_ra: string;
    ngay_yl: string;
    ngay_th_yl: string;
    ngay_kq: string;
    ngay_vao_noi_tru: string;
    ma_dv: string;
    ten_dv: string;
    chi_tiet_loi: string;
    isError: boolean;
}

export default function ReportPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialFilter = searchParams.get('filter') as 'ALL' | 'ERROR' | 'VALID' || 'ALL';

    const [loading, setLoading] = useState(true);
    const [fullDataSource, setFullDataSource] = useState<ReportRow[]>([]);
    const [filterType, setFilterType] = useState<'ALL' | 'ERROR' | 'VALID'>(initialFilter);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const records = await loadRecordsFromDB();
                const rows: ReportRow[] = [];
                let index = 1;

                records.forEach((record) => {
                    const errors = record.validationResults.filter(v => v.isError);
                    const ngayVaoNoiTru = formatDateTime(record.summary?.NGAY_VAO_NOI_TRU);

                    if (errors.length === 0) {
                        rows.push({
                            key: `${record.id}_valid`,
                            stt: index++,
                            ma_lk: renderValue(record.summary?.MA_LK),
                            ma_bn: renderValue(record.summary?.MA_BN),
                            ho_ten: renderValue(record.summary?.HO_TEN),
                            ma_the: renderValue(record.summary?.MA_THE_BHYT),
                            ngay_vao: formatDateTime(record.summary?.NGAY_VAO),
                            ngay_ra: formatDateTime(record.summary?.NGAY_RA),
                            ngay_yl: '',
                            ngay_th_yl: '',
                            ngay_kq: '',
                            ngay_vao_noi_tru: ngayVaoNoiTru,
                            ma_dv: '',
                            ten_dv: '',
                            chi_tiet_loi: '',
                            isError: false
                        });
                    } else {
                        errors.forEach((err, errIdx) => {
                            let code = '';
                            let name = '';
                            let ngayYL = '';
                            let ngayTHYL = '';
                            let ngayKQ = '';

                            if (err.xmlType && err.index !== undefined) {
                                const group = record.groups.find(g => g.type === err.xmlType);
                                if (group) {
                                    const list = getXmlDataList(group);
                                    const item = list[err.index];
                                    if (item) {
                                        code = item.MA_DICH_VU || item.MA_THUOC || item.MA_VAT_TU || '';
                                        name = item.TEN_DICH_VU || item.TEN_THUOC || item.TEN_VAT_TU || '';
                                        ngayYL = formatDateTime(item.NGAY_YL);
                                        ngayTHYL = formatDateTime(item.NGAY_TH_YL);
                                        ngayKQ = formatDateTime(item.NGAY_KQ);
                                    }
                                }
                            }

                            rows.push({
                                key: `${record.id}_error_${errIdx}`,
                                stt: index++, // Excel usually increments row count
                                ma_lk: renderValue(record.summary?.MA_LK),
                                ma_bn: renderValue(record.summary?.MA_BN),
                                ho_ten: renderValue(record.summary?.HO_TEN),
                                ma_the: renderValue(record.summary?.MA_THE_BHYT),
                                ngay_vao: formatDateTime(record.summary?.NGAY_VAO),
                                ngay_ra: formatDateTime(record.summary?.NGAY_RA),
                                ngay_yl: ngayYL,
                                ngay_th_yl: ngayTHYL,
                                ngay_kq: ngayKQ,
                                ngay_vao_noi_tru: ngayVaoNoiTru,
                                ma_dv: renderValue(code),
                                ten_dv: renderValue(name),
                                chi_tiet_loi: `[${err.xmlType}] ${err.message || err.ruleName}`,
                                isError: true
                            });
                        });
                    }
                });

                setFullDataSource(rows);
            } catch (error) {
                console.error("Error loading data:", error);
                message.error("Lỗi tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter Logic
    const filteredDataSource = useMemo(() => {
        if (filterType === 'ALL') return fullDataSource;
        if (filterType === 'ERROR') return fullDataSource.filter(r => r.isError);
        if (filterType === 'VALID') return fullDataSource.filter(r => !r.isError);
        return fullDataSource;
    }, [fullDataSource, filterType]);

    // Update URL when filter changes
    const handleFilterChange = (value: 'ALL' | 'ERROR' | 'VALID') => {
        setFilterType(value);
        router.replace(`?filter=${value}`);
    };

    const handleExportExcel = async () => {
        if (filteredDataSource.length === 0) {
            message.warning("Không có dữ liệu để xuất");
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Báo cáo lỗi');
        worksheet.columns = [
            { header: 'STT', key: 'stt', width: 5 },
            { header: 'Mã LK', key: 'ma_lk', width: 14 },
            { header: 'Mã BN', key: 'ma_bn', width: 14 },
            { header: 'Họ tên', key: 'ho_ten', width: 25 },
            { header: 'Mã thẻ', key: 'ma_the', width: 20 },
            { header: 'Ngày vào', key: 'ngay_vao', width: 16 },
            { header: 'Ngày ra', key: 'ngay_ra', width: 16 },
            { header: 'Ngày YL', key: 'ngay_yl', width: 16 },
            { header: 'Ngày TH YL', key: 'ngay_th_yl', width: 16 },
            { header: 'Ngày KQ', key: 'ngay_kq', width: 16 },
            { header: 'Ngày Vào Nội Trú', key: 'ngay_vao_noi_tru', width: 16 },
            { header: 'Mã DV/Thuốc', key: 'ma_dv', width: 15 },
            { header: 'Tên DV/Thuốc', key: 'ten_dv', width: 40 },
            { header: 'Chi tiết lỗi', key: 'chi_tiet_loi', width: 60 },
        ];
        worksheet.getRow(1).font = { bold: true };

        // Recalculate STT for export
        filteredDataSource.forEach((row, idx) => {
            worksheet.addRow({ ...row, stt: idx + 1 });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `Bao_cao_${filterType}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const renderCopyable = (text: string) => {
        if (!text) return text;
        return (
            <Tooltip title="Click để copy">
                <span
                    className="cursor-pointer hover:text-blue-600 hover:underline transition-colors block truncate"
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent row click
                        navigator.clipboard.writeText(text);
                        message.success('Đã copy: ' + text);
                    }}
                >
                    {text}
                </span>
            </Tooltip>
        );
    };

    const columns = [
        { title: 'STT', dataIndex: 'stt', key: 'stt', width: 50, fixed: 'left' as const, align: 'center' as const, render: (_: any, __: any, index: number) => index + 1 },
        { title: 'Mã LK', dataIndex: 'ma_lk', key: 'ma_lk', width: 120, fixed: 'left' as const, render: renderCopyable },
        { title: 'Mã BN', dataIndex: 'ma_bn', key: 'ma_bn', width: 120, render: renderCopyable },
        { title: 'Họ tên', dataIndex: 'ho_ten', key: 'ho_ten', width: 180, render: renderCopyable },
        { title: 'Mã thẻ', dataIndex: 'ma_the', key: 'ma_the', width: 150, render: renderCopyable },
        { title: 'Ngày vào', dataIndex: 'ngay_vao', key: 'ngay_vao', width: 140, render: renderCopyable },
        { title: 'Ngày ra', dataIndex: 'ngay_ra', key: 'ngay_ra', width: 140, render: renderCopyable },
        { title: 'Ngày YL', dataIndex: 'ngay_yl', key: 'ngay_yl', width: 140, render: renderCopyable },
        { title: 'Ngày TH YL', dataIndex: 'ngay_th_yl', key: 'ngay_th_yl', width: 140, render: renderCopyable },
        { title: 'Ngày KQ', dataIndex: 'ngay_kq', key: 'ngay_kq', width: 140, render: renderCopyable },
        { title: 'Ngày Vào NT', dataIndex: 'ngay_vao_noi_tru', key: 'ngay_vao_noi_tru', width: 140, render: renderCopyable },
        { title: 'Mã DV/Thuốc', dataIndex: 'ma_dv', key: 'ma_dv', width: 120, render: renderCopyable },
        {
            title: 'Tên DV/Thuốc', dataIndex: 'ten_dv', key: 'ten_dv', width: 250, ellipsis: true, render: (text: string) => (
                <Tooltip title={text}>
                    <span
                        className="cursor-pointer hover:text-blue-600 hover:underline transition-colors block truncate"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(text);
                            message.success('Đã copy tên dịch vụ');
                        }}
                    >
                        {text}
                    </span>
                </Tooltip>
            )
        },
        {
            title: 'Chi tiết lỗi',
            dataIndex: 'chi_tiet_loi',
            key: 'chi_tiet_loi',
            width: 300,
            render: (text: string) => text ? (
                <Tooltip title={text}>
                    <span
                        className="cursor-pointer text-red-600 block hover:underline"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(text);
                            message.success('Đã copy lỗi');
                        }}
                    >
                        {text}
                    </span>
                </Tooltip>
            ) : <Tag color="success">Hợp lệ</Tag>,
            filters: [
                { text: 'Chỉ có lỗi', value: 'hasError' },
                { text: 'Hợp lệ', value: 'valid' }
            ],
            onFilter: (value: any, record: ReportRow) => {
                if (value === 'hasError') return record.isError;
                if (value === 'valid') return !record.isError;
                return true;
            },
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6 pt-12">
            <div className="max-w-[1800px] mx-auto space-y-6">
                <Breadcrumb
                    items={[
                        { title: <Link href="/">Trang chủ</Link> },
                        { title: 'Báo cáo chi tiết' },
                    ]}
                />

                <Card
                    title={
                        <div className="flex items-center gap-3">
                            <Link href="/">
                                <Button icon={<ArrowLeftOutlined />} type="text" shape="circle" />
                            </Link>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">
                                Báo cáo chi tiết
                            </span>
                        </div>
                    }
                    extra={
                        <Space>
                            <Select
                                value={filterType}
                                onChange={handleFilterChange}
                                style={{ width: 160 }}
                                options={[
                                    { value: 'ALL', label: 'Tất cả hồ sơ' },
                                    { value: 'ERROR', label: 'Chỉ hồ sơ lỗi' },
                                    { value: 'VALID', label: 'Chỉ hồ sơ đúng' }
                                ]}
                            />
                            <Button
                                type="primary"
                                icon={<FileExcelOutlined />}
                                onClick={handleExportExcel}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                Xuất Excel
                            </Button>
                        </Space>
                    }
                    variant="borderless"
                    className="shadow-md rounded-2xl"
                >
                    <Table
                        dataSource={filteredDataSource}
                        columns={columns}
                        loading={loading}
                        scroll={{ x: 1800, y: 'calc(100vh - 250px)' }}
                        pagination={{
                            defaultPageSize: 20,
                            showSizeChanger: true,
                            pageSizeOptions: ['20', '50', '100', '500'],
                            showTotal: (total) => `Tổng ${total} bản ghi`
                        }}
                        size="small"
                        rowClassName={(record) => record.isError ? "bg-red-50/50 hover:bg-red-50" : ""}
                        bordered
                    />
                </Card>
            </div>
        </div>
    );
}
