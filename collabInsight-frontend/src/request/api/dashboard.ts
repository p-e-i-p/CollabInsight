import { http } from '@/utils/http';
import type { DashboardOverview } from '@/types/dashboard';

export const fetchDashboardOverview = () => {
  return http.get<DashboardOverview>('/api/analytics/overview');
};

