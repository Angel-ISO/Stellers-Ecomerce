import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for uploading product images.
 * Used with multipart/form-data file uploads.
 */
export class UploadProductImagesInput {
  @ApiProperty({
    description: 'Product ID to upload images for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  productId: string;

  @ApiProperty({
    description: 'Image files to upload (max 5)',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    maxItems: 5,
  })
  images: Express.Multer.File[];
}
