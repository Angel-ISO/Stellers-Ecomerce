import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RedisService } from '../config/redis.service';
import { RedisSellerRequestRepository } from '../persistence/redis/seller-request.repository';
import { SellerRequestsController } from '../controllers/seller-requests.controller';
import { CreateSellerRequestUseCase } from '../../application/use-cases/seller-requests/create-seller-request.usecase';
import { GetAllPendingRequestsUseCase } from '../../application/use-cases/seller-requests/get-all-pending-requests.usecase';
import { GetMyRequestUseCase } from '../../application/use-cases/seller-requests/get-my-request.usecase';
import { ApproveSellerRequestUseCase } from '../../application/use-cases/seller-requests/approve-seller-request.usecase';
import { RejectSellerRequestUseCase } from '../../application/use-cases/seller-requests/reject-seller-request.usecase';
import { StoresModule } from './stores.module';
import { UsersModule } from './users.module';
import { JwtUtils } from '../../shared/utils/jwt.utils';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Module({
  imports: [
    ConfigModule,
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
    StoresModule,
    UsersModule,
  ],
  controllers: [SellerRequestsController],
  providers: [
    RedisService,
    {
      provide: 'ISellerRequestRepository',
      useClass: RedisSellerRequestRepository,
    },
    JwtUtils,
    SupabaseAuthGuard,
    CreateSellerRequestUseCase,
    GetAllPendingRequestsUseCase,
    GetMyRequestUseCase,
    ApproveSellerRequestUseCase,
    RejectSellerRequestUseCase,
  ],
  exports: [
    'ISellerRequestRepository',
    CreateSellerRequestUseCase,
    GetAllPendingRequestsUseCase,
    GetMyRequestUseCase,
    ApproveSellerRequestUseCase,
    RejectSellerRequestUseCase,
  ],
})
export class SellerRequestsModule {}

