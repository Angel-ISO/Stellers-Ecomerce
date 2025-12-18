import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class ChatRepository {
  constructor(private prisma: PrismaService) {}

  async findOrCreateChat(productId: string, buyerId: string, sellerId: string) {
    let chat = await this.prisma.chat.findUnique({
      where: {
        productId_buyerId_sellerId: {
          productId,
          buyerId,
          sellerId,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            imageUrls: true,
            price: true,
          },
        },
        buyer: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        seller: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!chat) {
      chat = await this.prisma.chat.create({
        data: {
          productId,
          buyerId,
          sellerId,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              imageUrls: true,
              price: true,
            },
          },
          buyer: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          seller: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      });
    }

    return chat;
  }

  async getChatById(chatId: string, userId: string) {
    return this.prisma.chat.findFirst({
      where: {
        id: chatId,
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            imageUrls: true,
            price: true,
          },
        },
        buyer: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        seller: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async getUserChats(userId: string) {
    const chats = await this.prisma.chat.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            imageUrls: true,
            price: true,
          },
        },
        buyer: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        seller: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const chatsWithUnread = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await this.prisma.chatMessage.count({
          where: {
            chatId: chat.id,
            senderId: { not: userId },
            isRead: false,
          },
        });

        return {
          ...chat,
          lastMessage: chat.messages[0] || null,
          unreadCount,
        };
      })
    );

    return chatsWithUnread;
  }

  async createMessage(chatId: string, senderId: string, content: string) {
    const message = await this.prisma.chatMessage.create({
      data: {
        chatId,
        senderId,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    await this.prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async getChatMessages(chatId: string, userId: string, limit = 50, offset = 0) {
    const chat = await this.prisma.chat.findFirst({
      where: {
        id: chatId,
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
    });

    if (!chat) {
      return null;
    }

    const messages = await this.prisma.chatMessage.findMany({
      where: { chatId },
      include: {
        sender: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return messages.reverse(); // Invertir para mostrar del más antiguo al más nuevo
  }

  async markMessagesAsRead(chatId: string, userId: string) {
    return this.prisma.chatMessage.updateMany({
      where: {
        chatId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }
}