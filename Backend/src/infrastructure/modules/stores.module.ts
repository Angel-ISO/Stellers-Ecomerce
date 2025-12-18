import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users.module';
import { PrismaService } from '../config/prisma.service';
import { PrismaStoreRepository } from '../persistence/prisma/store.repository';
import { StoresController } from '../controllers/stores.controller';
import { CreateStoreUseCase } from '../../application/use-cases/stores/create-store.usecase';
import { GetStoreByIdUseCase } from '../../application/use-cases/stores/get-store-by-id.usecase';
import { UpdateStoreUseCase } from '../../application/use-cases/stores/update-store.usecase';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { JwtUtils } from '../../shared/utils/jwt.utils';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('INTERNAL_JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('INTERNAL_JWT_EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  controllers: [StoresController],
  providers: [
    {
      provide: 'IStoreRepository',
      useClass: PrismaStoreRepository,
    },
    PrismaService,
    PrismaStoreRepository,
    JwtUtils,
    SupabaseAuthGuard,
    CreateStoreUseCase,
    GetStoreByIdUseCase,
    UpdateStoreUseCase,
  ],
  exports: ['IStoreRepository', CreateStoreUseCase, GetStoreByIdUseCase, UpdateStoreUseCase],
})
export class StoresModule {}
