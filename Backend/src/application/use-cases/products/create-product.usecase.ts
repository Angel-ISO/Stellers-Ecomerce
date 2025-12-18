import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Product } from '../../../domain/entities/product.entity';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { IStoreRepository } from '../../../domain/repositories/store.repository.interface';
import { StoragePort } from '../../ports/out/storage.port';
import { CreateProductInput } from '../../dto/products/create-product.input';
import { ProductOutput } from '../../dto/products/product.output';
import { UnauthorizedStoreAccessError, StoreNotFoundError } from '../../../domain/errors/domain.errors';
import { validateImageFile, generateProductImagePath } from '../../../shared/utils/file-validation.utils';

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject('IProductRepository') private readonly productRepository: IProductRepository,
    @Inject('IStoreRepository') private readonly storeRepository: IStoreRepository,
    @Inject('StoragePort') private readonly storagePort: StoragePort,
  ) {}

  async execute(
    input: CreateProductInput,
    userId: string,
    files?: Express.Multer.File[],
  ): Promise<ProductOutput> {
    const store = await this.storeRepository.findById(input.storeId);
    if (!store) {
      throw new StoreNotFoundError(input.storeId);
    }

    if (store.ownerId !== userId) {
      throw new UnauthorizedStoreAccessError(userId, input.storeId);
    }

    const imageUrls: string[] = [];
    if (files && files.length > 0) {
      if (files.length > 5) {
        throw new BadRequestException('Maximum 5 images allowed per product');
      }

      const validationErrors: string[] = [];
      files.forEach((file, index) => {
        const validation = validateImageFile(file);
        if (!validation.isValid) {
          validationErrors.push(`File ${index + 1}: ${validation.error}`);
        }
      });

      if (validationErrors.length > 0) {
        throw new BadRequestException(`File validation failed: ${validationErrors.join('; ')}`);
      }
    }

    const productId = randomUUID();

    if (files && files.length > 0) {
      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const filePath = generateProductImagePath(productId, i, file.mimetype);
          const predictedUrl = this.storagePort.predictUrl('products', filePath);

          await this.storagePort.uploadFile('products', filePath, file.buffer, file.mimetype);
          imageUrls.push(predictedUrl);
        }
      } catch (error) {
        for (const url of imageUrls) {
          try {
            const path = this.extractPathFromUrl(url);
            await this.storagePort.deleteFile('products', path);
          } catch (cleanupError) {
            console.error('Failed to cleanup uploaded file:', cleanupError);
          }
        }
        throw new BadRequestException(`Failed to upload images: ${error.message}`);
      }
    }

    const product = new Product(
      productId,
      input.storeId,
      input.name,
      input.description,
      input.price,
      input.stock,
      new Date(),
      new Date(),
      input.categoryId,
      imageUrls,
      input.isActive !== undefined ? input.isActive : true,
      null,
    );

    const savedProduct = await this.productRepository.save(product);
    return new ProductOutput(savedProduct);
  }

  private extractPathFromUrl(url: string): string {
    const parts = url.split('/products/');
    return parts.length > 1 ? parts[1] : '';
  }
}