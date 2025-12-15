import React, { useEffect, useMemo, useState } from 'react';
import { Table, Space, Select, Input, Button, Tag, message, Modal } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { ProjectList } from '@/Components/ProjectList';
import BugForm from './BugForm';
import type { Project, Bug as BugItem } from '@/types/bug';
import {
  fetchBugsByProject,
  createBug,
  updateBug,
  deleteBug,
  approveBug,
  searchUserForBug,
} from '@/request/api/bug/index';
import {
  createProject,
  fetchProjects,
  updateProject,
  deleteProject,
  searchUser,
} from '@/request/api/task';
import { getUserProfile } from '@/request/api/user/profile';

interface AssigneeMap {
  [id: string]: { name: string; role: string };
}

export const Bug: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [bugs, setBugs] = useState<BugItem[]>([]);
  const [filteredBugs, setFilteredBugs] = useState<BugItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [bugDetailsFilter, setBugDetailsFilter] = useState<string | undefined>(undefined);
  const [severityFilter, setSeverityFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [isBugModalVisible, setIsBugModalVisible] = useState(false);
  const [editingBug, setEditingBug] = useState<BugItem | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; role: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const selectedProject = useMemo(
    () => projects.find((p) => p._id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  // 组装给 ProjectList 使用的数据
  const projectRecord = useMemo(() => {
    const record: Record<string, any> = {};
    projects.forEach((p) => {
      record[p._id] = {
        projectName: p.name,
        projectDesc: p.description || '',
        status: p.status,
        priority: p.priority,
        deadline: p.deadline ? dayjs(p.deadline).format('YYYY-MM-DD') : '',
        tasks: [],
        members: p.members || [],
        leaderName: p.leader?.username || '',
        leaderRole: p.leader?.role || '',
      };
    });
    return record;
  }, [projects]);

  const leaderId = useMemo(() => selectedProject?._id && (selectedProject.leader as any)?._id || selectedProject?.leader || '', [selectedProject]);

  // 计算可选成员（组长 + 成员）
  const assigneeMap: AssigneeMap = useMemo(() => {
    if (!selectedProject) return {};
    const members = [...selectedProject.members, selectedProject.leader];
    const map: AssigneeMap = {};
    members.forEach((m) => {
      const isLeader = m._id?.toString?.() === leaderId?.toString?.();
      map[m._id] = { name: m.username, role: isLeader ? '组长' : '成员' };
    });
    return map;
  }, [selectedProject, leaderId]);

  const isProjectLeader = useMemo(() => {
    if (!selectedProject || !currentUser) return false;
    // 兼容 leader 可能是对象或字符串
    const leaderId =
      typeof (selectedProject.leader as any)?._id === 'string'
        ? (selectedProject.leader as any)._id
        : (selectedProject.leader as any)?.toString?.() || selectedProject.leader;
    return leaderId === currentUser.id;
  }, [selectedProject, currentUser]);

  const fetchUser = async () => {
    try {
      const profile = await getUserProfile();
      setCurrentUser({
        id: profile._id,
        name: profile.username,
        role: profile.role === 'admin' ? '组长' : '成员',
      });
    } catch (error) {
      console.error(error);
      message.error('获取用户信息失败');
    }
  };

  const loadProjects = async (keyword?: string) => {
    try {
      const res = await fetchProjects(keyword ? { keyword } : undefined);
      setProjects(res);
      if (!selectedProjectId && res.length > 0) {
        setSelectedProjectId(res[0]._id);
      }
    } catch (error) {
      message.error('获取项目列表失败');
    }
  };

  const loadBugs = async (projectId: string) => {
    try {
      setLoading(true);
      const res = await fetchBugsByProject(projectId);
      setBugs(res);
      setFilteredBugs(res);
    } catch (error) {
      message.error('获取Bug失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchMemberForProject = async (keyword: string) => {
    const res: any = await searchUser(keyword);
    return res as Array<{ _id: string; username: string; role: string }>;
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      if (selectedProjectId === projectId) {
        setSelectedProjectId(null);
      }
      loadProjects();
    } catch (error) {
      console.error('删除项目失败:', error);
    }
  };

  const handleSearchMemberForBug = async (keyword: string) => {
    if (!selectedProjectId) return [];
    const res: any = await searchUserForBug(selectedProjectId, keyword);
    return res as Array<{ _id: string; username: string; role: string }>;
  };

  const currentUserRoleLabel = useMemo(() => {
    if (!currentUser || !selectedProject) return '成员';
    return currentUser.id?.toString?.() === leaderId?.toString?.() ? '组长' : '成员';
  }, [currentUser, selectedProject, leaderId]);

  // 初始化
  useEffect(() => {
    fetchUser();
    loadProjects();
  }, []);

  // 项目切换加载Bug
  useEffect(() => {
    if (selectedProjectId) {
      loadBugs(selectedProjectId);
      setSearchText('');
      setBugDetailsFilter(undefined);
      setSeverityFilter(undefined);
      setStatusFilter(undefined);
    }
  }, [selectedProjectId]);

  // 过滤Bug
  useEffect(() => {
    let data = [...bugs];
    if (searchText) {
      data = data.filter((t) => t.bugName.toLowerCase().includes(searchText.toLowerCase()));
    }
    if (bugDetailsFilter) {
      data = data.filter(
        (t) => t.bugDetails && t.bugDetails.toLowerCase().includes(bugDetailsFilter.toLowerCase())
      );
    }
    if (severityFilter) {
      data = data.filter((t) => t.severity === severityFilter);
    }
    if (statusFilter) {
      data = data.filter((t) => t.status === statusFilter);
    }
    setFilteredBugs(data);
  }, [bugs, searchText, bugDetailsFilter, severityFilter, statusFilter]);

  const handleAddBug = () => {
    if (!selectedProjectId) {
      message.warning('请先选择一个项目');
      return;
    }
    setEditingBug(null);
    setIsBugModalVisible(true);
  };

  const handleEditBug = (bug: BugItem) => {
    setEditingBug(bug);
    setIsBugModalVisible(true);
  };

  const handleDeleteBug = (bug: BugItem) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除Bug"${bug.bugName}"吗？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteBug(bug._id);
          if (selectedProjectId) {
            loadBugs(selectedProjectId);
          }
        } catch (error) {
          console.error('删除Bug失败:', error);
        }
      },
    });
  };

  const handleSubmitForReview = async (bug: BugItem) => {
    if (!currentUser) return;
    if (bug.status !== '已解决') {
      message.warning('仅已解决的Bug可提交审核');
      return;
    }
    try {
      // 后端更新接口要求传 bugName，提交审核仅变更状态
      await updateBug(bug._id, { status: '待审核', bugName: bug.bugName });
      if (selectedProjectId) {
        loadBugs(selectedProjectId);
      }
    } catch (error) {
      console.error('提交审核失败:', error);
    }
  };

  const handleBugSubmit = async (values: any) => {
    if (!selectedProjectId || !currentUser) return;
    const payload = {
      bugName: values.bugName,
      bugDetails: values.bugDetails,
      assignee: values.assignee,
      startDate: values.startDate ? values.startDate.toISOString() : undefined,
      deadline: values.deadline ? values.deadline.toISOString() : undefined,
      severity: values.severity,
      status: values.status,
    };

    try {
      if (editingBug) {
        await updateBug(editingBug._id, payload);
      } else {
        await createBug(selectedProjectId, payload);
      }
      setIsBugModalVisible(false);
      loadBugs(selectedProjectId);
    } catch (error) {
      console.error('提交Bug失败:', error);
    }
  };

  const handleQuickApprove = async (bug: BugItem, approvalStatus: '通过' | '不通过') => {
    if (bug.status !== '待审核') {
      message.warning('只有待审核状态的Bug才能审核');
      return;
    }
    try {
      await approveBug(bug._id, { approvalStatus, reviewComment: '' });
      if (selectedProjectId) {
        loadBugs(selectedProjectId);
      }
    } catch (error) {
      console.error('审核Bug失败:', error);
    }
  };

  const handleRefreshBugs = () => {
    if (selectedProjectId) {
      loadBugs(selectedProjectId);
    }
  };

  const handleCreateProject = async (values: any) => {
    await createProject({
      name: values.projectName,
      description: values.projectDesc,
      status: values.status,
      priority: values.priority,
      deadline: values.deadline,
      memberIds: values.members,
    });
    message.success('项目创建成功');
    loadProjects();
  };

  const handleEditProject = async (_projectId: string, values: any) => {
    await updateProject(_projectId, {
      name: values.projectName,
      description: values.projectDesc,
      status: values.status,
      priority: values.priority,
      deadline: values.deadline,
      memberIds: values.members,
    });
    message.success('项目更新成功');
    loadProjects();
  };

  const bugColumns: ColumnsType<any> = [
    {
      title: 'Bug名称',
      dataIndex: 'bugName',
      key: 'bugName',
      ellipsis: true,
      width: 150,
    },
    {
      title: '执行人',
      dataIndex: ['assignee', 'username'],
      key: 'assignee',
      width: 120,
      render: (_: any, record: BugItem) => record.assignee?.username || '-',
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
      render: (date: string) => (date ? dayjs(date).format('YYYY-MM-DD') : '-'),
      sorter: (a, b) =>
        new Date(a.startDate || '').getTime() - new Date(b.startDate || '').getTime(),
    },
    {
      title: '截止日期',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 120,
      render: (date: string) => (date ? dayjs(date).format('YYYY-MM-DD') : '-'),
      sorter: (a, b) => new Date(a.deadline || '').getTime() - new Date(b.deadline || '').getTime(),
    },

    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      width: 120,
      render: (severity: string) => {
        let color = 'default';
        if (severity === '严重') color = 'red';
        else if (severity === '高') color = 'orange';
        else if (severity === '中') color = 'blue';
        return <Tag color={color}>{severity || '低'}</Tag>;
      },
      sorter: (a: any, b: any) => {
        const order = { 严重: 5, 高: 4, 中: 3, 低: 2 };
        return (
          (order[a.severity as keyof typeof order] || 1) -
          (order[b.severity as keyof typeof order] || 1)
        );
      },
    },
    {
      title: 'Bug状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        let color = 'default';
        if (status === '已解决') color = 'green';
        else if (status === '处理中') color = 'blue';
        else if (status === '已关闭') color = 'purple';
        else if (status === '已取消') color = 'red';
        else if (status === '待审核') color = 'orange';
        return <Tag color={color}>{status || '待处理'}</Tag>;
      },
      sorter: (a: any, b: any) => {
        const order = { 已解决: 6, 已关闭: 5, 处理中: 4, 待审核: 3, 待处理: 2, 已取消: 1 };
        return (
          (order[a.status as keyof typeof order] || 1) -
          (order[b.status as keyof typeof order] || 1)
        );
      },
    },
    {
      title: '审核状态',
      dataIndex: 'approvalStatus',
      key: 'approvalStatus',
      width: 120,
      render: (approvalStatus: string) => {
        let color = 'default';
        if (approvalStatus === '通过') color = 'green';
        else if (approvalStatus === '不通过') color = 'red';
        return <Tag color={color}>{approvalStatus || '待审核'}</Tag>;
      },
      sorter: (a: any, b: any) => {
        const order = { 通过: 3, 不通过: 2, 待审核: 1 };
        return (
          (order[a.approvalStatus as keyof typeof order] || 1) -
          (order[b.approvalStatus as keyof typeof order] || 1)
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 180,

      render: (_: any, record: BugItem) => (
        <Space size="middle">
          <Button type="link" size="small" onClick={() => handleEditBug(record)}>
            编辑
          </Button>
          {record.assignee?._id === currentUser?.id && (
            <Button
              type="link"
              size="small"
              disabled={record.status !== '已解决'}
              onClick={() => handleSubmitForReview(record)}
            >
              提交审核
            </Button>
          )}
          {isProjectLeader && (
            <>
              <Button
                type="link"
                size="small"
                disabled={record.status !== '待审核'}
                onClick={() => handleQuickApprove(record, '通过')}
              >
                通过
              </Button>
              <Button
                type="link"
                size="small"
                danger
                disabled={record.status !== '待审核'}
                onClick={() => handleQuickApprove(record, '不通过')}
              >
                打回
              </Button>
            </>
          )}
          <Button type="link" size="small" danger onClick={() => handleDeleteBug(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="h-full w-full flex flex-col" style={{ padding: '12px' }}>
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧项目列表 */}
        <div className="flex-shrink-0" style={{ display: 'flex', flexDirection: 'column' }}>
          <ProjectList
            projectData={projectRecord}
            selectedProjectKey={selectedProjectId}
            onItemClick={(item) => setSelectedProjectId(item.key as string)}
            onAdd={() => {}}
            onSearch={(value) => {
              loadProjects(value);
            }}
            onCreateProject={handleCreateProject}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
            onSearchMember={handleSearchMemberForProject}
          />
        </div>

        {/* 右侧内容区域 */}
        <div className="flex-1 flex flex-col overflow-hidden ml-4">
          <div className="p-2 border rounded-lg bg-white flex-1 overflow-hidden">
            {selectedProject ? (
              <div className="h-full flex flex-col">
                {/* 项目信息部分 */}

                {/* Bug列表部分 */}
                <div className="flex-1 flex flex-col overflow-hidden mt-6">
                  {/* 搜索和操作栏 */}
                  <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h3 className="text-sm font-semibold">Bug列表</h3>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="搜索Bug名称"
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 140 }}
                      />
                      <Input
                        placeholder="Bug详情"
                        prefix={<SearchOutlined />}
                        value={bugDetailsFilter}
                        onChange={(e) => setBugDetailsFilter(e.target.value)}
                        style={{ width: 120 }}
                      />
                      <Select
                        placeholder="严重程度"
                        style={{ width: 100 }}
                        allowClear
                        value={severityFilter}
                        onChange={(value) => setSeverityFilter(value)}
                      >
                        <Select.Option value="严重">严重</Select.Option>
                        <Select.Option value="高">高</Select.Option>
                        <Select.Option value="中">中</Select.Option>
                        <Select.Option value="低">低</Select.Option>
                      </Select>
                      <Select
                        placeholder="Bug状态"
                        style={{ width: 100 }}
                        allowClear
                        value={statusFilter}
                        onChange={(value) => setStatusFilter(value)}
                      >
                        <Select.Option value="待处理">待处理</Select.Option>
                        <Select.Option value="处理中">处理中</Select.Option>
                        <Select.Option value="待审核">待审核</Select.Option>
                        <Select.Option value="已解决">已解决</Select.Option>
                        <Select.Option value="已关闭">已关闭</Select.Option>
                        <Select.Option value="已取消">已取消</Select.Option>
                      </Select>
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={handleRefreshBugs}
                        title="刷新Bug列表"
                        size="small"
                      >
                        刷新
                      </Button>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddBug}
                        size="small"
                      >
                        添加Bug
                      </Button>
                    </div>
                  </div>

                  {/* 表格部分 */}
                  <div className="flex-1 overflow-auto">
                    <Table
                      loading={loading}
                      columns={bugColumns}
                      dataSource={filteredBugs}
                      rowKey={(record) => record._id}
                      scroll={{ x: 'max-content' }}
                      sticky
                      locale={{
                        emptyText: '暂无Bug数据，请点击"添加Bug"按钮创建新Bug',
                      }}
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `共 ${total} 条Bug记录`,
                      }}
                      size="middle"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <span>请选择左侧项目查看Bug</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <BugForm
        visible={isBugModalVisible}
        onCancel={() => setIsBugModalVisible(false)}
        onOk={handleBugSubmit}
        projectKey={selectedProjectId || undefined}
        currentUserRole={currentUserRoleLabel}
        currentUser={
          currentUser || {
            id: '',
            name: '',
            role: '成员',
          }
        }
        userData={assigneeMap}
        initialValues={
          editingBug
            ? {
                bugName: editingBug.bugName,
                assignee: editingBug.assignee?._id,
                startDate: editingBug.startDate ? dayjs(editingBug.startDate) : dayjs(),
                deadline: editingBug.deadline ? dayjs(editingBug.deadline) : dayjs().add(7, 'day'),
                severity: editingBug.severity,
                status: editingBug.status,
                bugDetails: editingBug.bugDetails || '',
              }
            : undefined
        }
        isEdit={!!editingBug}
        onSearchUser={handleSearchMemberForBug}
      />
    </div>
  );
};

export default Bug;
