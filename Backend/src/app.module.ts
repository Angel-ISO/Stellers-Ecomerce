import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ProductsModule } from './infrastructure/modules/products.module';
import { UsersModule } from './infrastructure/modules/users.module';
import { AuthModule } from './infrastructure/modules/auth.module';
import { StoresModule } from './infrastructure/modules/stores.module';
import { CategoriesModule } from './infrastructure/modules/categories.module';
import { OrdersModule } from './infrastructure/modules/orders.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { ChatModule } from './infrastructure/modules/chat.module';
import { ReviewsModule } from './infrastructure/modules/reviews.module';
import { SellerRequestsModule } from './infrastructure/modules/seller-requests.module';
import { BannedUserGuard } from './infrastructure/auth/banned-user.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ProductsModule,
  UsersModule,
  StoresModule,
  CategoriesModule,
  OrdersModule,
  AuthModule,
  ChatModule,
  ReviewsModule,
  SellerRequestsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: BannedUserGuard,
    },
  ],
})
export class AppModule {}