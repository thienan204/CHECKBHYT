'use client';

import React, { useState, useEffect } from 'react';
import { Table, Input, Card, Tag, Button, Tooltip, message } from 'antd';
import { loadRecordsFromDB } from '@/lib/db';
import { getXmlDataList } from '@/lib/xml';
import * as XLSX from 'xlsx';
import { SearchOutlined, ReloadOutlined, FileExcelOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useParams } from 'next/navigation';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

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

// Palette for group colors (ARGB for Excel, Hex for CSS)
// Format: { argb: 'FFFFCCCC', css: '#ffcccc' }
const COLOR_PALETTE = [
    { argb: 'FFFFCCCC', css: '#ffcccc' }, // Red
    { argb: 'FFCCE5FF', css: '#cce5ff' }, // Blue
    { argb: 'FFCCFFCC', css: '#ccffcc' }, // Green
    { argb: 'FFFFFFCC', css: '#ffffcc' }, // Yellow
    { argb: 'FFE5CCFF', css: '#e5ccff' }, // Purple
    { argb: 'FFFFE5CC', css: '#ffe5cc' }, // Orange
];

// Helper to get date up to hour (YYYYMMDDHH)
const getDateHour = (dateStr: any) => {
    const s = renderValue(dateStr);
    if (!s) return '';
    if (s.length >= 10) {
        return s.substring(0, 10);
    }
    return s;
};

const parseDateStr = (dateStr: any) => {
    const s = renderValue(dateStr);
    if (!s || s.length < 12) return null;
    const year = parseInt(s.substring(0, 4));
    const month = parseInt(s.substring(4, 6)) - 1;
    const day = parseInt(s.substring(6, 8));
    const hour = parseInt(s.substring(8, 10));
    const minute = parseInt(s.substring(10, 12));
    return new Date(year, month, day, hour, minute);
};

// Map groupId to readable name
const GROUP_NAMES: Record<string, string> = {
    '1': 'Xét nghiệm',
    '2': 'Chẩn đoán hình ảnh',
    '3': 'Thăm dò chức năng',
    '8': 'Phẫu thuật',
    '18': 'Thủ thuật'
};

