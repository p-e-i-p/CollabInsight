export interface NamedCount {
  name: string;
  count: number;
}

export interface SummaryBlock {
  projects: number;
  tasks: number;
  bugs: number;
  members: number;
}

export interface TrendPoint {
  date: string;
  created: number;
  completed: number;
}

export interface ProjectProgress {
  projectId: string;
  projectName: string;
  total: number;
  completed: number;
}

export interface UpcomingTask {
  taskId: string;
  taskName: string;
  projectName: string;
  deadline?: string;
  status: string;
}

export interface Contributor {
  userId?: string;
  username: string;
  completed: number;
  total: number;
}

export interface DashboardOverview {
  summary: SummaryBlock;
  projectStatus: NamedCount[];
  taskStatus: NamedCount[];
  taskUrgency: NamedCount[];
  bugStatus: NamedCount[];
  bugSeverity: NamedCount[];
  taskTrend: TrendPoint[];
  projectProgress: ProjectProgress[];
  upcomingTasks: UpcomingTask[];
  topContributors: Contributor[];
}

