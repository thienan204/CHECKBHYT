'use client';

import React, { useEffect, useState } from 'react';
import { Table, Tag, Card, Button, Spin, Empty, Descriptions, Input, Space, message, DatePicker } from 'antd';
import { loadRecordsFromDB } from '@/lib/db';
import { ExtendedHosoRecord, getXmlDataList } from '@/lib/xml';
import { CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined, SearchOutlined, FileExcelOutlined, ScanOutlined, FileTextOutlined } from '@ant-design/icons';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { getDepartments } from '@/actions/department';
import dayjs from 'dayjs';

interface SpecializedRuleRunnerProps {
    rule: any;
}

export default function SpecializedRuleRunner({ rule }: SpecializedRuleRunnerProps) {
    const [records, setRecords] = useState<ExtendedHosoRecord[]>([]);
    const [loading, setLoading] = useState(true);
    // Generic logic results
    const [results, setResults] = useState<any[]>([]);

    // Duplicate Bed specific state
    const [bedServices, setBedServices] = useState<any[]>([]);
    const [isDuplicateBedMode, setIsDuplicateBedMode] = useState(false);
    const [filterBed, setFilterBed] = useState<string>('');
    const [filterKhoa, setFilterKhoa] = useState<string>('');
    const [filterMaGiuong, setFilterMaGiuong] = useState<string>('');
    const [filterNgayRa, setFilterNgayRa] = useState<string>(dayjs().format('DD/MM/YYYY'));
    const [deptMap, setDeptMap] = useState<Record<string, string>>({});

    useEffect(() => {
        getDepartments().then(depts => {
            const map: Record<string, string> = {};
            depts.forEach(d => map[d.ma_khoa] = d.ten_khoa);
            setDeptMap(map);
        });
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await loadRecordsFromDB();
            setRecords(data);

            // Detection Logic: Check config type first, then legacy ruleType or slug conventions
            const isDuplicateBed = rule.logicConfig?.type === 'DUPLICATE_BED' ||
                rule.ruleType === 'DUPLICATE_BED' ||
                rule.slug?.includes('trung-giuong') ||
                rule.slug?.includes('trung-ma-giuong');

            if (isDuplicateBed) {
                setIsDuplicateBedMode(true);
                // prepareBedServices will be triggered by useEffect
            } else {
                setIsDuplicateBedMode(false);
                executeRule(data);
            }

        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [rule]);

    // Trigger preparation when records or deps change
    useEffect(() => {
        if (isDuplicateBedMode && records.length > 0) {
            prepareBedServices(records);
        }
    }, [records, isDuplicateBedMode, rule, deptMap]);

    const executeRule = (data: ExtendedHosoRecord[]) => {
        if (!rule || !rule.logicConfig) return;

        const config = rule.logicConfig;
        let validationResults: any[] = [];

        if (rule.ruleType === 'MACHINE_CHECK' && config.type === 'MACHINE_CHECK') {
            validationResults = checkMachine(data, config);
        }

        setResults(validationResults);
    };

    // --- Duplicate Bed Logic ---

    // 1. Prepare Data for Table View
    const prepareBedServices = (data: ExtendedHosoRecord[]) => {
        if (!rule || !rule.logicConfig) return;
        const config = rule.logicConfig;
        const { fields, filter } = config;

        const list: any[] = [];
        let index = 1;

        data.forEach(record => {
            // Scan all groups (or restrict if config says so)
            record.groups.forEach(group => {
                // If config specifies target XML type, check it. Otherwise default to XML3 for now as we are looking for services
                if (group.type === 'XML3') {
                    const servs = getXmlDataList(group);
                    servs.forEach((item: any) => {
                        // Dynamic Filter
                        let match = true;
                        if (filter) {
                            for (const [key, value] of Object.entries(filter)) {
                                // Ignore empty filter values
                                if (value === '' || value === null || value === undefined) continue;

                                // Special Array Filters
                                if (key === 'MA_DICH_VU_INCLUDE' && Array.isArray(value)) {
                                    if (value.length > 0 && !value.includes(item.MA_DICH_VU)) {
                                        match = false;
                                        break;
                                    }
                                    continue;
                                }

                                if (key === 'MA_DICH_VU_EXCLUDE' && Array.isArray(value)) {
                                    if (value.length > 0 && value.includes(item.MA_DICH_VU)) {
                                        match = false;
                                        break;
                                    }
                                    continue;
                                }

                                // loose comparison for numbers/strings
                                if (item[key] != value) {
                                    match = false;
                                    break;
                                }
                            }
                        }

                        if (match) {
                            // Dynamic Fields Mapping
                            let bedCode = '';
                            if (fields?.bed) {
                                if (Array.isArray(fields.bed)) {
                                    // Filter out MA_KHOA from display if strictly present (redundant column)
                                    const bedDisplayFields = fields.bed.filter((f: string) => f !== 'MA_KHOA');
                                    const fieldsToMap = bedDisplayFields.length > 0 ? bedDisplayFields : fields.bed;
                                    bedCode = fieldsToMap.map((f: string) => item[f]).filter(Boolean).join(' + ');
                                } else {
                                    bedCode = item[fields.bed];
                                }
                            } else {
                                bedCode = item.MA_GIUONG;
                            }

                            const startTime = fields?.startTime ? item[fields.startTime] : item.NGAY_YL;
                            const endTime = fields?.endTime ? item[fields.endTime] : item.NGAY_KQ;
                            const deptCode = fields?.department ? item[fields.department] : (item.MA_KHOA || record.summary?.MA_KHOA);

                            list.push({
                                key: `${record.id}_${item.MA_DICH_VU}_${index}`,
                                stt: index++,
                                MA_LK: record.summary?.MA_LK,
                                HO_TEN: record.summary?.HO_TEN,
                                MA_KHOA: deptCode,
                                TEN_KHOA: deptMap[deptCode] || '', // Lookup department name
                                MA_GIUONG: bedCode || '',
                                TYLE_BH: item.TYLE_TT_BH || '',
                                TYLE_DV: item.TYLE_TT_DV || '',
                                NGAY_YL: startTime,
                                NGAY_KQ: endTime,
                                NGAY_VAO: record.summary?.NGAY_VAO || '',
                                NGAY_RA: record.summary?.NGAY_RA || '',
                                NGAY_TH_YL: item.NGAY_TH_YL || '',
                                MA_DICH_VU: item.MA_DICH_VU,
                                TEN_DICH_VU: item.TEN_DICH_VU,
                                SOLUONG: item.SO_LUONG || 0,

                                // Clean Data for sorting/overlap
                                _start: parseDate(startTime),
                                _end: parseDate(endTime),
                                _ma_giuong: bedCode,
                                _ma_khoa: deptCode,

                                original: item,
                                recordId: record.id
                            });
                        }
                    });
                }
            });
        });
        setBedServices(list);
    };

    // 2. Scan for Overlaps (Triggered by button)
    const scanDuplicates = () => {
        setLoading(true);
        // Simulate delay for effect
        setTimeout(() => {
            const overlaps = new Set<string>();

            // Group by Bed + Department ?? Or just Bed? Bed code usually unique per department??
            // Let's group by Bed Code + Dept Code
            const groups: Record<string, typeof bedServices> = {};

            bedServices.forEach(item => {
                if (!item._ma_giuong) return;
                const key = `${item._ma_khoa}_${item._ma_giuong}`;
                if (!groups[key]) groups[key] = [];
                groups[key].push(item);
            });

            Object.entries(groups).forEach(([key, items]) => {
                items.sort((a, b) => a._start.getTime() - b._start.getTime());

                // Check for ANY overlap in this group
                for (let i = 0; i < items.length - 1; i++) {
                    const curr = items[i];
                    const next = items[i + 1];
                    // Check for overlap between current and next item
                    // Overlap exists if (StartA < EndB) and (EndA > StartB)
                    const overlapMinutes = (Math.min(curr._end.getTime(), next._end.getTime()) - Math.max(curr._start.getTime(), next._start.getTime())) / 60000;
                    const tolerance = rule.logicConfig?.toleranceMinutes || 0;

                    if (overlapMinutes > tolerance) {
                        overlaps.add(curr.key);
                        overlaps.add(next.key);
                    }
                }
            });

            // Filter only overlaps? Or just highlighting?
            // User requested "Quét Trùng Lặp". Usually means filter to show ONLY errors.
            if (overlaps.size > 0) {
                // Filter only items involved in overlaps
                let filtered = bedServices.filter(item => overlaps.has(item.key));

                // Sort by Department -> Bed -> Time
                filtered.sort((a, b) => {
                    // 1. Sort by Department (MA_KHOA)
                    if (a._ma_khoa !== b._ma_khoa) {
                        return (a._ma_khoa || '').localeCompare(b._ma_khoa || '');
                    }
                    // 2. Sort by Bed (MA_GIUONG)
                    if (a._ma_giuong !== b._ma_giuong) {
                        return (a._ma_giuong || '').localeCompare(b._ma_giuong || '');
                    }
                    // 3. Sort by Start Time
                    return a._start.getTime() - b._start.getTime();
                });

                // Assign colors based on groups (Dept + Bed)
                const colors = ['bg-red-50', 'bg-blue-50', 'bg-green-50', 'bg-purple-50', 'bg-orange-50'];
                let colorIdx = 0;
                let lastGroupKey = '';

                const coloredData = filtered.map((item, index) => {
                    const currentGroupKey = `${item._ma_khoa}_${item._ma_giuong}`;

                    // If this is the first item, or group key changed from previous item
                    if (index === 0 || currentGroupKey !== lastGroupKey) {
                        if (index > 0) colorIdx++; // Verify we don't increment for the very first group
                        lastGroupKey = currentGroupKey;
                    }

                    return {
                        ...item,
                        rowColor: colors[colorIdx % colors.length]
                    };
                });

                setBedServices(coloredData);
                message.warning(`Phát hiện ${coloredData.length} dịch vụ trùng lặp!`);
            } else {
                setBedServices([]);
                message.success('Không phát hiện trùng lặp nào!');
            }
            setLoading(false);
        }, 500);
    };

    const handleExportExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Báo cáo trùng lặp');

        // Headers
        const columns = [
            { header: 'STT', key: 'stt', width: 5 },
            { header: 'Mã LK', key: 'MA_LK', width: 15 },
            { header: 'Họ Tên', key: 'HO_TEN', width: 25 },
            { header: 'Mã Khoa', key: 'MA_KHOA', width: 10 },
            { header: 'Tên Khoa', key: 'TEN_KHOA', width: 20 },
            { header: 'Mã Giường', key: 'MA_GIUONG', width: 15 },
            { header: 'Số Lượng', key: 'SOLUONG', width: 10 },
            { header: 'Tỷ lệ BH', key: 'TYLE_BH', width: 10 },
            { header: 'Tỷ lệ DV', key: 'TYLE_DV', width: 10 },
            { header: 'Ngày Vào', key: 'NGAY_VAO', width: 20 },
            { header: 'Ngày Ra', key: 'NGAY_RA', width: 20 },
            { header: 'Ngày YL', key: 'NGAY_YL', width: 20 },
            { header: 'Ngày TH YL', key: 'NGAY_TH_YL', width: 20 },
            { header: 'Ngày KQ', key: 'NGAY_KQ', width: 20 },
            { header: 'Mã DV', key: 'MA_DICH_VU', width: 15 },
            { header: 'Tên Dịch Vụ', key: 'TEN_DICH_VU', width: 30 },
        ];
        sheet.columns = columns;

        // Data
        const colorMap: Record<string, string> = {
            'bg-red-50': 'FFFEF2F2',
            'bg-blue-50': 'FFEFF6FF',
            'bg-green-50': 'FFF0FDF4',
            'bg-purple-50': 'FFFAF5FF',
            'bg-orange-50': 'FFFFF7ED'
        };

        bedServices.forEach((item, index) => {
            const row = sheet.addRow({
                stt: index + 1,
                MA_LK: item.MA_LK,
                HO_TEN: item.HO_TEN,
                MA_KHOA: item.MA_KHOA,
                TEN_KHOA: item.TEN_KHOA,
                MA_GIUONG: item.MA_GIUONG,
                SOLUONG: item.SOLUONG,
                TYLE_BH: item.TYLE_BH,
                TYLE_DV: item.TYLE_DV,
                NGAY_VAO: formatDateTime(item.NGAY_VAO),
                NGAY_RA: formatDateTime(item.NGAY_RA),
                NGAY_YL: formatDateTime(item.NGAY_YL),
                NGAY_TH_YL: item.NGAY_TH_YL ? formatDateTime(item.NGAY_TH_YL) : '',
                NGAY_KQ: formatDateTime(item.NGAY_KQ),
                MA_DICH_VU: item.MA_DICH_VU,
                TEN_DICH_VU: item.TEN_DICH_VU
            });

            if (item.rowColor && colorMap[item.rowColor]) {
                row.eachCell((cell) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: colorMap[item.rowColor] }
                    };
                });
            }
        });

        // Style header
        sheet.getRow(1).font = { bold: true };

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Generate filename from rule name
        const ruleName = rule.name || 'bao_cao_trung_lap';
        // Remove illegal characters for filenames
        const safeName = ruleName.replace(/[/\\?%*:|"<>]/g, '-');

        saveAs(blob, `${safeName}_${new Date().getTime()}.xlsx`);
    };

    // --- Logic Handlers (Old) ---

    // 2. Machine Check
    const checkMachine = (data: ExtendedHosoRecord[], config: any) => {
        const { fields, constraints, filter } = config;
        const machineUsage: Record<string, any[]> = {};
        const errors: any[] = [];

        data.forEach(record => {
            // Find services matching filter (e.g. ma_nhom = 1)
            record.groups.forEach(group => {
                // Determine if group is relevant (e.g. XML3 for services)
                if (!group.type.startsWith('XML')) return; // Check all XMLs?

                const list = getXmlDataList(group);
                list.forEach((item: any) => {
                    // Check filter
                    if (filter && filter.ma_nhom && item.MA_NHOM != filter.ma_nhom) return;

                    const machineCode = item[fields.machineCode];
                    const serviceCode = item[fields.serviceCode];
                    const timeStr = item[fields.time];

                    if (machineCode && timeStr) {
                        if (!machineUsage[machineCode]) machineUsage[machineCode] = [];
                        machineUsage[machineCode].push({
                            id: record.summary?.MA_LK,
                            patientName: record.summary?.HO_TEN,
                            serviceName: item.TEN_DICH_VU,
                            time: parseDate(timeStr),
                            originalRecord: record
                        });
                    }
                });
            });
        });

        // Validate Constraints
        Object.entries(machineUsage).forEach(([code, usages]) => {
            // Sort by time
            usages.sort((a, b) => a.time.getTime() - b.time.getTime());

            // 1. Max Per Day
            if (constraints?.maxPerDay) {
                const byDay: Record<string, number> = {};
                usages.forEach(u => {
                    const day = u.time.toISOString().split('T')[0];
                    byDay[day] = (byDay[day] || 0) + 1;
                });
                Object.entries(byDay).forEach(([day, count]) => {
                    if (count > constraints.maxPerDay) {
                        errors.push({
                            key: `${code}_${day}`,
                            message: `Máy ${code} quá tải ngày ${day}: ${count} lần (Max: ${constraints.maxPerDay})`,
                            type: 'OVERLOAD',
                            details: { machine: code, day, count }
                        });
                    }
                });
            }
        });

        return errors;
    };

    const parseDate = (str: string) => {
        // YYYYMMDD or YYYYMMDDHHmm
        if (!str) return new Date();
        const y = parseInt(str.substring(0, 4));
        const m = parseInt(str.substring(4, 6)) - 1;
        const d = parseInt(str.substring(6, 8));
        const h = str.length >= 10 ? parseInt(str.substring(8, 10)) : 0;
        const min = str.length >= 12 ? parseInt(str.substring(10, 12)) : 0;
        return new Date(y, m, d, h, min);
    };

    const formatDateTime = (dateStr: string) => {
        if (!dateStr) return '';
        if (dateStr.length >= 12) {
            return `${dateStr.substring(6, 8)}/${dateStr.substring(4, 6)}/${dateStr.substring(0, 4)} ${dateStr.substring(8, 10)}:${dateStr.substring(10, 12)}`;
        }
        return dateStr;
    };

    // --- Columns ---
    const bedColumns = [
        { title: 'STT', key: 'stt', width: 60, align: 'center' as const, render: (_: any, __: any, index: number) => index + 1 },
        {
            title: 'Mã LK', dataIndex: 'MA_LK', key: 'MA_LK', width: 120,
            render: (text: string) => <span className="font-semibold text-blue-600">{text}</span>
        },
        { title: 'Họ Tên', dataIndex: 'HO_TEN', key: 'HO_TEN', width: 200, className: 'uppercase font-medium' },
        { title: 'Mã Khoa', dataIndex: 'MA_KHOA', key: 'MA_KHOA', width: 100, className: 'font-bold text-blue-700' },
        { title: 'Tên Khoa', dataIndex: 'TEN_KHOA', key: 'TEN_KHOA', width: 200, className: 'text-slate-500' },
        { title: rule.logicConfig?.filter?.MA_NHOM == 15 ? 'Mã Giường' : 'Mã Máy', dataIndex: 'MA_GIUONG', key: 'MA_GIUONG', width: 100, className: 'font-bold text-red-500' },
        {
            title: 'SL', dataIndex: 'SOLUONG', key: 'SOLUONG', width: 60, align: 'center' as const,
            render: (v: any) => <span className="font-semibold">{v}</span>
        },
        {
            title: 'Tỷ lệ BH', dataIndex: 'TYLE_BH', key: 'TYLE_BH', width: 80, align: 'center' as const,
            render: (v: any) => v ? <Tag color="orange">{v}</Tag> : '-'
        },
        {
            title: 'Tỷ lệ DV', dataIndex: 'TYLE_DV', key: 'TYLE_DV', width: 80, align: 'center' as const,
            render: (v: any) => v ? <Tag color="cyan">{v}</Tag> : '-'
        },
        {
            title: 'Ngày Vào', dataIndex: 'NGAY_VAO', key: 'NGAY_VAO', width: 150,
            render: (text: string) => formatDateTime(text)
        },
        {
            title: 'Ngày Ra', dataIndex: 'NGAY_RA', key: 'NGAY_RA', width: 150,
            render: (text: string) => formatDateTime(text)
        },
        {
            title: 'Ngày YL', dataIndex: 'NGAY_YL', key: 'NGAY_YL', width: 150,
            render: (text: string) => formatDateTime(text)
        },
        {
            title: 'Ngày TH YL', dataIndex: 'NGAY_TH_YL', key: 'NGAY_TH_YL', width: 140,
            render: (text: string) => text ? formatDateTime(text) : '-'
        },
        {
            title: 'Ngày KQ', dataIndex: 'NGAY_KQ', key: 'NGAY_KQ', width: 150,
            render: (text: string) => formatDateTime(text)
        },
        { title: 'Mã Dịch Vụ', dataIndex: 'MA_DICH_VU', key: 'MA_DICH_VU', width: 150 },
        { title: 'Tên Dịch Vụ', dataIndex: 'TEN_DICH_VU', key: 'TEN_DICH_VU', width: 350, ellipsis: true },
    ];

    const genericColumns = [
        {
            title: 'Nội dung lỗi',
            dataIndex: 'message',
            key: 'message',
            render: (text: string) => <div className="text-red-600 font-medium">{text}</div>
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (t: string) => t ? <Tag>{t}</Tag> : <Tag>LOGIC</Tag>
        }
    ];

    if (loading) return (
        <div className="p-12 text-center">
            <Spin size="large" />
            <div className="mt-4 text-slate-500 font-medium">Đang tải dữ liệu...</div>
        </div>
    );

    if (records.length === 0) return (
        <Empty
            description="Chưa có dữ liệu XML. Vui lòng tải file ở trang chủ trước."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
            <Button type="primary" href="/">Về trang chủ tải file</Button>
        </Empty>
    );

    // Render Request View (Duplicate Bed Mode)
    if (isDuplicateBedMode) {
        return (
            <div className="space-y-4">
                {/* Header Section */}
                {/* Header Section */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-row items-center gap-2">
                        <Input
                            prefix={<SearchOutlined className="text-slate-400" />}
                            placeholder="Tìm kiếm..."
                            style={{ width: 180 }}
                            onChange={(e) => {
                                const val = e.target.value.toLowerCase();
                                setFilterBed(val);
                            }}
                        />
                        <Input
                            placeholder="Mã/Tên Khoa"
                            style={{ width: 140 }}
                            onChange={(e) => setFilterKhoa(e.target.value)}
                        />
                        <Input
                            placeholder="Mã Giường"
                            style={{ width: 120 }}
                            onChange={(e) => setFilterMaGiuong(e.target.value)}
                        />
                        <DatePicker
                            placeholder="Ngày ra"
                            format="DD/MM/YYYY"
                            defaultValue={dayjs()}
                            style={{ width: 140 }}
                            onChange={(date, dateString) => setFilterNgayRa(dateString as string)}
                            allowClear
                        />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <Button icon={<ReloadOutlined />} onClick={fetchData}>Tải lại</Button>
                        <Button icon={<FileExcelOutlined />} onClick={handleExportExcel}>Xuất Excel</Button>
                        <Button
                            type="primary"
                            danger
                            icon={<ScanOutlined />}
                            onClick={scanDuplicates}
                        >
                            Quét Trùng Lặp
                        </Button>
                    </div>
                </div>

                <Table
                    dataSource={bedServices.filter(item => {
                        const searchMatch = !filterBed ||
                            (item.HO_TEN && item.HO_TEN.toLowerCase().includes(filterBed)) ||
                            (item.MA_LK && item.MA_LK.toString().includes(filterBed));

                        const khoaMatch = !filterKhoa ||
                            (item.MA_KHOA && item.MA_KHOA.toLowerCase().includes(filterKhoa.toLowerCase())) ||
                            (item.TEN_KHOA && item.TEN_KHOA.toLowerCase().includes(filterKhoa.toLowerCase()));

                        const giuongMatch = !filterMaGiuong ||
                            (item.MA_GIUONG && item.MA_GIUONG.toLowerCase().includes(filterMaGiuong.toLowerCase()));

                        const ngayRaMatch = !filterNgayRa ||
                            (item.NGAY_RA && formatDateTime(item.NGAY_RA).includes(filterNgayRa));

                        return searchMatch && khoaMatch && giuongMatch && ngayRaMatch;
                    })}
                    columns={bedColumns}
                    size="middle"
                    bordered
                    scroll={{ x: 1500, y: 600 }}
                    pagination={{ defaultPageSize: 20, showSizeChanger: true }}
                    rowClassName={(record) => record.rowColor || ''}
                />
            </div>
        );
    }

    // Generic View
    return (
        <div className="space-y-6">
            <Card title={`Kết quả kiểm tra (${records.length} hồ sơ)`} extra={<Button icon={<ReloadOutlined />} onClick={fetchData}>Chạy lại</Button>}>
                {results.length === 0 ? (
                    <div className="text-center py-8 text-green-600 container-none">
                        <CheckCircleOutlined style={{ fontSize: 48 }} className="mb-4" />
                        <div className="text-lg font-medium">Không phát hiện lỗi nào theo quy tắc này!</div>
                    </div>
                ) : (
                    <Table
                        dataSource={results}
                        columns={genericColumns}
                        rowKey="key"
                    />
                )}
            </Card>
        </div>
    );
}
