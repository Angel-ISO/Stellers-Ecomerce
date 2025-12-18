import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { IStoreRepository } from '../../../domain/repositories/store.repository.interface';
import { StoragePort } from '../../ports/out/storage.port';
import { validateImageFile, generateProductImagePath } from '../../../shared/utils/file-validation.utils';

/**
 * Use case for uploading images to a product.
 * Handles file validation, storage upload, and database update.
 */
@Injectable()
export class UploadProductImagesUseCase {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    @Inject('IStoreRepository')
    private readonly storeRepository: IStoreRepository,
    @Inject('StoragePort')
    private readonly storagePort: StoragePort,
  ) {}

  /**
   * Executes the use case to upload product images.
   * @param productId - ID of the product
   * @param userId - ID of the user uploading images
   * @param files - Array of image files to upload
   * @returns Updated product with new image URLs
   */
  async execute(
    productId: string,
    userId: string,
    files: Express.Multer.File[],
  ): Promise<{ imageUrls: string[] }> {
    // Validate that files are provided
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    // Validate maximum number of files
    if (files.length > 5) {
      throw new BadRequestException('Maximum 5 images allowed per upload');
    }

    // Find the product
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Verify ownership through store
    const store = await this.storeRepository.findById(product.storeId);
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    if (store.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to modify this product');
    }

    // Validate that adding these images won't exceed the limit
    const totalImages = product.getImageCount() + files.length;
    if (totalImages > 5) {
      throw new BadRequestException(`Product can have maximum 5 images. Current: ${product.getImageCount()}, Trying to add: ${files.length}`);
    }

    // Validate each file
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

    // Upload files and collect URLs
    const uploadedUrls: string[] = [];
    const currentImageCount = product.getImageCount();

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageIndex = currentImageCount + i;

        // Generate storage path
        const filePath = generateProductImagePath(productId, imageIndex, file.mimetype);

        // Predict URL before upload
        const predictedUrl = this.storagePort.predictUrl('products', filePath);

        // Upload to storage
        await this.storagePort.uploadFile('products', filePath, file.buffer, file.mimetype);

        uploadedUrls.push(predictedUrl);
      }

      // Update product with new image URLs
      let updatedProduct = product;
      for (const url of uploadedUrls) {
        updatedProduct = updatedProduct.addImage(url);
      }

      // Save to database
      await this.productRepository.update(productId, updatedProduct);

      return {
        imageUrls: updatedProduct.imageUrls,
      };
    } catch (error) {
      // If upload fails, try to clean up any uploaded files
      for (const url of uploadedUrls) {
        try {
          const path = this.extractPathFromUrl(url);
          await this.storagePort.deleteFile('products', path);
        } catch (cleanupError) {
          // Log but don't throw - we want to propagate the original error
          console.error('Failed to cleanup uploaded file:', cleanupError);
        }
      }

      throw error;
    }
  }

  /**
   * Extracts the file path from a full storage URL.
   * @param url - Full storage URL
   * @returns File path without bucket and base URL
   */
  private extractPathFromUrl(url: string): string {
    // URL format: {supabaseUrl}/storage/v1/object/public/products/{path}
    const parts = url.split('/products/');
    return parts.length > 1 ? parts[1] : '';
  }
}
