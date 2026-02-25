import type { ChatMessageDto } from '@/request/type';
import { http } from '@/utils/http';

// 获取某个项目的消息历史
export const fetchProjectMessages = (projectId: string, limit = 100) => {
  return http.get<ChatMessageDto[]>(`/api/messages/${projectId}`, { limit });
};
