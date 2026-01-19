import { http } from '@/utils/http';

export interface ChatMessageDto {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'image';
  createdAt: string;
}

// 获取某个项目的消息历史
export const fetchProjectMessages = (projectId: string, limit = 100) => {
  return http.get<ChatMessageDto[]>(`/api/messages/${projectId}`, { limit });
};




