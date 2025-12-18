import { supabase } from '$lib/lib/stores/supabase';
import type { Chat, ChatMessage } from '$lib/models/Chat/ChatType';

const API_URL = import.meta.env.VITE_API_URL || 'https://dzt4n7-ip-200-106-245-170.tunnelmole.net';

export class ChatService {

  private static getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private static getAuthHeaders(additionalHeaders?: HeadersInit): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(additionalHeaders || {})
    };

    const token = this.getAuthToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }
  /*
  private static async getAuthHeaderss() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  }*/

  static async getOrCreateChat(productId: string, buyerId: string): Promise<Chat> {
    const headers = this.getAuthHeaders();
    const response = await fetch(`${API_URL}/chats`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ productId, buyerId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create chat');
    }

    const result = await response.json();
    console.log('ChatService.getOrCreateChat raw response:', result);
    
    // Handle response format: {success: true, data: {...}} or direct Chat object
    if (result && typeof result === 'object') {
      if ('data' in result && result.data !== null && result.data !== undefined) {
        console.log('Extracting data from response:', result.data);
        return result.data;
      }
    }
    
    console.log('Returning result directly:', result);
    return result;
  }

  static async getUserChats(): Promise<Chat[]> {
    const headers = this.getAuthHeaders();
    const response = await fetch(`${API_URL}/chats`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chats');
    }

    const result = await response.json();
    // Handle response format: {success: true, data: [...]} or direct array
    return result?.data || result;
  }

  static async getChatById(chatId: string): Promise<Chat> {
    const headers = this.getAuthHeaders();
    const response = await fetch(`${API_URL}/chats/${chatId}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chat');
    }

    const result = await response.json();
    // Handle response format: {success: true, data: {...}} or direct Chat object
    return result?.data || result;
  }

  static async getChatMessages(
    chatId: string,
    limit = 50,
    offset = 0
  ): Promise<ChatMessage[]> {
    const headers = this.getAuthHeaders();
    const response = await fetch(
      `${API_URL}/chats/${chatId}/messages?limit=${limit}&offset=${offset}`,
      { headers }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch messages');
    }

    const result = await response.json();
    // Handle response format: {success: true, data: [...]} or direct array
    return result?.data || result;
  }

  static async sendMessage(chatId: string, content: string): Promise<ChatMessage> {
    const headers = this.getAuthHeaders();
    const response = await fetch(`${API_URL}/chats/${chatId}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send message');
    }

    const result = await response.json();
    // Handle response format: {success: true, data: {...}} or direct ChatMessage object
    return result?.data || result;
  }

  static async markMessagesAsRead(chatId: string): Promise<void> {
    const headers = this.getAuthHeaders();
    await fetch(`${API_URL}/chats/${chatId}/read`, {
      method: 'PATCH',
      headers,
    });
  }
}


/*import RestServices from '$lib/services/RestServices';
import { config } from '$lib/config/env';
import type { Chat, Message, ChatParticipant } from '$lib/models/Chat/ChatType';

export class ChatService {
  // Crear un nuevo chat entre dos usuarios
  static async createChat(participantIds: string[]): Promise<Chat> {
    const url = `${config.backendUrl}/chats`;
    const chatData = {
      participants: participantIds
    };
    const chat = await RestServices.post<Chat>(url, chatData);
    return chat;
  }

  // Obtener chats de un usuario
  static async getUserChats(userId: string): Promise<Chat[]> {
    const url = `${config.backendUrl}/chats`;
    const chats = await RestServices.get<Chat[]>(url);
    return chats;
  }

  // Obtener mensajes entre dos usuarios
  static async getChatMessages(receiverId: string, limit = 50): Promise<Message[]> {
    const url = `${config.backendUrl}/chats/messages/${receiverId}?limit=${limit}`;
    const messages = await RestServices.get<Message[]>(url);
    return messages;
  }

  // Enviar mensaje
  static async sendMessage(receiverId: string, content: string, productId?: string, orderId?: string): Promise<Message> {
    const url = `${config.backendUrl}/chats/messages`;
    const messageData = {
      receiverId,
      content,
      productId,
      orderId
    };
    const message = await RestServices.post<Message>(url, messageData);
    return message;
  }

  // Marcar mensajes como leídos - Este endpoint no está definido en el backend, se puede implementar si es necesario
  static async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    // Por ahora, no hacer nada ya que el backend no tiene este endpoint
    console.warn('markMessagesAsRead not implemented in backend');
  }

  // Buscar chat existente entre dos usuarios
  static async findChatBetweenUsers(userId1: string, userId2: string): Promise<Chat | null> {
    const url = `${config.backendUrl}/chats/find?userId1=${userId1}&userId2=${userId2}`;
    try {
      const chat = await RestServices.get<Chat>(url);
      return chat;
    } catch (error) {
      // Si no existe, devolver null
      return null;
    }
  }

  // Mappers
  private static mapChatFromDB(data: any): Chat {
    return {
      id: data.id,
      participants: data.participants,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      lastMessage: data.last_message ? this.mapMessageFromDB(data.last_message) : undefined,
    };
  }

  private static mapMessageFromDB(data: any): Message {
    return {
      id: data.id,
      chatId: data.chat_id,
      senderId: data.sender_id,
      content: data.content,
      timestamp: new Date(data.timestamp),
      readBy: data.read_by || [],
    };
  }
}

*/