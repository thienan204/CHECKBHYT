'use client';

import React, { useState, useEffect } from 'react';
import { Table, Input, Card, Tag, Button, Tooltip, Breadcrumb } from 'antd';
import { loadRecordsFromDB } from '@/lib/db';
import { getXmlDataList, ExtendedHosoRecord } from '@/lib/xml';
import { SearchOutlined, ReloadOutlined, AuditOutlined } from '@ant-design/icons';
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
            render: (text) => <span className="font-bold text-blue-600">{renderValue(text)}</span>,
            sorter: (a, b) => String(a.MA_LK).localeCompare(String(b.MA_LK)),
        },
        {
            title: 'Họ Tên',
            dataIndex: 'HO_TEN',
            key: 'HO_TEN',
            width: 150,
            fixed: 'left',
            render: (text) => <span className="text-slate-700 font-medium">{renderValue(text)}</span>,
            sorter: (a, b) => String(a.HO_TEN).localeCompare(String(b.HO_TEN)),
        },
        {
            title: 'Mã Khoa',
            dataIndex: 'MA_KHOA',
            key: 'MA_KHOA_COL',
            width: 100,
            render: (text) => <span className="font-bold text-blue-700">{renderValue(text)}</span>
        },
        {
            title: 'Tên Khoa',
            dataIndex: 'MA_KHOA',
            key: 'TEN_KHOA_COL',
            width: 200,
            render: (text) => <span className="text-slate-600">{departments[renderValue(text)] || ''}</span>
        },
        // Only essential columns for bed checking
        {
            title: 'Mã Giường',
            dataIndex: 'MA_GIUONG',
            key: 'MA_GIUONG',
            width: 120,
            render: (text) => <Tag color="geekblue">{renderValue(text) || '(Trống)'}</Tag>
        },
        {
            title: 'Ngày YL',
            dataIndex: 'NGAY_YL',
            key: 'NGAY_YL',
            width: 120,
            render: (text) => formatDateTime(text),
            defaultSortOrder: 'ascend',
            sorter: (a, b) => String(a.NGAY_YL).localeCompare(String(b.NGAY_YL)),
        },
        {
            title: 'Ngày KQ',
            dataIndex: 'NGAY_KQ',
            key: 'NGAY_KQ',
            width: 120,
            render: (text) => formatDateTime(text)
        },
        {
            title: 'Mã Dịch Vụ',
            dataIndex: 'MA_DICH_VU',
            key: 'MA_DICH_VU',
            width: 150,
            render: (text) => <span className="font-mono text-slate-700">{renderValue(text)}</span>,
        },
        {
            title: 'Tên Dịch Vụ',
            dataIndex: 'TEN_DICH_VU',
            key: 'TEN_DICH_VU',
            width: 250,
            render: (text) => (
                <Tooltip title={renderValue(text)}>
                    <div className="truncate">{renderValue(text)}</div>
                </Tooltip>
            )
        },
    ];

    const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);

    const handleRowClick = (record: any) => {
        const textToCopy = JSON.stringify(record, null, 2);
        navigator.clipboard.writeText(textToCopy).catch(err => console.error('Copy failed', err));
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
                        type="primary"
                        danger
                        onClick={() => {
                            // Only check duplicates within the loaded Group 15 data
                            const groups: Record<string, any[]> = {};

                            data.forEach(item => {
                                const rawDate = String(item.NGAY_YL || '');
                                // Check up to Hour (YYYYMMDDHH), ignore minutes
                                const dateHour = rawDate.length >= 10 ? rawDate.substring(0, 10) : rawDate;

                                const maGiuong = String(item.MA_GIUONG || '').trim();
                                const maDichVu = String(item.MA_DICH_VU || '').trim();
                                const maKhoa = String(item.MA_KHOA || '').trim();

                                // Duplicate Key: DateHour + Bed + Service Code + Department Code
                                const key = `${dateHour}_${maGiuong}_${maDichVu}_${maKhoa}`;
                                if (!groups[key]) groups[key] = [];
                                groups[key].push(item);
                            });

                            // Find duplicates (groups with >= 2 items)
                            const duplicates = Object.values(groups).filter(g => g.length >= 2).flat();

                            setFilteredData(duplicates);
                            if (duplicates.length > 0) {
                                alert(`Tìm thấy ${duplicates.length} bản ghi trùng giường (Nhóm 15).\nTiêu chí: Cùng Giờ chỉ định (dd/MM/yyyy HH:00), Cùng Giường, Cùng Mã Dịch Vụ, Cùng Mã Khoa.`);
                            } else {
                                alert("Không tìm thấy bản ghi nào trùng giường trong Nhóm 15 (theo tiêu chí mới: Mã Khoa + Giờ chỉ định).");
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