export default function KiemTraMaMayGroupPage() {
    const params = useParams();
    const groupId = Array.isArray(params?.groupId) ? params?.groupId[0] : params?.groupId;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([]);
    const [searchText, setSearchText] = useState('');
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [deptMap, setDeptMap] = useState<Record<string, string>>({});

    useEffect(() => {
        // Fetch departments first
        const fetchDepts = async () => {
            try {
                const res = await fetch('/api/departments');
                if (res.ok) {
                    const depts = await res.json();
                    const map: Record<string, string> = {};
                    depts.forEach((d: any) => {
                        if (d.ma_khoa) map[d.ma_khoa] = d.ten_khoa;
                    });
                    setDeptMap(map);
                }
            } catch (e) {
                console.error("Failed to load departments", e);
            }
        };
        fetchDepts();
    }, []);

    useEffect(() => {
        if (groupId) {
            loadData();
        }
    }, [groupId, deptMap]); // Reload if deptMap changes (or handle mapping in render/effect)

    useEffect(() => {
        if (!searchText) {
            setFilteredData(data);
        } else {
            const lower = searchText.toLowerCase();
            const filtered = data.filter(item =>
                String(item.MA_LK || '').toLowerCase().includes(lower) ||
                String(item.HO_TEN || '').toLowerCase().includes(lower) ||
                String(item.MA_DICH_VU || '').toLowerCase().includes(lower) ||
                String(item.TEN_DICH_VU || '').toLowerCase().includes(lower) ||
                String(item.MA_MAY || '').toLowerCase().includes(lower) ||
                String(item.TEN_KHOA || '').toLowerCase().includes(lower)
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
                        const itemMaNhom = String(item.MA_NHOM || '');
                        // ONLY ADD ITEMS MATCHING CURRENT GROUP ID
                        if (itemMaNhom === groupId) {
                            const maKhoa = item.MA_KHOA || record.summary?.MA_KHOA;
                            const tenKhoa = item.TEN_KHOA || record.summary?.TEN_KHOA || deptMap[maKhoa] || '';

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
                                TEN_KHOA: tenKhoa,
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
            title: 'Mã Dịch Vụ',
            dataIndex: 'MA_DICH_VU',
            key: 'MA_DICH_VU',
            width: 150,
            render: (text) => <span className="font-mono text-slate-700">{renderValue(text)}</span>,
            sorter: (a, b) => renderValue(a.MA_DICH_VU).localeCompare(renderValue(b.MA_DICH_VU)),
        },
        {
            title: 'Tên Dịch Vụ',
            dataIndex: 'TEN_DICH_VU',
            key: 'TEN_DICH_VU',
            width: 300,
            render: (text) => (
                <Tooltip title={renderValue(text)}>
                    <div className="truncate">{renderValue(text)}</div>
                </Tooltip>
            )
        },
        {
            title: 'Mã Máy',
            dataIndex: 'MA_MAY',
            key: 'MA_MAY',
            width: 250,
            render: (text) => {
                const val = renderValue(text);
                return val ? <Tag color="blue">{val}</Tag> : <span className="text-gray-300 italic">Không có</span>
            },
            sorter: (a, b) => renderValue(a.MA_MAY).localeCompare(renderValue(b.MA_MAY)),
        },
        {
            title: 'Mã Khoa',
            dataIndex: 'MA_KHOA',
            key: 'MA_KHOA',
            width: 100,
            render: (text) => renderValue(text)
        },
        {
            title: 'Tên Khoa',
            dataIndex: 'TEN_KHOA',
            key: 'TEN_KHOA',
            width: 200,
            render: (text) => (
                <Tooltip title={renderValue(text)}>
                    <div className="truncate">{renderValue(text)}</div>
                </Tooltip>
            )
        },
        {
            title: 'Mã Nhóm',
            dataIndex: 'MA_NHOM',
            key: 'MA_NHOM',
            width: 100,
            render: (text) => renderValue(text)
        },
        {
            title: 'Ngày YL',
            dataIndex: 'NGAY_YL',
            key: 'NGAY_YL',
            width: 120,
            render: (text) => formatDateTime(text)
        },
        {
            title: 'Ngày TH YL',
            dataIndex: 'NGAY_TH_YL',
            key: 'NGAY_TH_YL',
            width: 120,
            render: (text) => formatDateTime(text)
        },
        {
            title: 'Ngày KQ',
            dataIndex: 'NGAY_KQ',
            key: 'NGAY_KQ',
            width: 120,
            render: (text) => formatDateTime(text)
        },
        {
            title: 'Kết quả',
            dataIndex: 'KET_QUA',
            key: 'KET_QUA',
            width: 200,
            render: (text) => (
                <div className="truncate max-w-xs" title={renderValue(text)}>
                    {renderValue(text)}
                </div>
            )
        }
    ];

    const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);

    const handleRowClick = (record: any) => {
        const textToCopy = JSON.stringify(record, null, 2);
        navigator.clipboard.writeText(textToCopy).then(() => {
            message.success('Đã sao chép nội dung dòng!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
        setSelectedRowKey(record.__key);
    };

    const handleCheckDuplicate = () => {
        const candidateItems = data.filter(item => {
            const maMay = renderValue(item.MA_MAY);
            return maMay !== '';
        });

        // Grouping by MA_MAY, MA_KHOA, MA_DICH_VU
        const mapGroup: Record<string, any[]> = {};

        candidateItems.forEach(item => {
            const maMay = renderValue(item.MA_MAY);
            const maKhoa = renderValue(item.MA_KHOA);
            const maDichVu = renderValue(item.MA_DICH_VU);

            const key = `${maMay}_${maKhoa}_${maDichVu}`;

            if (!mapGroup[key]) {
                mapGroup[key] = [];
            }
            mapGroup[key].push(item);
        });

        const duplicates: any[] = [];
        let groupIndexCounter = 0;

        // Check for time overlap in each group
        Object.values(mapGroup).forEach(group => {
            if (group.length < 2) return;

            // Build adjacency graph: nodes are indices in 'group', edges are overlaps.
            const adj: Record<number, number[]> = {};

            for (let i = 0; i < group.length; i++) {
                adj[i] = [];
            }

            for (let i = 0; i < group.length; i++) {
                const itemA = group[i];
                const startA = parseDateStr(itemA.NGAY_TH_YL);
                const endA = parseDateStr(itemA.NGAY_KQ);

                if (!startA || !endA) continue;

                for (let j = i + 1; j < group.length; j++) {
                    const itemB = group[j];
                    const startB = parseDateStr(itemB.NGAY_TH_YL);
                    const endB = parseDateStr(itemB.NGAY_KQ);

                    if (!startB || !endB) continue;

                    if (startA < endB && endA > startB) {
                        adj[i].push(j);
                        adj[j].push(i);
                    }
                }
            }

            // Find connected components
            const visited = new Set<number>();

            for (let i = 0; i < group.length; i++) {
                if (visited.has(i)) continue;
                // If it has no edges, it might not be a duplicate (unless we want to flag singular items? No, duplicates loop checks overlap)
                // Actually, if adj[i].length == 0, it means it doesn't overlap with ANYONE in this 'Machine' group.
                if (adj[i].length === 0) continue;

                // Start BFS/DFS for this component
                const componentIndices: number[] = [];
                const queue = [i];
                visited.add(i);

                while (queue.length > 0) {
                    const u = queue.shift()!;
                    componentIndices.push(u);

                    const neighbors = adj[u];
                    for (const v of neighbors) {
                        if (!visited.has(v)) {
                            visited.add(v);
                            queue.push(v);
                        }
                    }
                }

                if (componentIndices.length > 1) {
                    componentIndices.forEach(idx => {
                        const clone = { ...group[idx], __groupIndex: groupIndexCounter };
                        duplicates.push(clone);
                    });
                    groupIndexCounter++;
                }
            }
        });

        // Sort by group index then by time
        duplicates.sort((a, b) => {
            if (a.__groupIndex !== b.__groupIndex) {
                return a.__groupIndex - b.__groupIndex;
            }
            return String(a.NGAY_TH_YL).localeCompare(String(b.NGAY_TH_YL));
        });

        setFilteredData(duplicates);
        if (duplicates.length > 0) {
            message.warning(`Tìm thấy ${duplicates.length} bản ghi trùng thời gian máy!`);
        } else {
            message.info("Không tìm thấy bản ghi nào trùng thời gian máy.");
        }
    };

    const handleExportExcel = async () => {
        if (filteredData.length === 0) {
            message.warning("Không có dữ liệu để xuất!");
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('DanhSach');

        // Define columns
        worksheet.columns = [
            { header: 'STT', key: 'STT', width: 5 },
            { header: 'Mã LK', key: 'MA_LK', width: 15 },
            { header: 'Họ Tên', key: 'HO_TEN', width: 20 },
            { header: 'Mã Dịch Vụ', key: 'MA_DICH_VU', width: 15 },
            { header: 'Tên Dịch Vụ', key: 'TEN_DICH_VU', width: 40 },
            { header: 'Mã Máy', key: 'MA_MAY', width: 25 },
            { header: 'Mã Khoa', key: 'MA_KHOA', width: 10 },
            { header: 'Tên Khoa', key: 'TEN_KHOA', width: 20 },
            { header: 'Mã Nhóm', key: 'MA_NHOM', width: 10 },
            { header: 'Ngày YL', key: 'NGAY_YL', width: 15 },
            { header: 'Ngày TH YL', key: 'NGAY_TH_YL', width: 15 },
            { header: 'Ngày KQ', key: 'NGAY_KQ', width: 15 },
            { header: 'Kết quả', key: 'KET_QUA', width: 20 },
        ];

        // Add rows
        filteredData.forEach((item, index) => {
            const row = worksheet.addRow({
                STT: index + 1,
                MA_LK: renderValue(item.MA_LK),
                HO_TEN: renderValue(item.HO_TEN),
                MA_DICH_VU: renderValue(item.MA_DICH_VU),
                TEN_DICH_VU: renderValue(item.TEN_DICH_VU),
                MA_MAY: renderValue(item.MA_MAY),
                MA_KHOA: renderValue(item.MA_KHOA),
                TEN_KHOA: renderValue(item.TEN_KHOA) || (item.MA_KHOA && deptMap[item.MA_KHOA]) || '',
                MA_NHOM: renderValue(item.MA_NHOM),
                NGAY_YL: formatDateTime(item.NGAY_YL),
                NGAY_TH_YL: formatDateTime(item.NGAY_TH_YL),
                NGAY_KQ: formatDateTime(item.NGAY_KQ),
                KET_QUA: renderValue(item.KET_QUA)
            });

            // Styling
            if (item.__groupIndex !== undefined) {
                const colorObj = COLOR_PALETTE[item.__groupIndex % COLOR_PALETTE.length];
                row.eachCell({ includeEmpty: true }, (cell) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: colorObj.argb }
                    };
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
                        left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
                        bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
                        right: { style: 'thin', color: { argb: 'FFD9D9D9' } }
                    };
                });
            }
        });

        // Header styling
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFF0F0F0' }
            };
        });

        const buf = await workbook.xlsx.writeBuffer();

        const groupSuffix = groupId ? `_Nhom${groupId}` : '';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        saveAs(new Blob([buf]), `KiemTraMaMay${groupSuffix}_${timestamp}.xlsx`);
    };

    const groupName = groupId && GROUP_NAMES[groupId] ? ` - ${GROUP_NAMES[groupId]}` : '';

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Kiểm tra Mã Máy{groupName}</h1>
                    <p className="text-slate-500 font-medium">Kiểm tra trùng lặp theo Mã Máy, Khoa, Dịch Vụ, Thời gian (Từ TH đến KQ)</p>
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
                        onClick={handleExportExcel}
                        className="bg-green-600 hover:bg-green-500 text-white border-none"
                    >
                        Xuất Excel
                    </Button>
                    <Button
                        type="primary"
                        danger
                        onClick={handleCheckDuplicate}
                    >
                        Kiểm tra trùng
                    </Button>
                </div>
            </div>

            <Card className="shadow-sm border-slate-200 rounded-2xl overflow-hidden" styles={{ body: { padding: 0 } }}>
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="__key"
                    loading={loading}
                    scroll={{ x: 1500, y: 'calc(100vh - 280px)' }}
                    pagination={{
                        defaultPageSize: 20,
                        showSizeChanger: true,
                        pageSizeOptions: ['20', '50', '100', '500'],
                        showTotal: (total) => `Tổng ${total} dòng`
                    }}
                    size="middle"
                    bordered
                    onRow={(record) => {
                        let style: React.CSSProperties = { cursor: 'pointer' };
                        if (record.__key === selectedRowKey) {
                            style.backgroundColor = '#e6f7ff'; // ant-design blue-1
                        } else if (record.__groupIndex !== undefined) {
                            const colorObj = COLOR_PALETTE[record.__groupIndex % COLOR_PALETTE.length];
                            style.backgroundColor = colorObj.css;
                        }

                        return {
                            onClick: () => handleRowClick(record),
                            style: style,
                            title: 'Click để copy nội dung'
                        };
                    }}
                />
            </Card>
        </div>
    );
}
