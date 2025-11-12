import { createBrowserRouter } from 'react-router-dom';
import { Home } from '@/views/home/Home';
import { Login } from '@/views/login/Login';
import { TaskCenter } from '@/views/center/TaskCenter';
import { Message } from '@/views/message/Message';
import { Bug } from '@/views/bug/Bug';
export const routes = [
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/LOGIN',
    element: <Home />,
  },
  {
    path: '/TASKCENTER',
    element: <TaskCenter />,
  },
  {
    path: '/MESSAGE',
    element: <Message />,
  },
  {
    path: '/BUG',
    element: <Bug />,
  },
];

export const router = createBrowserRouter([...routes]);
