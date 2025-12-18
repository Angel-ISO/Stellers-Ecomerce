import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { LoginWithSupabaseUseCase } from '../../application/use-cases/users/login-with-supabase.usecase';
import { UpdateUserAvatarUseCase } from '../../application/use-cases/users/update-user-avatar.usecase';
import { GetAllUsersUseCase } from '../../application/use-cases/users/get-all-users.usecase';
import { GetUserByIdUseCase } from '../../application/use-cases/users/get-user-by-id.usecase';
import { UpdateUserUseCase } from '../../application/use-cases/users/update-user.usecase';
import { DeleteUserUseCase } from '../../application/use-cases/users/delete-user.usecase';
import { BanUserUseCase } from '../../application/use-cases/users/ban-user.usecase';
import { UnbanUserUseCase } from '../../application/use-cases/users/unban-user.usecase';
import { GiveModeratorUseCase } from '../../application/use-cases/users/give-moderator.usecase';
import { RemoveModeratorUseCase } from '../../application/use-cases/users/remove-moderator.usecase';

import { PrismaService } from '../config/prisma.service';
import { PrismaUserRepository } from '../persistence/prisma/user.repository';
import { UserController } from '../controllers/user.controller';
import { SupabaseStorageAdapter } from '../adapters/supabase-storage.adapter';
import { StoragePort } from '../../application/ports/out/storage.port';
import { JwtUtils } from '../../shared/utils/jwt.utils';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('INTERNAL_JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('INTERNAL_JWT_EXPIRES_IN'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController],
  providers: [
    {
      provide: 'IUserProfileRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: 'SupabaseClient',
      useFactory: () => {
        const { createClient } = require('@supabase/supabase-js');
        const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        return createClient(
          supabaseUrl,
          supabaseServiceKey || process.env.SUPABASE_ANON_KEY || 'your-anon-key'
        );
      },
    },
    {
      provide: 'StoragePort',
      useClass: SupabaseStorageAdapter,
    },

    PrismaService,
    JwtUtils,

    // Use cases
    LoginWithSupabaseUseCase,
    UpdateUserAvatarUseCase,
    GetAllUsersUseCase,
    GetUserByIdUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    BanUserUseCase,
    UnbanUserUseCase,
    GiveModeratorUseCase,
    RemoveModeratorUseCase,
    GiveModeratorUseCase,
    RemoveModeratorUseCase,
  ],
  exports: [
    'IUserProfileRepository',
    JwtModule,
    LoginWithSupabaseUseCase,
    UpdateUserAvatarUseCase,
    GetAllUsersUseCase,
    GetUserByIdUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    BanUserUseCase,
    UnbanUserUseCase,
  ],
})
export class UsersModule {}
