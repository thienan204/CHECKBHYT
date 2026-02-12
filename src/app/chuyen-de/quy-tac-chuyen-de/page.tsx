'use client'

import React, { useState, useEffect } from 'react'
import {
    Table, Button, Modal, Form, Input,
    Switch, InputNumber, Select, message, Tag, Space, Popconfirm, AutoComplete
} from 'antd'
import {
    PlusOutlined, EditOutlined, DeleteOutlined,
    CodeOutlined
} from '@ant-design/icons'
import {
    getSpecializedRules,
    createSpecializedRule,
    updateSpecializedRule,
    deleteSpecializedRule
} from '@/actions/specialized-rules'

const { TextArea } = Input

// Custom Input Component for Duplicate Bed Logic
const DuplicateBedConfigInput = ({ value, onChange }: { value?: string, onChange?: (val: string) => void }) => {
    // Parse initial value or use defaults
    const getInitialState = () => {
        try {
            if (value) {
                const parsed = JSON.parse(value);
                return {
                    bed: parsed.fields?.bed || 'MA_GIUONG',
                    startTime: parsed.fields?.startTime || 'NGAY_YL',
                    endTime: parsed.fields?.endTime || 'NGAY_KQ',
                    maNhom: parsed.filter?.MA_NHOM !== undefined ? parsed.filter.MA_NHOM : 15,
                    tyleTtDv: parsed.filter?.TYLE_TT_DV || '',
                    includeServices: parsed.filter?.MA_DICH_VU_INCLUDE || [],
                    excludeServices: parsed.filter?.MA_DICH_VU_EXCLUDE || [],
                    tolerance: parsed.toleranceMinutes !== undefined ? parsed.toleranceMinutes : 15
                };
            }
        } catch (e) { }
        return {
            bed: 'MA_GIUONG',
            startTime: 'NGAY_YL',
            endTime: 'NGAY_KQ',
            maNhom: 15,
            tyleTtDv: '',
            includeServices: [],
            excludeServices: [],
            tolerance: 15
        };
    };

    const [state, setState] = useState(getInitialState());

    // Reset state when value changes (e.g. switching rules)
    useEffect(() => {
        setState(getInitialState());
    }, [value]);

    // Trigger Update
    const triggerChange = (newState: any) => {
        setState(newState);
        if (onChange) {
            const filter: any = {
                MA_NHOM: Number(newState.maNhom)
            };
            if (newState.tyleTtDv) {
                filter.TYLE_TT_DV = Number(newState.tyleTtDv);
            }
            if (newState.includeServices && newState.includeServices.length > 0) {
                filter.MA_DICH_VU_INCLUDE = newState.includeServices;
            }
            if (newState.excludeServices && newState.excludeServices.length > 0) {
                filter.MA_DICH_VU_EXCLUDE = newState.excludeServices;
            }

            const json = {
                type: "DUPLICATE_BED",
                fields: {
                    bed: newState.bed,
                    room: "MA_PHONG", // Default hardcoded for now or allow config if needed
                    department: "MA_KHOA",
                    startTime: newState.startTime,
                    endTime: newState.endTime
                },
                filter: filter,
                toleranceMinutes: Number(newState.tolerance)
            };
            onChange(JSON.stringify(json, null, 2));
        }
    };

    const handleChange = (key: string, val: any) => {
        const newState = { ...state, [key]: val };
        triggerChange(newState);
    };

    return (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Trường kiểm tra (Giường/Key Check)</label>
                    <Select
                        mode="tags"
                        value={Array.isArray(state.bed) ? state.bed : [state.bed]}
                        onChange={(v) => handleChange('bed', v)}
                        className="w-full"
                        placeholder="Chọn trường kiểm tra trùng"
                        options={[
                            { label: 'MA_GIUONG (Mã Giường)', value: 'MA_GIUONG' },
                            { label: 'MA_DICH_VU (Mã DV)', value: 'MA_DICH_VU' },
                            { label: 'MA_VAT_TU (Mã Vật Tư)', value: 'MA_VAT_TU' },
                            { label: 'MA_KHOA (Mã Khoa)', value: 'MA_KHOA' },
                            { label: 'MA_PHONG (Mã Phòng)', value: 'MA_PHONG' },
                            { label: 'MA_MAY (Mã Máy)', value: 'MA_MAY' },
                            { label: 'MA_BS (Mã Bác Sĩ)', value: 'MA_BS' },
                        ]}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Mã Nhóm (Filter)</label>
                    <InputNumber
                        value={state.maNhom}
                        onChange={(v) => handleChange('maNhom', v)}
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Tỷ lệ DV (Filter)</label>
                    <InputNumber
                        value={state.tyleTtDv}
                        onChange={(v) => handleChange('tyleTtDv', v)}
                        className="w-full"
                        placeholder="Ví dụ: 100"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">LỌC MÃ DV (Chỉ lấy)</label>
                    <Select
                        mode="tags"
                        value={state.includeServices}
                        onChange={(v) => handleChange('includeServices', v)}
                        className="w-full"
                        placeholder="Nhập mã DV muốn lọc..."
                        open={false}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">LOẠI TRỪ MÃ DV (Bỏ qua)</label>
                    <Select
                        mode="tags"
                        value={state.excludeServices}
                        onChange={(v) => handleChange('excludeServices', v)}
                        className="w-full"
                        placeholder="Nhập mã DV muốn bỏ qua..."
                        open={false}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Thời gian bắt đầu</label>
                    <Select
                        value={state.startTime}
                        onChange={(v) => handleChange('startTime', v)}
                        className="w-full"
                        options={[
                            { label: 'NGAY_YL (Ngày Y Lệnh)', value: 'NGAY_YL' },
                            { label: 'NGAY_TH_YL (Ngày TH Y Lệnh)', value: 'NGAY_TH_YL' },
                            { label: 'NGAY_VAO (Ngày Vào)', value: 'NGAY_VAO' },
                            { label: 'NGAY_KQ (Ngày Kết Quả)', value: 'NGAY_KQ' }
                        ]}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Thời gian kết thúc</label>
                    <Select
                        value={state.endTime}
                        onChange={(v) => handleChange('endTime', v)}
                        className="w-full"
                        options={[
                            { label: 'NGAY_KQ (Ngày Kết Quả)', value: 'NGAY_KQ' },
                            { label: 'NGAY_RA (Ngày Ra)', value: 'NGAY_RA' },
                            { label: 'NGAY_YL (Ngày Y Lệnh)', value: 'NGAY_YL' },
                            { label: 'NGAY_TH_YL (Ngày TH Y Lệnh)', value: 'NGAY_TH_YL' }
                        ]}
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Sai số cho phép (Phút)</label>
                <InputNumber
                    value={state.tolerance}
                    onChange={(v) => handleChange('tolerance', v)}
                    className="w-full"
                />
                <div className="text-xs text-slate-400 mt-1">Khoảng thời gian trùng lặp tối thiểu để báo lỗi.</div>
            </div>
        </div>
    );
};

