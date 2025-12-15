import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Col,
  Row,
  Statistic,
  message,
  List,
  Progress,
  Space,
  Tag,
  Typography,
  Skeleton,
  Button,
} from 'antd';
import {
  ProjectOutlined,
  ProfileOutlined,
  BugOutlined,
  TeamOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import ReactECharts from 'echarts-for-react';
import { fetchDashboardOverview } from '@/request/api/dashboard';
import type { DashboardOverview, NamedCount, ProjectProgress } from '@/types/dashboard';

const { Title, Text } = Typography;

const chartThemeColor = '#6C70E6';

const Dashboard: React.FC = () => {
  const [overview, setOverview] = useState<DashboardOverview>();
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchDashboardOverview();
      setOverview(res);
    } catch (error) {
      console.error(error);
      message.error('获取数据概览失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const ringOption = (title: string, data: NamedCount[]) => ({
    title: { text: title, left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['40%', '65%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        data: data?.map((d) => ({ name: d.name, value: d.count })) || [],
        color: ['#6C70E6', '#55D187', '#F7BA1E', '#F76560', '#2BB0ED', '#9C27B0'],
      },
    ],
  });

  const taskStatusBar = useMemo(
    () => ({
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 20, bottom: 30, top: 20 },
      xAxis: {
        type: 'category',
        data: overview?.taskStatus?.map((i) => i.name) || [],
        axisTick: { alignWithLabel: true },
      },
      yAxis: { type: 'value' },
      series: [
        {
          data: overview?.taskStatus?.map((i) => i.count) || [],
          type: 'bar',
          itemStyle: {
            color: chartThemeColor,
            borderRadius: [6, 6, 0, 0],
          },
          barWidth: 32,
        },
      ],
    }),
    [overview?.taskStatus]
  );

  const taskTrendOption = useMemo(() => {
    const dates = overview?.taskTrend?.map((i) => i.date) || [];
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: ['新建任务', '已完成'], bottom: 0 },
      grid: { left: 40, right: 20, bottom: 40, top: 20 },
      xAxis: { type: 'category', boundaryGap: false, data: dates },
      yAxis: { type: 'value' },
      series: [
        {
          name: '新建任务',
          type: 'line',
          smooth: true,
          data: overview?.taskTrend?.map((i) => i.created) || [],
          areaStyle: { color: 'rgba(108,112,230,0.15)' },
          itemStyle: { color: chartThemeColor },
        },
        {
          name: '已完成',
          type: 'line',
          smooth: true,
          data: overview?.taskTrend?.map((i) => i.completed) || [],
          areaStyle: { color: 'rgba(85,209,135,0.15)' },
          itemStyle: { color: '#55D187' },
        },
      ],
    };
  }, [overview?.taskTrend]);

  const contributorOption = useMemo(
    () => ({
      tooltip: { trigger: 'axis' },
      grid: { left: 80, right: 30, top: 10, bottom: 30 },
      xAxis: { type: 'value' },
      yAxis: {
        type: 'category',
        data: overview?.topContributors?.map((i) => i.username) || [],
      },
      series: [
        {
          name: '完成任务',
          type: 'bar',
          data: overview?.topContributors?.map((i) => i.completed) || [],
          itemStyle: { color: chartThemeColor },
          barWidth: 14,
        },
        {
          name: '总任务',
          type: 'bar',
          data: overview?.topContributors?.map((i) => i.total) || [],
          itemStyle: { color: '#D9DBF4' },
          barWidth: 14,
          barGap: '-50%',
        },
      ],
    }),
    [overview?.topContributors]
  );

  const sortedProgress = useMemo(
    () =>
      (overview?.projectProgress || []).sort(
        (a: ProjectProgress, b: ProjectProgress) =>
          b.completed / (b.total || 1) - a.completed / (a.total || 1)
      ),
    [overview?.projectProgress]
  );

  const summaryItems = [
    {
      title: '项目数',
      value: overview?.summary.projects ?? 0,
      icon: <ProjectOutlined />,
      color: '#6C70E6',
    },
    {
      title: '任务数',
      value: overview?.summary.tasks ?? 0,
      icon: <ProfileOutlined />,
      color: '#55D187',
    },
    {
      title: 'Bug数',
      value: overview?.summary.bugs ?? 0,
      icon: <BugOutlined />,
      color: '#F76560',
    },
    {
      title: '成员数',
      value: overview?.summary.members ?? 0,
      icon: <TeamOutlined />,
      color: '#2BB0ED',
    },
  ];

  return (
    <div className="p-5 min-h-full bg-gray-50">
      <div className="flex items-center justify-end mb-4">
        <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
          刷新
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {summaryItems.map((item) => (
          <Col span={6} key={item.title}>
            <Card>
              <Space size={16} align="start">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: item.color }}
                >
                  {item.icon}
                </div>
                <div>
                  <div className="text-gray-500 text-sm">{item.title}</div>
                  <div className="text-2xl font-semibold">{item.value}</div>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} className="mt-1">
        <Col span={8}>
          <Card bodyStyle={{ height: 320 }}>
            {loading && !overview ? (
              <Skeleton active />
            ) : (
              <ReactECharts style={{ height: 280 }} option={ringOption('项目状态分布', overview?.projectStatus || [])} />
            )}
          </Card>
        </Col>
        <Col span={8}>
          <Card bodyStyle={{ height: 320 }}>
            {loading && !overview ? (
              <Skeleton active />
            ) : (
              <ReactECharts style={{ height: 280 }} option={taskStatusBar} />
            )}
          </Card>
        </Col>
        <Col span={8}>
          <Card bodyStyle={{ height: 320 }}>
            {loading && !overview ? (
              <Skeleton active />
            ) : (
              <ReactECharts style={{ height: 280 }} option={ringOption('Bug严重程度', overview?.bugSeverity || [])} />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-1">
        <Col span={16}>
          <Card title="任务趋势（14天）" bodyStyle={{ height: 360 }}>
            {loading && !overview ? (
              <Skeleton active />
            ) : (
              <ReactECharts style={{ height: 300 }} option={taskTrendOption} />
            )}
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Top执行人" bodyStyle={{ height: 360 }}>
            {loading && !overview ? (
              <Skeleton active />
            ) : (
              <ReactECharts style={{ height: 300 }} option={contributorOption} />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-1">
        <Col span={12}>
          <Card title="项目进度" bodyStyle={{ minHeight: 320 }}>
            <List
              loading={loading && !overview}
              dataSource={sortedProgress}
              renderItem={(item) => {
                const percent = item.total ? Math.round((item.completed / item.total) * 100) : 0;
                return (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text strong>{item.projectName}</Text>
                          <Tag color={percent >= 80 ? 'green' : percent >= 50 ? 'blue' : 'orange'}>{percent}%</Tag>
                        </Space>
                      }
                      description={
                        <Space size={12}>
                          <Text type="secondary">总任务 {item.total}</Text>
                          <Text type="success">已完成 {item.completed}</Text>
                        </Space>
                      }
                    />
                    <div className="w-52">
                      <Progress percent={percent} showInfo={false} strokeColor={chartThemeColor} />
                    </div>
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="近期到期任务（7天内）" bodyStyle={{ minHeight: 320 }}>
            <List
              loading={loading && !overview}
              dataSource={overview?.upcomingTasks || []}
              locale={{ emptyText: '最近一周暂无到期任务' }}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>{item.taskName}</Text>
                        <Tag color="blue">{item.projectName}</Tag>
                      </Space>
                    }
                    description={
                      <Space size={12}>
                        <Tag color="purple">{item.status}</Tag>
                        <Text type="secondary">
                          截止 {item.deadline ? dayjs(item.deadline).format('MM-DD HH:mm') : '未设置'}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;

