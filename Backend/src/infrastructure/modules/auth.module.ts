import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { RegisterUseCase } from '../../application/use-cases/auth/register.usecase';
import { LoginUseCase } from '../../application/use-cases/auth/login.usecase';
import { LoginWithSupabaseUseCase } from '../../application/use-cases/users/login-with-supabase.usecase';

import { PrismaService } from '../config/prisma.service';
import { PrismaUserRepository } from '../persistence/prisma/user.repository';
import { AuthController } from '../controllers/auth.controller';
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
  controllers: [AuthController],
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
        const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
        return createClient(supabaseUrl, supabaseKey);
      },
    },
    PrismaService,
    PrismaUserRepository,
    JwtUtils,
    RegisterUseCase,
    LoginUseCase,
    LoginWithSupabaseUseCase,
  ],
  exports: [
    'IUserProfileRepository',
    RegisterUseCase,
    LoginUseCase,
    LoginWithSupabaseUseCase,
  ],
})
export class AuthModule {}