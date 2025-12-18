export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

export interface Chat {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
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
  lastMessage?: ChatMessage;
  unreadCount?: number;
}