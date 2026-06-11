'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Select, Table, Tag, Button, Spin, message, Typography, Modal } from 'antd';
import { DownloadOutlined, ReloadOutlined, CheckCircleOutlined, ClockCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

interface Ticket {
    id: string;
    ma_ba: string | null;
    category: string;
    ten_loi: string;
    ma_khoa: string;
    assigneeId: string | null;
    assigneeName?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    startedAt: string | null;
    resolvedAt: string | null;
    dynamicFields: any;
    it_note: string | null;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export default function ITReportDashboard() {
    const { hasPermission } = useAuth();
    const canViewReport = hasPermission('MENU_IT_REPORT');

    const [loading, setLoading] = useState(true);
    const [allTickets, setAllTickets] = useState<Ticket[]>([]);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    
    // Filters
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([dayjs().startOf('month'), dayjs().endOf('month')]);
    const [categoryFilter, setCategoryFilter] = useState<string>('ALL'); // ALL, SOFTWARE, HARDWARE
    const [statusFilter, setStatusFilter] = useState<string>('ALL'); // ALL, PENDING, IN_PROGRESS, RESOLVED, TRANSFERRING
    const [selectedStaff, setSelectedStaff] = useState<string | null>(null);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/error-management/it-requests');
            if (res.ok) {
                const data = await res.json();
                setAllTickets(data);
            } else {
                message.error('Không thể tải dữ liệu');
            }
        } catch (error) {
            message.error('Lỗi kết nối');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (canViewReport) {
            fetchTickets();
        }
    }, [canViewReport]);

    // Filtered Tickets
    const filteredTickets = useMemo(() => {
        return allTickets.filter(ticket => {
            let passDate = true;
            if (dateRange && dateRange[0] && dateRange[1]) {
                const created = dayjs(ticket.createdAt);
                passDate = created.isBetween(dateRange[0], dateRange[1], 'day', '[]');
            }
            
            let passCategory = true;
            if (categoryFilter !== 'ALL') {
                passCategory = ticket.category === categoryFilter;
            }

            let passStaff = true;
            if (selectedStaff) {
                passStaff = ticket.assigneeName === selectedStaff;
            }

            let passStatus = true;
            if (statusFilter !== 'ALL') {
                passStatus = ticket.status === statusFilter;
            }

            return passDate && passCategory && passStaff && passStatus;
        });
    }, [allTickets, dateRange, categoryFilter, selectedStaff, statusFilter]);

    // Calculate KPIs
    const kpis = useMemo(() => {
        const total = filteredTickets.length;
        const resolved = filteredTickets.filter(t => t.status === 'RESOLVED').length;
        const pending = total - resolved;
        const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;

        // Calculate average time for resolved tickets
        let totalMins = 0;
        let resolvedCount = 0;
        filteredTickets.forEach(t => {
            if (t.status === 'RESOLVED' && t.updatedAt && t.createdAt) {
                const start = dayjs(t.createdAt);
                const end = dayjs(t.updatedAt);
                totalMins += end.diff(start, 'minute');
                resolvedCount++;
            }
        });

        const avgMins = resolvedCount > 0 ? Math.round(totalMins / resolvedCount) : 0;
        const avgDisplay = avgMins >= 60 
            ? `${Math.floor(avgMins / 60)}h ${avgMins % 60}m` 
            : `${avgMins} phút`;

        return { total, resolved, pending, rate, avgDisplay };
    }, [filteredTickets]);

    // Leaderboard & Chart Data
    const staffStats = useMemo(() => {
        const stats: Record<string, any> = {};
        
        // Chỉ lấy các phiếu thuộc khoảng ngày, category và status hiện tại (bỏ qua filter nhân viên để tính toán cho bảng)
        const baseFiltered = allTickets.filter(ticket => {
            let passDate = true;
            if (dateRange && dateRange[0] && dateRange[1]) {
                const created = dayjs(ticket.createdAt);
                passDate = created.isBetween(dateRange[0], dateRange[1], 'day', '[]');
            }
            let passCategory = true;
            if (categoryFilter !== 'ALL') {
                passCategory = ticket.category === categoryFilter;
            }
            let passStatus = true;
            if (statusFilter !== 'ALL') {
                passStatus = ticket.status === statusFilter;
            }
            return passDate && passCategory && passStatus;
        });

        baseFiltered.forEach(t => {
            const name = t.assigneeName || 'Chưa phân công';
            if (!stats[name]) {
                stats[name] = { 
                    name, 
                    total: 0, 
                    resolved: 0, 
                    pending: 0, 
                    inProgress: 0,
                    software: 0, 
                    hardware: 0,
                    totalMins: 0,
                    resolvedCount: 0
                };
            }
            stats[name].total++;
            if (t.status === 'RESOLVED') {
                stats[name].resolved++;
                stats[name].resolvedCount++;
                const start = dayjs(t.createdAt);
                const end = dayjs(t.updatedAt);
                stats[name].totalMins += end.diff(start, 'minute');
            } else if (t.status === 'IN_PROGRESS') {
                stats[name].inProgress++;
            } else {
                stats[name].pending++;
            }

            if (t.category === 'SOFTWARE') stats[name].software++;
            else stats[name].hardware++;
        });

        return Object.values(stats).map(s => ({
            ...s,
            avgMins: s.resolvedCount > 0 ? Math.round(s.totalMins / s.resolvedCount) : 0,
            avgDisplay: s.resolvedCount > 0 
                ? (Math.round(s.totalMins / s.resolvedCount) >= 60 
                    ? `${Math.floor((s.totalMins / s.resolvedCount) / 60)}h ${Math.round((s.totalMins / s.resolvedCount) % 60)}m` 
                    : `${Math.round(s.totalMins / s.resolvedCount)}p`)
                : 'N/A'
        })).sort((a, b) => b.resolved - a.resolved);
    }, [allTickets, dateRange, categoryFilter, statusFilter]);

    // Export to Excel
    const exportToExcel = () => {
        const wsData = filteredTickets.map(t => {
            const created = dayjs(t.createdAt);
            const started = t.startedAt ? dayjs(t.startedAt) : null;
            const resolved = t.resolvedAt ? dayjs(t.resolvedAt) : (t.status === 'RESOLVED' ? dayjs(t.updatedAt) : null);
            
            let processTime = '';
            if (resolved) {
                const startCalc = started || created;
                const diffMins = resolved.diff(startCalc, 'minute');
                processTime = diffMins >= 60 ? `${Math.floor(diffMins/60)}h ${diffMins%60}m` : `${diffMins} phút`;
            }

            return {
                'Mã BA': t.ma_ba || '',
                'Loại lỗi': t.category === 'SOFTWARE' ? 'Phần mềm' : 'Phần cứng',
                'Khoa gửi': t.ma_khoa,
                'Người báo': t.dynamicFields?.['Người báo'] || '',
                'SĐT': t.dynamicFields?.['SĐT'] || '',
                'Mô tả lỗi': t.ten_loi,
                'Ghi chú thêm': t.dynamicFields?.['Ghi chú'] || '',
                'Thời gian yêu cầu': created.format('DD/MM/YYYY HH:mm'),
                'Thời gian bắt đầu': started ? started.format('DD/MM/YYYY HH:mm') : 'N/A',
                'Thời gian xong': resolved ? resolved.format('DD/MM/YYYY HH:mm') : '',
                'Thời gian xử lý': processTime,
                'Người xử lý': t.assigneeName || 'Chưa phân công',
                'Trạng thái': t.status === 'RESOLVED' ? 'Hoàn thành' : (t.status === 'IN_PROGRESS' ? 'Đang xử lý' : 'Chờ xử lý'),
                'Phản hồi CNTT': t.it_note || ''
            };
        });

        const ws = XLSX.utils.json_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "DanhSachLoi");
        XLSX.writeFile(wb, `Bao_Cao_IT_${dayjs().format('YYYYMMDD')}.xlsx`);
    };

    const tableColumns = [
        { title: 'Mã BA', dataIndex: 'ma_ba', key: 'ma_ba', width: 120, render: (text: string) => <span className="font-bold text-blue-600">{text}</span> },
        { 
            title: 'Lỗi yêu cầu', 
            dataIndex: 'ten_loi', 
            key: 'ten_loi', 
            width: 250,
            render: (text: string, record: Ticket) => (
                <div>
                    <div className="font-medium">{text}</div>
                    {record.dynamicFields && Object.keys(record.dynamicFields).length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                            {Object.entries(record.dynamicFields).map(([k, v]) => (
                                <Tag key={k} className="text-xs"><b>{k}:</b> {v as string}</Tag>
                            ))}
                        </div>
                    )}
                </div>
            )
        },
        { title: 'Khoa gửi', dataIndex: 'ma_khoa', key: 'ma_khoa', width: 100 },
        { title: 'Người xử lý', dataIndex: 'assigneeName', key: 'assigneeName', width: 150, render: (text: string) => text ? <Tag color="purple">{text}</Tag> : <Tag>Chưa PC</Tag> },
        { 
            title: 'TG Xử lý', 
            key: 'time', 
            width: 150,
            render: (_: any, record: Ticket) => {
                const created = dayjs(record.createdAt);
                if (record.status === 'RESOLVED' && record.updatedAt) {
                    const resolved = dayjs(record.updatedAt);
                    const diffMins = resolved.diff(created, 'minute');
                    const text = diffMins >= 60 ? `${Math.floor(diffMins/60)}h ${diffMins%60}m` : `${diffMins}p`;
                    return <Text type="success" strong>{text}</Text>;
                }
                return '-';
            }
        },
        { 
            title: 'Trạng thái', 
            dataIndex: 'status', 
            key: 'status', 
            width: 120,
            render: (status: string) => {
                if (status === 'IN_PROGRESS') return <Tag color="blue">Đang xử lý</Tag>;
                if (status === 'RESOLVED') return <Tag color="success">Hoàn thành</Tag>;
                return <Tag color="default">Chờ xử lý</Tag>;
            }
        }
    ];

    const staffColumns = [
        { title: 'Nhân viên IT', dataIndex: 'name', key: 'name', render: (text: string) => <Text strong>{text}</Text> },
        { title: 'Tổng', dataIndex: 'total', key: 'total', align: 'center' as const },
        { title: 'Đã xử lý', dataIndex: 'resolved', key: 'resolved', align: 'center' as const, render: (val: number) => <Text type="success" strong>{val}</Text> },
        { title: 'Đang xử lý', dataIndex: 'inProgress', key: 'inProgress', align: 'center' as const, render: (val: number) => <Text type="warning" strong>{val}</Text> },
        { title: 'Đang chờ', dataIndex: 'pending', key: 'pending', align: 'center' as const, render: (val: number) => <Text type="danger">{val}</Text> },
        { title: 'Phần Mềm', dataIndex: 'software', key: 'software', align: 'center' as const },
        { title: 'Phần Cứng', dataIndex: 'hardware', key: 'hardware', align: 'center' as const },
        { title: 'TG Trung bình', dataIndex: 'avgDisplay', key: 'avgDisplay', align: 'right' as const, render: (text: string) => <Tag color="blue">{text}</Tag> },
    ];

    const detailedTableColumns = [
        { title: 'Mã BA', dataIndex: 'ma_ba', key: 'ma_ba', width: 100, fixed: 'left' as const, render: (text: string) => <span className="font-bold text-blue-600">{text}</span> },
        { title: 'Loại sự cố', dataIndex: 'category', key: 'category', width: 120, render: (cat: string) => cat === 'SOFTWARE' ? 'Phần mềm' : 'Phần cứng' },
        { title: 'Khoa gửi', dataIndex: 'ma_khoa', key: 'ma_khoa', width: 100 },
        { title: 'Người báo', key: 'nguoibao', width: 120, render: (_: any, record: Ticket) => record.dynamicFields?.['Người báo'] || '' },
        { title: 'Mô tả lỗi', dataIndex: 'ten_loi', key: 'ten_loi', width: 250 },
        { title: 'TG Yêu cầu', key: 'createdAt', width: 140, render: (_: any, record: Ticket) => dayjs(record.createdAt).format('DD/MM/YY HH:mm') },
        { title: 'TG Bắt đầu', key: 'startedAt', width: 140, render: (_: any, record: Ticket) => record.startedAt ? dayjs(record.startedAt).format('DD/MM/YY HH:mm') : <Text type="secondary">N/A</Text> },
        { title: 'TG Hoàn thành', key: 'resolvedAt', width: 140, render: (_: any, record: Ticket) => {
            const resolved = record.resolvedAt ? dayjs(record.resolvedAt) : (record.status === 'RESOLVED' ? dayjs(record.updatedAt) : null);
            return resolved ? resolved.format('DD/MM/YY HH:mm') : '-';
        }},
        { title: 'TG Xử lý', key: 'processTime', width: 100, render: (_: any, record: Ticket) => {
            const resolved = record.resolvedAt ? dayjs(record.resolvedAt) : (record.status === 'RESOLVED' ? dayjs(record.updatedAt) : null);
            if (!resolved) return '-';
            const startCalc = record.startedAt ? dayjs(record.startedAt) : dayjs(record.createdAt);
            const diffMins = resolved.diff(startCalc, 'minute');
            return <Text strong>{diffMins >= 60 ? `${Math.floor(diffMins/60)}h ${diffMins%60}m` : `${diffMins}p`}</Text>;
        }},
        { title: 'Người xử lý', dataIndex: 'assigneeName', key: 'assigneeName', width: 130 },
        { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 120, fixed: 'right' as const, render: (status: string) => {
            if (status === 'IN_PROGRESS') return <Tag color="blue">Đang XL</Tag>;
            if (status === 'RESOLVED') return <Tag color="success">Hoàn thành</Tag>;
            return <Tag color="default">Chờ XL</Tag>;
        }}
    ];

    if (!canViewReport) {
        return <div className="p-8 text-center text-red-500 font-medium">Bạn không có quyền truy cập trang này.</div>;
    }

    if (loading && allTickets.length === 0) {
        return <div className="p-10 flex justify-center"><Spin size="large" /></div>;
    }

    return (
        <div className="p-4 sm:p-6 bg-slate-50 min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <Title level={2} className="!mb-1">Báo Cáo Yêu Cầu Khoa Phòng</Title>
                    <Text className="text-slate-500">Thống kê khối lượng công việc và tiến độ xử lý yêu cầu.</Text>
                </div>
                <Button type="primary" icon={<ReloadOutlined />} onClick={fetchTickets}>
                    Làm mới dữ liệu
                </Button>
            </div>

            {/* Filters */}
            <Card className="mb-6 shadow-sm border-none rounded-xl">
                <div className="flex flex-wrap gap-4 items-center">
                    <div>
                        <Text className="block mb-1 font-medium text-slate-600">Khoảng thời gian</Text>
                        <RangePicker 
                            value={dateRange} 
                            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])} 
                            format="DD/MM/YYYY"
                            allowClear={true}
                        />
                    </div>
                    <div>
                        <Text className="block mb-1 font-medium text-slate-600">Loại sự cố</Text>
                        <Select 
                            value={categoryFilter} 
                            onChange={setCategoryFilter}
                            style={{ width: 180 }}
                            options={[
                                { value: 'ALL', label: 'Tất cả' },
                                { value: 'SOFTWARE', label: 'Lỗi Bệnh án / PM' },
                                { value: 'HARDWARE', label: 'Lỗi Phần cứng / Thiết bị' },
                            ]}
                        />
                    </div>
                    <div>
                        <Text className="block mb-1 font-medium text-slate-600">Tình trạng xử lý</Text>
                        <Select 
                            value={statusFilter} 
                            onChange={setStatusFilter}
                            style={{ width: 160 }}
                            options={[
                                { value: 'ALL', label: 'Tất cả trạng thái' },
                                { value: 'PENDING', label: 'Chờ xử lý' },
                                { value: 'IN_PROGRESS', label: 'Đang xử lý' },
                                { value: 'TRANSFERRING', label: 'Đang chuyển giao' },
                                { value: 'RESOLVED', label: 'Hoàn thành' },
                            ]}
                        />
                    </div>
                    <div>
                        <Text className="block mb-1 font-medium text-slate-600">Nhân viên IT</Text>
                        <Select 
                            value={selectedStaff} 
                            onChange={setSelectedStaff}
                            style={{ width: 180 }}
                            allowClear
                            placeholder="Tất cả nhân viên"
                        >
                            {staffStats.map(s => (
                                <Select.Option key={s.name} value={s.name}>{s.name}</Select.Option>
                            ))}
                        </Select>
                    </div>
                    <div className="pt-6 ml-2">
                        <Button type="primary" onClick={() => setIsDetailModalVisible(true)} className="bg-indigo-600 hover:bg-indigo-500">
                            Xem thống kê (Chi tiết)
                        </Button>
                    </div>
                    <div className="ml-auto pt-5">
                        {selectedStaff && (
                            <Button onClick={() => setSelectedStaff(null)} type="link" className="text-slate-500">
                                Bỏ lọc nhân viên
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

            {/* KPIs */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} md={6}>
                    <Card className="shadow-sm border-none rounded-xl" styles={{ body: { padding: '20px' } }}>
                        <Statistic title="Tổng Số Phiếu" value={kpis.total} prefix={<InfoCircleOutlined className="text-blue-500" />} styles={{ content: { color: '#0f172a', fontWeight: 'bold' } }} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="shadow-sm border-none rounded-xl" styles={{ body: { padding: '20px' } }}>
                        <Statistic title="Tỷ lệ Hoàn Thành" value={kpis.rate} suffix="%" prefix={<CheckCircleOutlined className="text-green-500" />} styles={{ content: { color: '#16a34a', fontWeight: 'bold' } }} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="shadow-sm border-none rounded-xl" styles={{ body: { padding: '20px' } }}>
                        <Statistic title="Tồn đọng (Chờ/Đang XL)" value={kpis.pending} styles={{ content: { color: '#dc2626', fontWeight: 'bold' } }} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="shadow-sm border-none rounded-xl" styles={{ body: { padding: '20px' } }}>
                        <Statistic title="TG Xử lý Trung Bình" value={kpis.avgDisplay} prefix={<ClockCircleOutlined className="text-orange-500" />} styles={{ content: { color: '#ea580c', fontWeight: 'bold' } }} />
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} lg={16}>
                    <Card title="Khối lượng công việc & Tiến độ" className="shadow-sm border-none rounded-xl h-full">
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={staffStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <RechartsTooltip cursor={{fill: '#f1f5f9'}} />
                                    <Legend />
                                    <Bar dataKey="resolved" name="Đã Xong" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                                    <Bar dataKey="inProgress" name="Đang xử lý" stackId="a" fill="#f59e0b" />
                                    <Bar dataKey="pending" name="Đang chờ" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Thời gian xử lý trung bình (Phút)" className="shadow-sm border-none rounded-xl h-full">
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={staffStats} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
                                    <RechartsTooltip cursor={{fill: '#f1f5f9'}} formatter={(val: any) => [`${val} phút`, 'Thời gian TB']} />
                                    <Bar dataKey="avgMins" name="Phút" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Leaderboard Table */}
            <Card title="Bảng Chi tiết Năng suất Cá nhân" className="mb-6 shadow-sm border-none rounded-xl overflow-hidden">
                <Table 
                    dataSource={staffStats} 
                    columns={staffColumns} 
                    pagination={false}
                    rowKey="name"
                    onRow={(record) => ({
                        onClick: () => {
                            if (selectedStaff === record.name) {
                                setSelectedStaff(null);
                            } else {
                                setSelectedStaff(record.name);
                                // Cuộn xuống danh sách chi tiết
                                setTimeout(() => {
                                    document.getElementById('details-table')?.scrollIntoView({ behavior: 'smooth' });
                                }, 100);
                            }
                        },
                        className: 'cursor-pointer hover:bg-blue-50 transition-colors'
                    })}
                    rowClassName={(record) => record.name === selectedStaff ? 'bg-blue-50' : ''}
                />
            </Card>

            {/* Detailed Table */}
            <Card 
                id="details-table"
                title={`Danh sách Lỗi chi tiết ${selectedStaff ? `của ${selectedStaff}` : ''}`} 
                extra={
                    <Button type="primary" icon={<DownloadOutlined />} onClick={exportToExcel} className="bg-green-600 hover:bg-green-500">
                        Xuất Excel
                    </Button>
                }
                className="shadow-sm border-none rounded-xl"
            >
                <Table 
                    dataSource={filteredTickets} 
                    columns={tableColumns} 
                    rowKey="id"
                    pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (total) => `Tổng: ${total} lỗi` }}
                    scroll={{ x: 800 }}
                    size="middle"
                />
            </Card>

            <Modal
                title="Bảng Thống Kê Dữ Liệu Chi Tiết"
                open={isDetailModalVisible}
                onCancel={() => setIsDetailModalVisible(false)}
                footer={null}
                width={1400}
                style={{ top: 20 }}
            >
                <div className="mb-4 flex justify-end">
                    <Button type="primary" icon={<DownloadOutlined />} onClick={exportToExcel} className="bg-green-600 hover:bg-green-500">
                        Xuất file Excel
                    </Button>
                </div>
                <Table 
                    dataSource={filteredTickets} 
                    columns={detailedTableColumns} 
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1500, y: 'calc(100vh - 300px)' }}
                    size="small"
                    bordered
                />
            </Modal>
        </div>
    );
}