export default function ConfigPage() {
    const [rules, setRules] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingRule, setEditingRule] = useState<any>(null)
    const [editorMode, setEditorMode] = useState<'JSON' | 'DUPLICATE_BED' | 'MACHINE_CHECK'>('JSON');
    const [form] = Form.useForm()

    const detectEditorMode = (jsonString: string) => {
        try {
            const parsed = JSON.parse(jsonString);
            if (parsed.type === 'DUPLICATE_BED') return 'DUPLICATE_BED';
            if (parsed.type === 'MACHINE_CHECK') return 'MACHINE_CHECK';
        } catch (e) { }
        return 'JSON';
    }

    const fetchRules = async () => {
        setLoading(true)
        const res = await getSpecializedRules()
        if (res.success) {
            setRules(res.data || [])
        } else {
            message.error(res.error)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchRules()
    }, [])

    const handleAdd = () => {
        setEditingRule(null)
        form.resetFields()
        // Default
        const defaultConfig = JSON.stringify({
            fields: { machineCode: "MA_MAY" },
            constraints: { maxPerDay: 50 },
            type: "MACHINE_CHECK"
        }, null, 2);

        form.setFieldsValue({
            isActive: true,
            order: rules.length + 1,
            ruleType: 'MACHINE_CHECK',
            logicConfig: defaultConfig
        })
        setEditorMode('MACHINE_CHECK');
        setIsModalOpen(true)
    }

    const handleEdit = (record: any) => {
        setEditingRule(record)
        const jsonConfig = JSON.stringify(record.logicConfig, null, 2);
        form.setFieldsValue({
            ...record,
            logicConfig: jsonConfig
        })
        setEditorMode(detectEditorMode(jsonConfig));
        setIsModalOpen(true)
    }

    const handleModeChange = (mode: 'JSON' | 'DUPLICATE_BED' | 'MACHINE_CHECK') => {
        setEditorMode(mode);
        const templates = {
            'DUPLICATE_BED': {
                type: "DUPLICATE_BED",
                fields: {
                    bed: "MA_GIUONG",
                    room: "MA_PHONG",
                    department: "MA_KHOA",
                    startTime: "NGAY_YL",
                    endTime: "NGAY_KQ"
                },
                filter: { MA_NHOM: 15 },
                toleranceMinutes: 15
            },
            'MACHINE_CHECK': {
                type: "MACHINE_CHECK",
                fields: { machineCode: "MA_MAY" },
                constraints: { maxPerDay: 50 }
            }
        };

        if (mode !== 'JSON' && templates[mode]) {
            form.setFieldValue('logicConfig', JSON.stringify(templates[mode], null, 2));
        }
    };

    const handleDelete = async (id: string) => {
        const res = await deleteSpecializedRule(id)
        if (res.success) {
            message.success('Đã xóa quy tắc')
            fetchRules()
        } else {
            message.error(res.error)
        }
    }

    const handleSave = async () => {
        try {
            const values = await form.validateFields()

            // Parse JSON
            let logicConfigParsed = {}
            try {
                logicConfigParsed = JSON.parse(values.logicConfig)
            } catch (e) {
                message.error('Cấu hình Logic không đúng định dạng JSON')
                return
            }

            const payload = {
                ...values,
                logicConfig: logicConfigParsed
            }

            let res
            if (editingRule) {
                res = await updateSpecializedRule(editingRule.id, payload)
            } else {
                res = await createSpecializedRule(payload)
            }

            if (res.success) {
                message.success(editingRule ? 'Đã cập nhật' : 'Đã thêm mới')
                setIsModalOpen(false)
                fetchRules()
            } else {
                message.error(res.error)
            }
        } catch (error) {
            // Validation error
        }
    }

    const columns = [
        {
            title: 'Tên quy tắc',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: any) => (
                <div>
                    <div className="font-semibold">{text}</div>
                    <div className="text-xs text-slate-400">{record.slug}</div>
                </div>
            )
        },
        {
            title: 'Loại',
            dataIndex: 'ruleType',
            key: 'ruleType',
            width: 150,
            render: (type: string) => {
                let color = 'default'
                if (type === 'DUPLICATE_BED') color = 'orange'
                if (type === 'MACHINE_CHECK') color = 'blue'
                return <Tag color={color}>{type}</Tag>
            }
        },
        {
            title: 'Thứ tự',
            dataIndex: 'order',
            key: 'order',
            width: 80,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 100,
            render: (active: boolean) => (
                <Tag color={active ? 'success' : 'error'}>
                    {active ? 'Active' : 'Inactive'}
                </Tag>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            render: (_: any, record: any) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined className="text-blue-600" />}
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title="Xóa quy tắc này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                        />
                    </Popconfirm>
                </Space>
            )
        }
    ]

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Quản lý Cấu hình</h1>
                    <p className="text-slate-500">Thêm, sửa, xóa các quy tắc kiểm tra chuyên đề.</p>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Thêm quy tắc
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={rules}
                rowKey="id"
                loading={loading}
                pagination={false}
            />

            <Modal
                title={editingRule ? "Sửa Quy Tắc" : "Thêm Quy Tắc Mới"}
                open={isModalOpen}
                onOk={handleSave}
                onCancel={() => setIsModalOpen(false)}
                width={700}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ isActive: true, order: 0 }}
                >
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="name"
                            label="Tên quy tắc"
                            rules={[{ required: true, message: 'Nhập tên quy tắc' }]}
                        >
                            <Input placeholder="Ví dụ: Kiểm tra Mã Máy" />
                        </Form.Item>
                        <Form.Item
                            name="slug"
                            label="Slug (URL)"
                            rules={[{ required: true, message: 'Nhập slug duy nhất' }]}
                            tooltip="Đường dẫn trên URL, không dấu, viết liền. Ví dụ: kiem-tra-ma-may"
                        >
                            <Input placeholder="kiem-tra-ma-may" />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="ruleType"
                            label="Loại quy tắc"
                            rules={[{ required: true }]}
                        >
                            <AutoComplete
                                options={[
                                    { value: 'MACHINE_CHECK', label: 'MACHINE_CHECK (Kiểm tra máy)' },
                                    { value: 'DUPLICATE_BED', label: 'DUPLICATE_BED (Trùng giường)' },
                                    { value: 'GROUP_15', label: 'GROUP_15 (Nhóm 15)' },
                                    { value: 'SQL', label: 'SQL (Truy vấn tùy chỉnh)' }
                                ]}
                                placeholder="Nhập hoặc chọn loại quy tắc"
                                filterOption={(inputValue, option) =>
                                    String(option!.value).toUpperCase().indexOf(inputValue.toUpperCase()) !== -1 ||
                                    String(option!.label).toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                                }
                            />
                        </Form.Item>
                        <Form.Item
                            name="order"
                            label="Thứ tự hiển thị"
                        >
                            <InputNumber className="w-full" />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                    >
                        <Input.TextArea rows={2} />
                    </Form.Item>

                    <Form.Item
                        name="isActive"
                        valuePropName="checked"
                        label="Kích hoạt"
                    >
                        <Switch />
                    </Form.Item>

                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-semibold text-slate-700">
                            Cấu hình Logic
                            <span className="ml-2 text-xs font-normal text-slate-400">(Chọn kiểu form để nhập liệu dễ hơn)</span>
                        </label>
                        <Select
                            value={editorMode}
                            onChange={(v) => handleModeChange(v as any)}
                            style={{ width: 220 }}
                            size="small"
                        >
                            <Select.Option value="JSON">📝 JSON (Nâng cao)</Select.Option>
                            <Select.Option value="DUPLICATE_BED">📋 Form (Giao diện)</Select.Option>
                        </Select>
                    </div>

                    <Form.Item
                        name="logicConfig"
                        noStyle
                        rules={[{ required: true, message: 'Nhập cấu hình' }]}
                    >
                        {editorMode === 'DUPLICATE_BED' ? (
                            <DuplicateBedConfigInput />
                        ) : editorMode === 'MACHINE_CHECK' ? (
                            <div className="p-4 bg-yellow-50 text-yellow-700 rounded border border-yellow-200">
                                Form Kiểm tra máy đang phát triển. Vui lòng dùng JSON.
                                <TextArea
                                    rows={8}
                                    className="font-mono text-sm mt-2"
                                    spellCheck={false}
                                />
                            </div>
                        ) : (
                            <TextArea
                                rows={8}
                                className="font-mono text-sm bg-slate-50"
                                spellCheck={false}
                                placeholder="Nhập cấu hình JSON..."
                            />
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}
