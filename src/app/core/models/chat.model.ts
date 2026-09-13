export interface ChatThreadDto {
  id: number;
  entrepriseId: number;
  entrepriseName: string;
  clientUserId: number;
  clientName: string;
  lastMessageAt?: string | null;
  lastMessagePreview?: string | null;
  unreadCount: number;
}

export interface ChatRecipientDto {
  userId: number;
  name: string;
}

export interface ChatMessageDto {
  id: number;
  chatThreadId: number;
  senderUserId: number;
  senderName: string;
  isFromClient: boolean;
  body: string;
  createdAt: string;
  isReadByClient: boolean;
  isReadByStaff: boolean;
}

export interface ChatReadReceiptDto {
  chatThreadId: number;
  readByClient: boolean;
  readByStaff: boolean;
}
