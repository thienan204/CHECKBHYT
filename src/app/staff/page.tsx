'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Form, message, Upload, Breadcrumb, Card, Space, Drawer, Popconfirm, Select } from 'antd';
import { PlusOutlined, UploadOutlined, EditOutlined, DeleteOutlined, SearchOutlined, HomeOutlined, FileExcelOutlined } from '@ant-design/icons';
import { getBasePath } from '@/utils/config';
import * as XLSX from 'xlsx';
import Link from 'next/link';

interface Department {
    ma_khoa: string;
    ten_khoa: string;
}

interface Staff {
    id?: string;
    ho_ten: string;
    ma_bac_si: string;
    trinh_do?: string;
    chuc_danh?: string;
    so_dien_thoai?: string;
    ma_khoa: string;
    department?: Department;
}

export default function StaffPage() {
    const [staffs, setStaffs] = useState<Staff[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [form] = Form.useForm();

    const fetchStaffs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${getBasePath()}/api/staff?t=${new Date().getTime()}`, {
                cache: 'no-store'
            });
            if (res.ok) {
                const data = await res.json();
                setStaffs(data);
            } else {
                message.error('Lỗi tải danh sách nhân viên');
            }
        } catch (error) {
            message.error('Lỗi kết nối');
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await fetch(`${getBasePath()}/api/departments?t=${new Date().getTime()}`, {
                cache: 'no-store'
            });
            if (res.ok) {
                const data = await res.json();
                setDepartments(data);
            }
        } catch (error) {
            console.error('Lỗi tải danh sách khoa:', error);
        }
    };

    useEffect(() => {
        fetchStaffs();
        fetchDepartments();
    }, []);

    const handleSave = async (values: Staff) => {
        try {
            const bodyData = {
                ...values,
                id: editingStaff?.id
            };

            const res = await fetch(`${getBasePath()}/api/staff`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData),
            });
            if (res.ok) {
                message.success('Lưu thành công');
                setIsDrawerOpen(false);
                form.resetFields();
                setEditingStaff(null);
                fetchStaffs();
            } else {
                message.error('Lỗi khi lưu');
            }
        } catch (error) {
            message.error('Lỗi kết nối');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/staff?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                message.success('Xóa thành công');
                fetchStaffs();
            } else {
                message.error('Lỗi khi xóa');
            }
        } catch (error) {
            message.error('Lỗi kết nối');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedRowKeys.length === 0) return;
        try {
            const res = await fetch(`/api/staff?ids=${selectedRowKeys.join(',')}`, { method: 'DELETE' });
            if (res.ok) {
                message.success('Xóa thành công các nhân viên đã chọn');
                setSelectedRowKeys([]);
                fetchStaffs();
            } else {
                message.error('Lỗi khi xóa');
            }
        } catch (error) {
            message.error('Lỗi kết nối');
        }
    };

    const handleImportExcel = (file: File) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const bstr = e.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                // Map data to expected format
                const mappedData = data.map((row: any) => ({
                    ma_bac_si: String(row['Mã Bác Sĩ'] || row['MA_BAC_SI'] || row['ma_bac_si'] || ''),
                    ho_ten: String(row['Họ Tên'] || row['HO_TEN'] || row['ho_ten'] || ''),
                    trinh_do: String(row['Trình Độ'] || row['TRINH_DO'] || row['trinh_do'] || ''),
                    chuc_danh: String(row['Chức Danh'] || row['CHUC_DANH'] || row['chuc_danh'] || ''),
                    so_dien_thoai: String(row['Số điện thoại'] || row['SO_DIEN_THOAI'] || row['so_dien_thoai'] || ''),
                    ma_khoa: String(row['Mã Khoa'] || row['MA_KHOA'] || row['ma_khoa'] || '')
                })).filter(item => item.ma_bac_si && item.ho_ten && item.ma_khoa);

                if (mappedData.length === 0) {
                    message.warning('Không tìm thấy dữ liệu hợp lệ (cần cột ma_bac_si, ho_ten, ma_khoa)');
                    return;
                }

                const res = await fetch(`${getBasePath()}/api/staff`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(mappedData),
                });

                if (res.ok) {
                    const result = await res.json();
                    message.success(`Đã import thành công ${result.count || mappedData.length} bản ghi`);
                    fetchStaffs();
                } else {
                    message.error('Lỗi import');
                }

            } catch (error) {
                message.error('Lỗi đọc file Excel');
            }
        };
        reader.readAsBinaryString(file);
        return false; // Prevent upload action traversing
    };

    const columns = [
        {
            title: 'Họ Tên',
            dataIndex: 'ho_ten',
            key: 'ho_ten',
            width: 200,
            sorter: (a: Staff, b: Staff) => a.ho_ten.localeCompare(b.ho_ten),
        },
        {
            title: 'Mã Bác Sĩ',
            dataIndex: 'ma_bac_si',
            key: 'ma_bac_si',
            width: 150,
            sorter: (a: Staff, b: Staff) => a.ma_bac_si.localeCompare(b.ma_bac_si),
        },
        {
            title: 'Trình Độ',
            dataIndex: 'trinh_do',
            key: 'trinh_do',
            width: 150,
        },
        {
            title: 'Chức Danh',
            dataIndex: 'chuc_danh',
            key: 'chuc_danh',
            width: 150,
        },
        {
            title: 'SĐT',
            dataIndex: 'so_dien_thoai',
            key: 'so_dien_thoai',
            width: 120,
        },
        {
            title: 'Khoa Phòng',
            key: 'ma_khoa',
            width: 250,
            render: (_: any, record: Staff) => (
                <span>{record.department?.ten_khoa || record.ma_khoa}</span>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: Staff) => (
                <Space size="middle">
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => {
                            setEditingStaff(record);
                            form.setFieldsValue(record);
                            setIsDrawerOpen(true);
                        }}
                    />
                    <Popconfirm title="Bạn có chắc chắn muốn xóa?" onConfirm={() => handleDelete(record.id!)}>
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const filteredData = staffs.filter(s =>
        s.ho_ten.toLowerCase().includes(searchText.toLowerCase()) ||
        s.ma_bac_si.toLowerCase().includes(searchText.toLowerCase()) ||
        s.department?.ten_khoa.toLowerCase().includes(searchText.toLowerCase()) ||
        (s.so_dien_thoai && s.so_dien_thoai.includes(searchText)) ||
        s.ma_khoa.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6 pt-12">
            <div className="max-w-[1200px] mx-auto space-y-6">
                <Breadcrumb items={[{ title: <Link href="/"><HomeOutlined /> Trang chủ</Link> }, { title: 'Quản lý Nhân Viên' }]} />

                <Card
                    title={<span className="text-xl font-bold text-slate-800">Quản lý Nhân Viên</span>}
                    extra={
                        <Space>
                            <Input
                                placeholder="Tìm kiếm tên, mã BS, khoa..."
                                prefix={<SearchOutlined />}
                                onChange={e => setSearchText(e.target.value)}
                                style={{ width: 250 }}
                            />
                            <Button
                                icon={<FileExcelOutlined />}
                                onClick={() => {
                                    const wb = XLSX.utils.book_new();
                                    const ws = XLSX.utils.json_to_sheet([
                                        { "Họ Tên": 'Nguyễn Văn A', "Mã Bác Sĩ": 'BS01', "Trình Độ": 'Thạc sĩ', "Chức Danh": 'Trưởng khoa', "Số điện thoại": "0987654321", "Mã Khoa": 'K01' },
                                        { "Họ Tên": 'Trần Thị B', "Mã Bác Sĩ": 'BS02', "Trình Độ": 'Cử nhân', "Chức Danh": 'Điều dưỡng', "Số điện thoại": "", "Mã Khoa": 'K02' }
                                    ]);
                                    XLSX.utils.book_append_sheet(wb, ws, "Staffs");
                                    XLSX.writeFile(wb, "Mau_nhap_nhan_vien.xlsx");
                                }}
                            >
                                Tải file mẫu
                            </Button>
                            <Upload beforeUpload={handleImportExcel} showUploadList={false} accept=".xlsx,.xls">
                                <Button icon={<UploadOutlined />}>Import Excel</Button>
                            </Upload>
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                                setEditingStaff(null);
                                form.resetFields();
                                setIsDrawerOpen(true);
                            }}>
                                Thêm mới
                            </Button>
                            {selectedRowKeys.length > 0 && (
                                <Popconfirm title={`Xóa ${selectedRowKeys.length} nhân viên đã chọn?`} onConfirm={handleBulkDelete}>
                                    <Button danger icon={<DeleteOutlined />}>
                                        Xóa đã chọn
                                    </Button>
                                </Popconfirm>
                            )}
                        </Space>
                    }
                >
                    <Table
                        rowSelection={{
                            selectedRowKeys,
                            onChange: newSelectedRowKeys => setSelectedRowKeys(newSelectedRowKeys),
                        }}
                        columns={columns}
                        dataSource={filteredData}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                    />
                </Card>

                <Drawer
                    title={editingStaff ? "Cập nhật Nhân Viên" : "Thêm mới Nhân Viên"}
                    size="default"
                    onClose={() => setIsDrawerOpen(false)}
                    open={isDrawerOpen}
                    extra={
                        <Space>
                            <Button onClick={() => setIsDrawerOpen(false)}>Hủy</Button>
                            <Button type="primary" onClick={() => form.submit()}>Lưu</Button>
                        </Space>
                    }
                >
                    <Form form={form} layout="vertical" onFinish={handleSave}>
                        <Form.Item
                            name="ho_ten"
                            label="Họ Tên"
                            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="ma_bac_si"
                            label="Mã Bác Sĩ"
                            rules={[{ required: true, message: 'Vui lòng nhập mã bác sĩ' }]}
                        >
                            <Input disabled={!!editingStaff} />
                        </Form.Item>
                        <Form.Item
                            name="trinh_do"
                            label="Trình Độ"
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="chuc_danh"
                            label="Chức Danh"
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="so_dien_thoai"
                            label="Số Điện Thoại"
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="ma_khoa"
                            label="Khoa Phòng"
                            rules={[{ required: true, message: 'Vui lòng chọn khoa phòng' }]}
                        >
                            <Select
                                showSearch
                                placeholder="Chọn khoa phòng"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                }
                                options={departments.map(dept => ({
                                    value: dept.ma_khoa,
                                    label: `${dept.ma_khoa} - ${dept.ten_khoa}`
                                }))}
                            />
                        </Form.Item>
                    </Form>
                </Drawer>
            </div>
        </div>
    );
}
