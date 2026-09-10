export interface NotificationDto {
  id: number;
  title: string;
  message: string;
  relatedEntityName?: string | null;
  relatedEntityId?: number | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}
