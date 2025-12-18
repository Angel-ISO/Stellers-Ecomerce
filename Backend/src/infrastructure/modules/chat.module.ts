import { Module } from '@nestjs/common';
import { ChatController } from '../controllers/chat.controller';
import { ChatService } from '../../application/use-cases/chat/chat.service';
import { ChatRepository } from '../persistence/prisma/chat.repository';
import { PrismaService } from '../config/prisma.service';
import { UsersModule } from './users.module';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { JwtUtils } from '@/shared/utils/jwt.utils';

@Module({
  imports: [UsersModule],
  controllers: [ChatController],
  providers: [ChatService, ChatRepository, PrismaService, SupabaseAuthGuard, JwtUtils],
  exports: [ChatService],
})
export class ChatModule {}