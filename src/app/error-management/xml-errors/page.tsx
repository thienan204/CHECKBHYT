'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Card, message } from 'antd';
import { ExceptionOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface XmlError {
    id: string;
    ma_lk: string;
    ma_bn: string;
    ma_khoa: string;
    ten_khoa: string;
    ho_ten: string;
    ma_the: string;
    ngay_vao: string;
    ngay_ra: string;
    ma_dv: string;
    ten_dv: string;
    chi_tiet_loi: string;
    status: string;
    departmentNote: string;
    adminNote: string;
    createdAt: string;
}

export default function XmlErrorsPage() {
    const [errors, setErrors] = useState<XmlError[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedError, setSelectedError] = useState<XmlError | null>(null);
    const [form] = Form.useForm();

    const fetchErrors = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/error-management/xml-errors');
            if (res.ok) {
                const data = await res.json();
                setErrors(data);
            } else {
                message.error('Không thể tải danh sách lỗi XML');
            }
        } catch (error) {
            message.error('Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchErrors();
    }, []);

    const handleUpdate = async (values: any) => {
        if (!selectedError) return;
        try {
            const res = await fetch('/api/error-management/xml-errors', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedError.id,
                    status: values.status,
                    departmentNote: values.departmentNote,
                    adminNote: values.adminNote
                })
            });

            if (res.ok) {
                message.success('Cập nhật giải trình thành công!');
                setIsModalVisible(false);
                fetchErrors();
            } else {
                message.error('Cập nhật thất bại');
            }
        } catch (error) {
            message.error('Lỗi kết nối');
        }
    };

    const columns = [
        {
            title: 'Mã LK / Bệnh nhân',
            key: 'patient_info',
            width: 200,
            render: (_: any, record: XmlError) => (
                <div>
                    <div className="font-bold text-blue-600">{record.ma_lk}</div>
                    <div className="text-sm font-semibold">{record.ho_ten}</div>
                    <div className="text-xs text-slate-500">{record.ma_bn}</div>
                </div>
            )
        },
        {
            title: 'Khoa',
            dataIndex: 'ten_khoa',
            key: 'ten_khoa',
            width: 150,
            render: (text: string, record: XmlError) => (
                <div>
                    <div>{text}</div>
                    <Tag className="mt-1">{record.ma_khoa}</Tag>
                </div>
            )
        },
        {
            title: 'Dịch vụ / Thuốc',
            key: 'service_info',
            width: 200,
            render: (_: any, record: XmlError) => (
                <div>
                    <div className="font-medium text-slate-700">{record.ten_dv}</div>
                    <div className="text-xs text-slate-400">{record.ma_dv}</div>
                </div>
            )
        },
        {
            title: 'Chi tiết Lỗi',
            dataIndex: 'chi_tiet_loi',
            key: 'chi_tiet_loi',
            width: 300,
            render: (text: string) => <div className="text-red-600 font-medium whitespace-pre-wrap">{text}</div>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: string) => {
                let color = 'default';
                let label = 'Chờ xử lý';
                if (status === 'EXPLAINED') { color = 'blue'; label = 'Đã giải trình'; }
                if (status === 'RESOLVED') { color = 'success'; label = 'Đã duyệt'; }
                return <Tag color={color}>{label}</Tag>;
            }
        },
        {
            title: 'Giải trình (Khoa)',
            dataIndex: 'departmentNote',
            key: 'departmentNote',
            width: 200,
            render: (text: string) => <div className="text-slate-600 italic whitespace-pre-wrap">{text || '-'}</div>
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 100,
            fixed: 'right' as const,
            render: (_: any, record: XmlError) => (
                <Button size="small" type="primary" ghost icon={<EditOutlined />} onClick={() => {
                    setSelectedError(record);
                    form.setFieldsValue({
                        status: record.status,
                        departmentNote: record.departmentNote,
                        adminNote: record.adminNote
                    });
                    setIsModalVisible(true);
                }}>Xử lý</Button>
            )
        }
    ];

    return (
        <div className="w-full max-w-[1600px] mx-auto px-[30px] py-6 space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center text-2xl">
                        <ExceptionOutlined />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-1">Lỗi Read XML</h1>
                        <p className="text-slate-500 m-0">Danh sách lỗi phát hiện từ phần mềm đọc XML để các Khoa giải trình</p>
                    </div>
                </div>
                <Button onClick={fetchErrors} loading={loading}>Làm mới</Button>
            </div>

            <Card className="shadow-sm rounded-2xl overflow-hidden border-slate-100" styles={{ body: { padding: 0 } }}>
                <Table 
                    dataSource={errors} 
                    columns={columns} 
                    rowKey="id" 
                    loading={loading}
                    pagination={{ defaultPageSize: 10 }}
                    scroll={{ x: 1200 }}
                />
            </Card>

            <Modal
                title="Xử lý / Giải trình Lỗi XML"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => form.submit()}
                okText="Lưu cập nhật"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical" onFinish={handleUpdate}>
                    <Form.Item name="status" label="Trạng thái">
                        <Select>
                            <Select.Option value="PENDING">Chờ xử lý</Select.Option>
                            <Select.Option value="EXPLAINED">Đã giải trình (Khoa)</Select.Option>
                            <Select.Option value="RESOLVED">Đã duyệt / Đóng (Admin)</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="departmentNote" label="Giải trình của Khoa">
                        <Input.TextArea rows={4} placeholder="Khoa nhập lý do / giải trình tại đây..." />
                    </Form.Item>
                    <Form.Item name="adminNote" label="Ghi chú của Admin (Duyệt/Phản hồi)">
                        <Input.TextArea rows={3} placeholder="Admin nhập phản hồi..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
