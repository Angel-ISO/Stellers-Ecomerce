import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users.module';

import { CreateOrderUseCase } from '../../application/use-cases/orders/create-order.usecase';
import { UpdateOrderStatusUseCase } from '../../application/use-cases/orders/update-order-status.usecase';
import { GetOrdersUseCase } from '../../application/use-cases/orders/get-orders.usecase';

import { PrismaService } from '../config/prisma.service';
import { PrismaOrderRepository } from '../persistence/prisma/order.repository';
import { OrdersController } from '../controllers/orders.controller';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
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
    UsersModule,
  ],
  controllers: [OrdersController],
  providers: [
    {
      provide: 'IOrderRepository',
      useClass: PrismaOrderRepository,
    },
    PrismaService,
    PrismaOrderRepository,
    SupabaseAuthGuard,
    JwtUtils,
    CreateOrderUseCase,
    UpdateOrderStatusUseCase,
    GetOrdersUseCase,
  ],
  exports: [
    CreateOrderUseCase,
    UpdateOrderStatusUseCase,
    GetOrdersUseCase,
  ],
})
export class OrdersModule {}