import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users.module';
import { StoresModule } from './stores.module';

import { CreateProductUseCase } from '../../application/use-cases/products/create-product.usecase';
import { UpdateProductUseCase } from '../../application/use-cases/products/update-product.usecase';
import { DeleteProductUseCase } from '../../application/use-cases/products/delete-product.usecase';
import { GetAllProductsUseCase } from '../../application/use-cases/products/get-all-products.usecase';
import { GetProductByIdUseCase } from '../../application/use-cases/products/get-product-by-id.usecase';
import { GetProductsByStoreUseCase } from '../../application/use-cases/products/get-products-by-store.usecase';
import { RestoreProductUseCase } from '../../application/use-cases/products/restore-product.usecase';
import { UploadProductImagesUseCase } from '../../application/use-cases/products/upload-product-images.usecase';
import { DeleteProductImageUseCase } from '../../application/use-cases/products/delete-product-image.usecase';

import { PrismaService } from '../config/prisma.service';
import { PrismaProductRepository } from '../persistence/prisma/product.repository';
import { ProductsController } from '../controllers/products.controller';
import { RolesGuard } from '../auth/roles.guard';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { JwtUtils } from '../../shared/utils/jwt.utils';
import { SupabaseStorageAdapter } from '../adapters/supabase-storage.adapter';

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
    StoresModule,
  ],
  controllers: [ProductsController],
  providers: [
    {
      provide: 'IProductRepository',
      useClass: PrismaProductRepository,
    },
    {
      provide: 'SupabaseClient',
      useFactory: () => {
        const { createClient } = require('@supabase/supabase-js');
        const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        // Use service role key for server-side operations to bypass RLS
        return createClient(supabaseUrl, supabaseServiceKey || process.env.SUPABASE_ANON_KEY || 'your-anon-key');
      },
    },
    {
      provide: 'StoragePort',
      useClass: SupabaseStorageAdapter,
    },
    PrismaService,
    PrismaProductRepository,
    SupabaseStorageAdapter,
    JwtUtils,
    SupabaseAuthGuard,
    RolesGuard,
    CreateProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    GetAllProductsUseCase,
    GetProductByIdUseCase,
    GetProductsByStoreUseCase,
    RestoreProductUseCase,
    UploadProductImagesUseCase,
    DeleteProductImageUseCase,
  ],
  exports: [
    CreateProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    GetAllProductsUseCase,
    GetProductByIdUseCase,
    GetProductsByStoreUseCase,
    RestoreProductUseCase,
  ],
})
export class ProductsModule {}