import { List as AntdList, Button, Pagination, Dropdown, Menu, type ListProps as AntdListProps } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, MoreOutlined } from '@ant-design/icons';
import Search from 'antd/es/input/Search';
import React, { useState, useEffect } from 'react';

/** 列表项类型定义（兼容 AntD List 数据格式） */
export interface ListItem {
  key: string; // 唯一标识
  label: React.ReactNode; // 显示文本/内容
  [key: string]: any; // 支持自定义额外属性
}

/** 组件属性类型定义 */
export interface CustomListProps {
  title: string;
  /** 全部列表数据（不分页的完整数据） */
  listItems: ListItem[];
  /** 每页条数（默认10，控制页面展示数量） */
  pageSize?: number;
  /** 搜索回调函数 */
  onSearch?: (value: string) => void;
  /** 新增按钮回调函数 */
  onAdd?: () => void;
  onUpdate?: (item: ListItem) => void;
  /** 删除回调函数 */
  onDelete?: (item: ListItem) => void;
  /** 列表项点击回调函数 */
  onItemClick?: (item: ListItem) => void;
  /** 页码变更回调函数（可选，暴露给父组件） */
  onPageChange?: (page: number, pageSize: number) => void;
  /** 默认选中的key（单个选中） */
  defaultSelectedKey?: string;
  /** 列表额外样式类 */
  listClassName?: string;
  /** 搜索框宽度（默认200px） */

  /** 组件宽度（默认250px） */
  width?: number;
  /** 组件高度（默认100%，便于父元素 h-full 填充） */
  height?: number | string;
  /** 默认当前页（默认1） */
  defaultCurrentPage?: number;
  urlSuffix?: string; // 新增
}

/**
 * AntD List 封装组件（带分页功能）
 * 特点：固定每页展示数量，分页联动更新数据
 */
const CustomList: React.FC<CustomListProps> = ({
  title,
  listItems = [],
  pageSize = 10,
  onSearch,
  onAdd,
  onUpdate,
  onDelete,
  onItemClick,
  onPageChange,
  defaultSelectedKey = '',
  listClassName = '',

  width = 250,
  height = '100%',
  defaultCurrentPage = 1,
}) => {
  // 校验必填属性
  useEffect(() => {
    if (!title) {
      console.error('❌ CustomList组件错误：title 属性为必填项');
    }
  }, [title]);

  // 状态管理：当前页码、当前页展示数据
  const [currentPage, setCurrentPage] = useState<number>(defaultCurrentPage);
  const [currentData, setCurrentData] = useState<ListItem[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>(defaultSelectedKey);

  // 计算总页数（向上取整）
  const total = listItems.length;

  // 分页处理：根据当前页和每页条数，筛选当前页要展示的数据
  useEffect(() => {
    if (listItems.length === 0) {
      setCurrentData([]);
      return;
    }

    // 计算起始索引和结束索引
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    // 筛选当前页数据
    const pageData = listItems.slice(startIndex, endIndex);
    setCurrentData(pageData);

    // 暴露页码变更给父组件
    onPageChange?.(currentPage, pageSize);
  }, [currentPage, pageSize, listItems, onPageChange]);

  // 处理搜索事件
  const handleSearch = (value: string) => {
    onSearch?.(value.trim());
    // 搜索后重置到第一页
    setCurrentPage(1);
  };

  // 处理分页切换
  const handlePaginationChange = (page: number, newPageSize: number) => {
    setCurrentPage(page);
    // 如果改变了每页条数，同步更新pageSize并重置到第一页
    if (newPageSize !== pageSize) {
      // 这里可以根据需求决定是否允许父组件控制pageSize，还是内部自管理
      // 如需父组件控制，可暴露onPageSizeChange回调
      setCurrentPage(1);
    }
  };

  // 处理列表项点击
  const handleItemClick = (item: ListItem) => {
    setSelectedKey(item.key);
    onItemClick?.(item);
    // navigate(`${item.key}${urlSuffix}`); // 新增：更新URL
  };

  // 列表项渲染函数
  const renderListItem: AntdListProps<ListItem>['renderItem'] = (item) => (
    <AntdList.Item
      key={item.key}
      className={`
        cursor-pointer transition-all duration-200
        ${
          selectedKey === item.key
            ? 'bg-blue-100 border-blue-200 text-blue-800 font-medium'
            : 'hover:bg-gray-50 border-gray-100'
        }
      `}
      onClick={() => handleItemClick(item)}
      style={{
        borderRadius: '6px',
        padding: '5px 7px',
        marginBottom: '3px',
        minHeight: 44,
      }}
    >
      <AntdList.Item.Meta title={item.label} />
      <div className="flex justify-end">
        <Dropdown 
          trigger={['click']} 
          overlay={(
            <Menu>
              <Menu.Item key="edit" icon={<EditOutlined />}>
                <div onClick={(e) => {
                  e.stopPropagation();
                  onUpdate?.(item);
                }}>编辑</div>
              </Menu.Item>
              <Menu.Item key="delete" icon={<DeleteOutlined />}>
                <div onClick={(e) => {
                  e.stopPropagation();
                  // 直接调用删除回调函数，让父组件处理确认
                  onDelete?.(item);
                }}>删除</div>
              </Menu.Item>
            </Menu>
          )}
          placement="bottomRight"
        >
          <Button 
            type="text" 
            className="action-btn" 
            onClick={(e) => e.stopPropagation()}
            title="更多操作"
          >
            <MoreOutlined className="text-base hover:text-blue-600 transition-colors" />
          </Button>
        </Dropdown>
      </div>
    </AntdList.Item>
  );

  return (
    <div
      className="rounded-lg border border-gray-200 overflow-hidden flex flex-col"
      style={{
        width: `${width}px`,
        height: typeof height === 'number' ? `${height}px` : height,
        paddingTop: 5,
        paddingBottom: 5,
      }}
    >
      {/* 1. 标题区域 */}
      <div className="px-3 py-1.25 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-center">{title}</h3>
      </div>

      {/* 2. 操作区域 - 搜索框 + 新增按钮（右对齐） */}
      <div className="px-3 py-1.25 border-gray-200 flex justify-end items-center gap-1.25 mt-2.5 mb-2.5">
        <Search
          placeholder="搜索"
          allowClear
          onSearch={handleSearch}
          className="rounded-md"
          aria-label="搜索"
          style={{ width: 304 }}
        />
        <PlusOutlined
          className="text-blue-600 cursor-pointer text-base hover:text-blue-700 transition-colors"
          onClick={onAdd}
          title="新增"
          aria-label="新增"
        />
      </div>

      {/* 3. 列表区域（只展示当前页数据） */}
      <article className="flex-1 overflow-y-auto ">
        <AntdList
          dataSource={currentData} // 渲染当前页数据，而非全部数据
          renderItem={renderListItem}
          className={`${listClassName}`}
          bordered={false}
          locale={{ emptyText: '暂无数据' }}
        />
      </article>

      {/* 4. 分页区域（联动当前页） */}
      <footer className="p-3  border-gray-200 flex justify-end">
        <Pagination
          simple
          current={currentPage} // 绑定当前页状态
          pageSize={pageSize} // 绑定每页条数
          total={total} // 总数据量（从完整数据长度获取）
          onChange={handlePaginationChange} // 分页切换事件
          showSizeChanger={false} // 隐藏每页条数切换（如需显示可改为true）
          aria-label="分页控件"
          size="small"
        />
      </footer>
    </div>
  );
};

export default CustomList;
