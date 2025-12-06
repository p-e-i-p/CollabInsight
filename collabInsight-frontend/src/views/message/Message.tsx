import React from 'react';
import BaseTable, { type FilterFormValues } from '@/Components/BaseTable';
import { DatePicker, Input, Select, Space } from 'antd';

// 定义接口类型
interface User {
  id: string;
  name: string;
  age: number;
  email: string;
  status: 'active' | 'inactive';
}

const Message: React.FC = () => {
  // 定义表格数据类型
  interface User {
    id: string;
    name: string;
    age: number;
    email: string;
    status: 'active' | 'inactive';
    createTime: string;
  }

  // 定义过滤表单值类型（与过滤项对应）
  interface UserFilterFormValues extends FilterFormValues {
    name?: string; // 姓名过滤
    status?: 'active' | 'inactive' | ''; // 状态过滤
    createTime?: [string, string]; // 时间范围过滤
  }

  // 定义表格数据类型
    // 模拟数据获取函数（整合分页+过滤参数）
    const fetchUserList = async (params: {
      page: number;
      pageSize: number;
      name?: string;
      status?: string;
      createTime?: [string, string];
    }) => {
      console.log('请求参数:', params);
      // 模拟接口延迟
      await new Promise((resolve) => setTimeout(resolve, 800));
      // 模拟根据过滤参数筛选数据（实际项目中由后端处理）
      const total = 100;
      const list = Array.from({ length: params.pageSize })
        .map((_, i) => ({
          id: `${params.page}-${i}`,
          name: `用户${params.page}-${i}`,
          age: 20 + i,
          email: `user${params.page}-${i}@example.com`,
          status: i % 2 === 0 ? 'active' : 'inactive',
          createTime: `2025-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        }))
        // 前端模拟过滤（实际项目中无需前端过滤）
        .filter((item) => {
          if (params.name && !item.name.includes(params.name)) return false;
          if (params.status && item.status !== params.status) return false;
          if (params.createTime) {
            const [start, end] = params.createTime;
            if (item.createTime < start || item.createTime > end) return false;
          }
          return true;
        });

      return { list, total: list.length > 0 ? total : 0 };
    };

    // 过滤表单配置（自定义过滤项）
    const filterFormItems = [
      {
        name: 'name',
        label: '姓名',
        component: <Input placeholder="请输入姓名搜索" />,
        wrapperCol: { span: 16 },
      },
      {
        name: 'status',
        label: '状态',
        component: (
          <Select placeholder="请选择状态" style={{ width: '100%' }}>
            <Select.Option value="active">活跃</Select.Option>
            <Select.Option value="inactive">禁用</Select.Option>
          </Select>
        ),
        wrapperCol: { span: 16 },
      },
      {
        name: 'createTime',
        label: '创建时间',
        component: <DatePicker.RangePicker placeholder={['开始时间', '结束时间']} />,
        wrapperCol: { span: 20 },
      },
    ];

    // 表格列配置
    const columns = [
      { title: 'ID', dataIndex: 'id', key: 'id', width: 100 },
      { title: '姓名', dataIndex: 'name', key: 'name' },
      { title: '年龄', dataIndex: 'age', key: 'age', width: 80 },
      { title: '邮箱', dataIndex: 'email', key: 'email' },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status: string) => (
          <span style={{ color: status === 'active' ? '#52c41a' : '#ff4d4f' }}>
            {status === 'active' ? '活跃' : '禁用'}
          </span>
        ),
      },
      { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 150 },
      {
        title: '操作',
        key: 'action',
        width: 120,
        render: (_: unknown, record: User) => (
          <Space size="middle">
            <button style={{ color: '#1890ff' }} onClick={() => console.log('编辑', record)}>
              编辑
            </button>
            <button style={{ color: '#ff4d4f' }} onClick={() => console.log('删除', record)}>
              删除
            </button>
          </Space>
        ),
      },
    ];
    return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">消息中心</h1>
      <BaseTable<User, UserFilterFormValues>
        fetcher={fetchUserList}
        columns={columns}
        rowKey="id"
        loadingText="加载消息列表..."
        emptyText="暂无消息数据"
        className="shadow-md rounded-lg"
        // 过滤相关配置
        filterFormItems={filterFormItems}
        filterFormLayout="horizontal"
        showFilterButton={true}
        defaultFilterVisible={false}
        initialParams={{ status: '' }} // 初始过滤参数
      />
    </div>
  );
};

export default Message;
