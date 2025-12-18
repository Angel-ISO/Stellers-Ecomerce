import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ChatRepository } from '../../../infrastructure/persistence/prisma/chat.repository';
import { PrismaService } from '../../../infrastructure/config/prisma.service';
import { CreateChatDto } from '../../dto/chat/create-chat.dto';
import { SendMessageDto } from '../../dto/chat/send-message.dto';

@Injectable()
export class ChatService {
  constructor(
    private chatRepository: ChatRepository,
    private prisma: PrismaService,
  ) {}

  async getOrCreateChat(createChatDto: CreateChatDto, userId: string) {
    const { productId, buyerId } = createChatDto;

    if (buyerId !== userId) {
      throw new ForbiddenException('You can only create chats as yourself');
    }

    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        deletedAt: null,
        isActive: true,
      },
      include: {
        store: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const sellerId = product.store.ownerId;

    if (buyerId === sellerId) {
      throw new BadRequestException('You cannot chat with yourself');
    }

    const chat = await this.chatRepository.findOrCreateChat(
      productId,
      buyerId,
      sellerId,
    );

    return chat;
  }

  async getChatById(chatId: string, userId: string) {
    const chat = await this.chatRepository.getChatById(chatId, userId);

    if (!chat) {
      throw new NotFoundException('Chat not found or access denied');
    }

    return chat;
  }

  async getUserChats(userId: string) {
    return this.chatRepository.getUserChats(userId);
  }

  async sendMessage(
    chatId: string,
    sendMessageDto: SendMessageDto,
    userId: string,
  ) {
    const { content } = sendMessageDto;

    const chat = await this.chatRepository.getChatById(chatId, userId);

    if (!chat) {
      throw new NotFoundException('Chat not found or access denied');
    }

    const message = await this.chatRepository.createMessage(
      chatId,
      userId,
      content,
    );

    return message;
  }

  async getChatMessages(
    chatId: string,
    userId: string,
    limit = 50,
    offset = 0,
  ) {
    const messages = await this.chatRepository.getChatMessages(
      chatId,
      userId,
      limit,
      offset,
    );

    if (messages === null) {
      throw new NotFoundException('Chat not found or access denied');
    }

    return messages;
  }

  async markMessagesAsRead(chatId: string, userId: string) {
    const chat = await this.chatRepository.getChatById(chatId, userId);

    if (!chat) {
      throw new NotFoundException('Chat not found or access denied');
    }

    return this.chatRepository.markMessagesAsRead(chatId, userId);
  }
}