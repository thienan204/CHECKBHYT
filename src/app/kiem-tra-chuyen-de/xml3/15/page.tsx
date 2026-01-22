'use client';

import React, { useState, useEffect } from 'react';
import { Table, Input, Card, Tag, Button, Tooltip, Breadcrumb, message } from 'antd';
import { loadRecordsFromDB } from '@/lib/db';
import { getXmlDataList, ExtendedHosoRecord } from '@/lib/xml';
import { SearchOutlined, ReloadOutlined, AuditOutlined, FileExcelOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import type { ColumnsType } from 'antd/es/table';

// Helper to format values
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
    if (s.length >= 12) {
        return `${s.substring(6, 8)}/${s.substring(4, 6)}/${s.substring(0, 4)} ${s.substring(8, 10)}:${s.substring(10, 12)}`;
    }
    if (s.length >= 8) {
        return `${s.substring(6, 8)}/${s.substring(4, 6)}/${s.substring(0, 4)}`;
    }
    return s;
};

export default function KiemTraChuyenDeXml3Group15Page() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([]);
    const [searchText, setSearchText] = useState('');
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [departments, setDepartments] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchDepts = async () => {
            try {
                const res = await fetch('/api/departments');
                if (res.ok) {
                    const data = await res.json();
                    const map: Record<string, string> = {};
                    data.forEach((d: any) => map[d.ma_khoa] = d.ten_khoa);
                    setDepartments(map);
                }
            } catch (e) {
                console.error("Error fetching departments", e);
            }
        };
        fetchDepts();
        loadData();
    }, []);

    useEffect(() => {
        if (!searchText) {
            setFilteredData(data);
        } else {
            const lower = searchText.toLowerCase();
            const filtered = data.filter(item =>
                String(item.MA_LK || '').toLowerCase().includes(lower) ||
                String(item.HO_TEN || '').toLowerCase().includes(lower) ||
                String(item.MA_DICH_VU || '').toLowerCase().includes(lower) ||
                String(item.TEN_DICH_VU || '').toLowerCase().includes(lower)
            );
            setFilteredData(filtered);
        }
    }, [searchText, data]);

    const loadData = async () => {
        setLoading(true);
        try {
            const records = await loadRecordsFromDB();
            const xml3Items: any[] = [];

            records.forEach(record => {
                const xml3Group = record.groups.find(g => g.type === 'XML3');
                if (xml3Group) {
                    const items = getXmlDataList(xml3Group);
                    items.forEach(item => {
                        // Only include Group 15
                        if (String(item.MA_NHOM) === '15') {
                            // Flatten and add parent info
                            xml3Items.push({
                                ...item,
                                // Unique key for table
                                __key: `${record.id}_${item.MA_DICH_VU}_${Math.random()}`,
                                // Parent Info
                                // Note: MA_KHOA comes from 'item' (XML3), allowing tracking of dept transfers
                                MA_LK: record.summary?.MA_LK,
                                MA_BN: record.summary?.MA_BN,
                                HO_TEN: record.summary?.HO_TEN,
                                NGAY_SINH: record.summary?.NGAY_SINH,
                                NGAY_VAO: record.summary?.NGAY_VAO,
                                NGAY_RA: record.summary?.NGAY_RA,
                                originalRecord: record
                            });
                        }
                    });
                }
            });
            setData(xml3Items);
            setFilteredData(xml3Items);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCellClick = (e: React.MouseEvent, val: any) => {
        e.stopPropagation();
        const textToCopy = renderValue(val);
        if (!textToCopy) return;
        navigator.clipboard.writeText(textToCopy).then(() => {
            message.success(`Đã copy: ${textToCopy}`);
        }).catch(() => { });
    };

    const sharedOnCell = (dataIndex: string) => (record: any) => ({
        onClick: (e: React.MouseEvent) => handleCellClick(e, record[dataIndex]),
        style: { cursor: 'pointer' },
        title: 'Click để copy giá trị này'
    });

    // Special handling for calculated/rendered columns if needed, but dataIndex is usually sufficient for raw value.
    // For 'Ten Khoa', dataIndex is MA_KHOA, but we want name.

    const columns: ColumnsType<any> = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            align: 'center',
            render: (_, __, i) => i + 1,
            fixed: 'left',
        },
        {
            title: 'Mã LK',
            dataIndex: 'MA_LK',
            key: 'MA_LK',
            width: 120,
            fixed: 'left',
            onCell: sharedOnCell('MA_LK'),
            render: (text) => <span className="font-bold text-blue-600">{renderValue(text)}</span>,
            sorter: (a, b) => String(a.MA_LK).localeCompare(String(b.MA_LK)),
        },
        {
            title: 'Họ Tên',
            dataIndex: 'HO_TEN',
            key: 'HO_TEN',
            width: 150,
            fixed: 'left',
            onCell: sharedOnCell('HO_TEN'),
            render: (text) => <span className="text-slate-700 font-medium">{renderValue(text)}</span>,
            sorter: (a, b) => String(a.HO_TEN).localeCompare(String(b.HO_TEN)),
        },
        {
            title: 'Mã Khoa',
            dataIndex: 'MA_KHOA',
            key: 'MA_KHOA_COL',
            width: 100,
            onCell: sharedOnCell('MA_KHOA'),
            render: (text) => <span className="font-bold text-blue-700">{renderValue(text)}</span>
        },
        {
            title: 'Tên Khoa',
            dataIndex: 'MA_KHOA',
            key: 'TEN_KHOA_COL',
            width: 200,
            onCell: (record) => ({
                onClick: (e) => handleCellClick(e, departments[record.MA_KHOA] || ''),
                style: { cursor: 'pointer' },
                title: 'Click để copy tên khoa'
            }),
            render: (text) => <span className="text-slate-600">{departments[renderValue(text)] || ''}</span>
        },
        // Only essential columns for bed checking
        {
            title: 'Mã Giường',
            dataIndex: 'MA_GIUONG',
            key: 'MA_GIUONG',
            width: 120,
            onCell: sharedOnCell('MA_GIUONG'),
            render: (text) => <Tag color="geekblue">{renderValue(text) || '(Trống)'}</Tag>
        },
        {
            title: 'Ngày YL',
            dataIndex: 'NGAY_YL',
            key: 'NGAY_YL',
            width: 120,
            onCell: (record) => ({
                onClick: (e) => handleCellClick(e, formatDateTime(record.NGAY_YL)),
                style: { cursor: 'pointer' },
                title: 'Click để copy Ngày YL'
            }),
            render: (text) => formatDateTime(text),
            defaultSortOrder: 'ascend',
            sorter: (a, b) => String(a.NGAY_YL).localeCompare(String(b.NGAY_YL)),
        },
        {
            title: 'Ngày KQ',
            dataIndex: 'NGAY_KQ',
            key: 'NGAY_KQ',
            width: 120,
            onCell: (record) => ({
                onClick: (e) => handleCellClick(e, formatDateTime(record.NGAY_KQ)),
                style: { cursor: 'pointer' },
                title: 'Click để copy Ngày KQ'
            }),
            render: (text) => formatDateTime(text)
        },
        {
            title: 'Mã Dịch Vụ',
            dataIndex: 'MA_DICH_VU',
            key: 'MA_DICH_VU',
            width: 150,
            onCell: sharedOnCell('MA_DICH_VU'),
            render: (text) => <span className="font-mono text-slate-700">{renderValue(text)}</span>,
        },
        {
            title: 'Tên Dịch Vụ',
            dataIndex: 'TEN_DICH_VU',
            key: 'TEN_DICH_VU',
            width: 250,
            onCell: sharedOnCell('TEN_DICH_VU'),
            render: (text) => (
                <Tooltip title={renderValue(text)}>
                    <div className="truncate">{renderValue(text)}</div>
                </Tooltip>
            )
        },
    ];

    const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);

    const handleRowClick = (record: any) => {
        // Row click now only selects row, doesn't copy JSON
        setSelectedRowKey(record.__key);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Breadcrumb
                        items={[
                            { title: 'Kiểm tra chuyên đề' },
                            { title: <a href="/kiem-tra-chuyen-de/xml3">XML3</a> },
                            { title: 'Nhóm 15 (Giường)' },
                        ]}
                        className="mb-2"
                    />
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <AuditOutlined className="text-blue-500" />
                        Trùng Giường (Nhóm 15)
                    </h1>
                    <p className="text-slate-500 font-medium">Danh sách các dịch vụ thuộc nhóm 15 và kiểm tra trùng lặp</p>
                </div>
                <div className="flex items-center gap-3">
                    <Input
                        placeholder="Tìm kiếm..."
                        prefix={<SearchOutlined className="text-slate-400" />}
                        className="w-full md:w-64"
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={loadData}
                        loading={loading}
                    >
                        Tải lại
                    </Button>
                    <Button
                        icon={<FileExcelOutlined />}
                        onClick={() => {
                            if (filteredData.length === 0) {
                                message.warning("Không có dữ liệu để xuất!");
                                return;
                            }
                            const exportData = filteredData.map((item, index) => ({
                                STT: index + 1,
                                'Mã LK': renderValue(item.MA_LK),
                                'Họ Tên': renderValue(item.HO_TEN),
                                'Mã Khoa': renderValue(item.MA_KHOA),
                                'Tên Khoa': departments[renderValue(item.MA_KHOA)] || '',
                                'Mã Giường': renderValue(item.MA_GIUONG),
                                'Ngày YL': formatDateTime(item.NGAY_YL),
                                'Ngày KQ': formatDateTime(item.NGAY_KQ),
                                'Mã Dịch Vụ': renderValue(item.MA_DICH_VU),
                                'Tên Dịch Vụ': renderValue(item.TEN_DICH_VU),
                            }));
                            const wb = XLSX.utils.book_new();
                            const ws = XLSX.utils.json_to_sheet(exportData);
                            XLSX.utils.book_append_sheet(wb, ws, "TrungGiuongNhom15");
                            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                            XLSX.writeFile(wb, `TrungGiuong_Nhom15_${timestamp}.xlsx`);
                        }}
                        className="bg-green-600 hover:bg-green-500 text-white border-none"
                    >
                        Xuất Excel
                    </Button>
                    <Button
                        type="primary"
                        danger
                        onClick={() => {
                            const mapYL: Record<string, any[]> = {};
                            const mapKQ: Record<string, any[]> = {};

                            data.forEach(item => {
                                const maGiuong = String(item.MA_GIUONG || '').trim();
                                const maDichVu = String(item.MA_DICH_VU || '').trim();
                                const maKhoa = String(item.MA_KHOA || '').trim();

                                const rawDate = String(item.NGAY_YL || '');
                                const dateHour = rawDate.length >= 10 ? rawDate.substring(0, 10) : rawDate;
                                // Criteria 1: Khoa + Giuong + DV + Ngay YL
                                const keyYL = `${maKhoa}_${maGiuong}_${maDichVu}_${dateHour}`;
                                if (!mapYL[keyYL]) mapYL[keyYL] = [];
                                mapYL[keyYL].push(item);

                                const rawDateKQ = String(item.NGAY_KQ || '');
                                const dateKQHour = rawDateKQ.length >= 10 ? rawDateKQ.substring(0, 10) : rawDateKQ;
                                // Criteria 2: Khoa + Giuong + DV + Ngay KQ
                                const keyKQ = `${maKhoa}_${maGiuong}_${maDichVu}_${dateKQHour}`;
                                if (!mapKQ[keyKQ]) mapKQ[keyKQ] = [];
                                mapKQ[keyKQ].push(item);
                            });

                            const dupsYL = Object.values(mapYL).filter(g => g.length >= 2).flat();
                            const dupsKQ = Object.values(mapKQ).filter(g => g.length >= 2).flat();

                            // Merge and remove duplicates by __key
                            const uniqueMap = new Map();
                            dupsYL.forEach(i => uniqueMap.set(i.__key, i));
                            dupsKQ.forEach(i => uniqueMap.set(i.__key, i));

                            const duplicates = Array.from(uniqueMap.values());

                            setFilteredData(duplicates);
                            if (duplicates.length > 0) {
                                alert(`Tìm thấy ${duplicates.length} bản ghi trùng giường (Nhóm 15).\nXét theo 2 nhóm tiêu chí (OR):\n1. Mã Khoa + Mã Giường + Mã DV + Ngày YL (Giờ)\nHOẶC\n2. Mã Khoa + Mã Giường + Mã DV + Ngày KQ (Giờ)`);
                            } else {
                                alert("Không tìm thấy bản ghi nào trùng giường theo 2 nhóm tiêu chí trên.");
                            }
                        }}
                    >
                        Quét Trùng Lặp
                    </Button>
                </div>
            </div>

            <Card className="shadow-sm border-slate-200 rounded-2xl overflow-hidden" styles={{ body: { padding: 0 } }}>
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="__key"
                    loading={loading}
                    scroll={{ x: 1200, y: 'calc(100vh - 280px)' }}
                    pagination={{
                        defaultPageSize: 20,
                        showSizeChanger: true,
                        pageSizeOptions: ['20', '50', '100', '500'],
                        showTotal: (total) => `Tổng ${total} dòng`
                    }}
                    size="middle"
                    bordered
                    onRow={(record) => ({
                        onClick: () => handleRowClick(record),
                        style: { cursor: 'pointer' },
                        title: 'Click chuột trái để copy dữ liệu dòng'
                    })}
                    rowClassName={(record) => record.__key === selectedRowKey ? 'bg-blue-100 font-medium' : ''}
                />
            </Card>
        </div>
    );
}
