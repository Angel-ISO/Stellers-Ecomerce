import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users.module';
import { PrismaService } from '../config/prisma.service';
import { PrismaCategoryRepository } from '../persistence/prisma/category.repository';
import { CategoriesController } from '../controllers/categories.controller';
import { CreateCategoryUseCase } from '../../application/use-cases/categories/create-category.usecase';
import { GetCategoryByIdUseCase } from '../../application/use-cases/categories/get-category-by-id.usecase';
import { GetAllCategoriesUseCase } from '../../application/use-cases/categories/get-all-categories.usecase';
import { UpdateCategoryUseCase } from '../../application/use-cases/categories/update-category.usecase';
import { DeleteCategoryUseCase } from '../../application/use-cases/categories/delete-category.usecase';
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
  controllers: [CategoriesController],
  providers: [
    {
      provide: 'ICategoryRepository',
      useClass: PrismaCategoryRepository,
    },
    PrismaService,
    PrismaCategoryRepository,
    JwtUtils,
    SupabaseAuthGuard,
    CreateCategoryUseCase,
    GetCategoryByIdUseCase,
    GetAllCategoriesUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,
  ],
  exports: [
    'ICategoryRepository',
    CreateCategoryUseCase,
    GetCategoryByIdUseCase,
    GetAllCategoriesUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,
  ],
})
export class CategoriesModule {}
