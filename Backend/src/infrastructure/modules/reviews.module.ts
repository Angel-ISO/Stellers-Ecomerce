import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users.module';
import { PrismaService } from '../config/prisma.service';
import { PrismaReviewRepository } from '../persistence/prisma/review.repository';
import { ReviewsController } from '../controllers/reviews.controller';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CreateProductReviewUseCase } from '../../application/use-cases/reviews/create-product-review.usecase';
import { GetProductReviewsUseCase } from '../../application/use-cases/reviews/get-product-reviews.usecase';
import { UpdateOwnReviewUseCase } from '../../application/use-cases/reviews/update-own-review.usecase';
import { DeleteOwnReviewUseCase } from '../../application/use-cases/reviews/delete-own-review.usecase';
import { AdminDeleteReviewUseCase } from '../../application/use-cases/reviews/admin-delete-review.usecase';
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
  controllers: [ReviewsController],
  providers: [
    { provide: 'IReviewRepository', useClass: PrismaReviewRepository },
    PrismaService,
    JwtUtils,
    PrismaReviewRepository,
    CreateProductReviewUseCase,
    GetProductReviewsUseCase,
    UpdateOwnReviewUseCase,
    DeleteOwnReviewUseCase,
    AdminDeleteReviewUseCase,
    SupabaseAuthGuard,
    RolesGuard,
  ],
  exports: [
    'IReviewRepository',
    CreateProductReviewUseCase,
    GetProductReviewsUseCase,
    UpdateOwnReviewUseCase,
    DeleteOwnReviewUseCase,
    AdminDeleteReviewUseCase,
  ],
})
export class ReviewsModule {}
