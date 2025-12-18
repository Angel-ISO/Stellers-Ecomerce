import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ChatService } from '../../application/use-cases/chat/chat.service';
import { CreateChatDto } from '../../application/dto/chat/create-chat.dto';
import { SendMessageDto } from '../../application/dto/chat/send-message.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard'; 
import { CurrentUser } from '../auth/current-user.decorator'; 

@Controller('chats')
@UseGuards(SupabaseAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async getOrCreateChat(
    @Body() createChatDto: CreateChatDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.chatService.getOrCreateChat(createChatDto, user.id);
  }

  @Get()
  async getUserChats(@CurrentUser() user: { id: string }) {
    return this.chatService.getUserChats(user.id);
  }

  @Get(':chatId')
  async getChatById(
    @Param('chatId') chatId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.chatService.getChatById(chatId, user.id);
  }

  @Get(':chatId/messages')
  async getChatMessages(
    @Param('chatId') chatId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @CurrentUser() user?: { id: string },
  ) {
    return this.chatService.getChatMessages(
      chatId,
      user.id,
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
    );
  }

  @Post(':chatId/messages')
  async sendMessage(
    @Param('chatId') chatId: string,
    @Body() sendMessageDto: SendMessageDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.chatService.sendMessage(chatId, sendMessageDto, user.id);
  }

  @Patch(':chatId/read')
  async markAsRead(
    @Param('chatId') chatId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.chatService.markMessagesAsRead(chatId, user.id);
  }
  
}