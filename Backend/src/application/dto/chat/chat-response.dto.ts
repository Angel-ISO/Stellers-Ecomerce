export class ChatMessageResponseDto {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  sender: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

export class ChatResponseDto {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  createdAt: Date;
  updatedAt: Date;
  product: {
    id: string;
    name: string;
    imageUrls: string[];
    price: number;
  };
  buyer: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  seller: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  lastMessage?: ChatMessageResponseDto;
  unreadCount?: number;
}