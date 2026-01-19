// src/components/BaseTable/index.tsx
import {
  Table,
  Pagination,
  Space,
  Spin,
  Empty,
  Form,
  Button,
  type TableProps as AntTableProps,
} from 'antd';
import { SearchOutlined, RestOutlined, FilterOutlined } from '@ant-design/icons';
import React, { useEffect, useState, useRef } from 'react';
import type { FormProps } from 'antd/es/form';

// 分页参数
export interface BaseTablePagination {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  pageSizeOptions?: string[];
}

// 过滤表单字段类型（泛型约束）
export type FilterFormValues = Record<string, any>;

// 过滤表单配置项（扩展 AntD Form Item 配置）
export interface FilterFormItem {
  name: string; // 字段名（对应 FormValues 的 key）
  label?: React.ReactNode; // 标签
  component: React.ReactNode; // 表单组件（如 Input、Select 等）
  rules?: FormProps[]; // 校验规则
  wrapperCol?: { span: number }; // 布局占比
  labelCol?: { span: number }; // 标签占比
}

// 表格组件属性（新增过滤相关配置）
export interface BaseTableProps<T, F extends FilterFormValues = FilterFormValues> {
  fetcher: (params: {
    page: number;
    pageSize: number;
    [key: string]: any;
  }) => Promise<{ list: T[]; total: number }>;
  columns: AntTableProps<T>[];
  pagination?: BaseTablePagination;
  initialParams?: Record<string, any>; // 初始请求参数（含过滤条件）
  rowKey?: string | null;
  loadingText?: string;
  emptyText?: string;
  className?: string;
  style?: React.CSSProperties;

  // 过滤相关配置（新增）
  filterFormItems?: FilterFormItem[]; // 过滤表单配置
  filterFormLayout?: 'horizontal' | 'vertical'; // 过滤表单布局
  filterFormProps?: FormProps<F>; // 额外的 Form 属性
  showFilterButton?: boolean; // 是否显示「筛选」按钮（控制表单展开/收起）
  defaultFilterVisible?: boolean; // 过滤表单默认是否显示
}

// 通用表格组件（支持过滤+分页+数据请求）
const BaseTable = <
  T extends readonly [] | undefined,
  F extends FilterFormValues = FilterFormValues,
>({
  fetcher,
  columns,
  pagination = {
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
  },
  initialParams = {},
  rowKey = 'id',
  loadingText = '加载中...',
  emptyText = '暂无数据',
  className,
  style,

  // 过滤相关默认值
  filterFormItems = [],
  filterFormLayout = 'horizontal',
  filterFormProps = {},
  showFilterButton = true,
  defaultFilterVisible = false,
}: BaseTableProps<T, F>) => {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(pagination.current);
  const [pageSize, setPageSize] = useState(pagination.pageSize);
  const [filterVisible, setFilterVisible] = useState(defaultFilterVisible);
  const [form] = Form.useForm<F>();
  const paramsRef = useRef<Record<string, any>>({ ...initialParams });

  // 初始化过滤表单默认值
  useEffect(() => {
    form.setFieldsValue({ ...initialParams } as F);
  }, [form, initialParams]);

  // 数据获取逻辑（整合分页参数+过滤参数）
  const fetchData = async (params?: Record<string, any>) => {
    // 合并参数：初始参数 > 过滤参数 > 分页参数
    const finalParams = {
      ...paramsRef.current,
      ...form.getFieldsValue(),
      ...params,
      page: currentPage,
      pageSize,
    };
    setLoading(true);
    try {
      const res = await fetcher(finalParams);
      setData(res.list);
      setTotal(res.total);
    } catch (error) {
      console.error('表格数据获取失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化/分页变更/过滤参数变更时触发数据刷新
  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, fetcher]);

  // 分页变更回调
  const handlePageChange = (newPage: number, newPageSize: number) => {
    setCurrentPage(newPage);
    setPageSize(newPageSize);
  };

  // 过滤表单提交（筛选）
  const handleFilterSubmit = () => {
    setCurrentPage(1); // 筛选后重置到第一页
    fetchData();
  };

  // 重置过滤条件
  const handleFilterReset = () => {
    form.resetFields();
    setCurrentPage(1);
    fetchData({ ...initialParams }); // 重置为初始参数
  };

  // 切换过滤表单显示/隐藏
  const toggleFilterVisible = () => {
    setFilterVisible(!filterVisible);
  };

  // 渲染过滤表单
  const renderFilterForm = () => {
    if (filterFormItems.length === 0) return null;

    const layout =
      filterFormLayout === 'horizontal'
        ? { labelCol: { span: 6 }, wrapperCol: { span: 18 } }
        : { labelCol: { span: 4 }, wrapperCol: { span: 20 } };

    return (
      <div className={`filter-form ${filterVisible ? 'visible' : 'hidden'} mb-4`}>
        <Form
          form={form}
          layout={filterFormLayout}
          {...layout}
          {...filterFormProps}
          initialValues={initialParams as F}
        >
          <Space.Compact style={{ width: '100%' }}>
            {filterFormItems.map((item) => (
              <Form.Item
                key={item.name}
                name={item.name}
                label={item.label}
                labelCol={item.labelCol || layout.labelCol}
                wrapperCol={item.wrapperCol || layout.wrapperCol}
              >
                {item.component}
              </Form.Item>
            ))}
          </Space.Compact>
          <div className="flex justify-end gap-2 mt-2">
            <Button onClick={handleFilterReset} icon={<RestOutlined />}>
              重置
            </Button>
            <Button type="primary" onClick={handleFilterSubmit} icon={<SearchOutlined />}>
              筛选
            </Button>
          </div>
        </Form>
      </div>
    );
  };

  return (
    <div className={`base-table ${className || ''}`} style={style}>
      {/* 过滤区域：筛选按钮 + 过滤表单 */}
      <div className="filter-area mb-4">
        {showFilterButton && (
          <Button
            type="default"
            icon={<FilterOutlined />}
            onClick={toggleFilterVisible}
            className="mb-2"
          >
            {filterVisible ? '收起筛选' : '展开筛选'}
          </Button>
        )}
        {renderFilterForm()}
      </div>

      {/* 表格区域 */}
      <Spin spinning={loading} tip={loadingText}>
        <Table dataSource={data} columns={columns} pagination={false} bordered className="w-full" />
        {data.length === 0 && !loading ? <Empty description={emptyText} className="mt-8" /> : null}
      </Spin>

      {/* 分页区域 */}
      <div className="flex justify-end mt-4">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          onChange={handlePageChange}
          showSizeChanger={pagination.showSizeChanger}
          pageSizeOptions={pagination.pageSizeOptions}
          onShowSizeChange={(current, size) => handlePageChange(current, size)}
        />
      </div>
    </div>
  );
};

export default BaseTable;
