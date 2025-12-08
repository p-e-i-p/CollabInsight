export interface Project {
  _id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  deadline?: string;
  leader: {
    _id: string;
    username: string;
    role: string;
  };
  members: Array<{
    _id: string;
    username: string;
    role: string;
  }>;
}

export interface Task {
  _id: string;
  project: string;
  taskName: string;
  taskDetails?: string;
  assignee: {
    _id: string;
    username: string;
    role: string;
  };
  createdBy: {
    _id: string;
    username: string;
    role: string;
  };
  urgency: string;
  status: string;
  startDate?: string;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

