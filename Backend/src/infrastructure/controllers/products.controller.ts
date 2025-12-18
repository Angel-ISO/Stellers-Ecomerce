import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { CreateProductUseCase } from '../../application/use-cases/products/create-product.usecase';
import { UpdateProductUseCase } from '../../application/use-cases/products/update-product.usecase';
import { DeleteProductUseCase } from '../../application/use-cases/products/delete-product.usecase';
import { GetAllProductsUseCase } from '../../application/use-cases/products/get-all-products.usecase';
import { GetProductByIdUseCase } from '../../application/use-cases/products/get-product-by-id.usecase';
import { GetProductsByStoreUseCase } from '../../application/use-cases/products/get-products-by-store.usecase';
import { RestoreProductUseCase } from '../../application/use-cases/products/restore-product.usecase';
import { UploadProductImagesUseCase } from '../../application/use-cases/products/upload-product-images.usecase';
import { DeleteProductImageUseCase } from '../../application/use-cases/products/delete-product-image.usecase';
import { CreateProductInput } from '../../application/dto/products/create-product.input';
import { UpdateProductInput } from '../../application/dto/products/update-product.input';
import { FilterProductsInput } from '../../application/dto/products/filter-products.input';
import { ProductOutput } from '../../application/dto/products/product.output';
import { PaginatedProductOutput } from '../../application/dto/products/paginated-product.output';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/current-user.decorator';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
    private readonly getAllProductsUseCase: GetAllProductsUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
    private readonly getProductsByStoreUseCase: GetProductsByStoreUseCase,
    private readonly restoreProductUseCase: RestoreProductUseCase,
    private readonly uploadProductImagesUseCase: UploadProductImagesUseCase,
    private readonly deleteProductImageUseCase: DeleteProductImageUseCase,
  ) {}

  @Post()
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FilesInterceptor('images', 5))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new product with optional images' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['storeId', 'name', 'price', 'stock'],
      properties: {
        storeId: {
          type: 'string',
          description: 'Store identifier (UUID)',
          example: 'uuid-de-tu-tienda',
        },
        name: {
          type: 'string',
          description: 'Product name',
          example: 'Producto Ejemplo',
        },
        description: {
          type: 'string',
          description: 'Product description',
          example: 'Descripción detallada del producto',
        },
        price: {
          type: 'number',
          description: 'Product price',
          example: 29.99,
          minimum: 0,
        },
        stock: {
          type: 'number',
          description: 'Available stock quantity',
          example: 100,
          minimum: 0,
        },
        categoryId: {
          type: 'string',
          description: 'Category identifier (UUID)',
          example: 'uuid-de-categoria',
        },
        isActive: {
          type: 'boolean',
          description: 'Whether the product is active',
          example: true,
          default: true,
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Product images (max 5, PNG/JPEG/WebP, 2MB each)',
          maxItems: 5,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Product created successfully',
    type: ProductOutput,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or file validation failed',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not own the store',
  })
  @HttpCode(HttpStatus.CREATED)
  async createProduct(
    @Body() input: CreateProductInput,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: CurrentUserData,
  ): Promise<ProductOutput> {
    return this.createProductUseCase.execute(input, user.id, files);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with filtering and pagination (PUBLIC)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Products retrieved successfully',
    type: PaginatedProductOutput,
  })
  async getAllProducts(@Query() filters: FilterProductsInput): Promise<PaginatedProductOutput> {
    return this.getAllProductsUseCase.execute(filters);
  }

  @Get('my-store/products')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all products for the authenticated user\'s store' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Seller products retrieved successfully',
    type: [ProductOutput],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Seller does not have a store',
  })
  async getMyStoreProducts(@CurrentUser() user: CurrentUserData): Promise<ProductOutput[]> {
    return this.getProductsByStoreUseCase.execute(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID (PUBLIC)' })
  @ApiParam({
    name: 'id',
    description: 'Product unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product retrieved successfully',
    type: ProductOutput,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  async getProductById(@Param('id') id: string): Promise<ProductOutput> {
    return this.getProductByIdUseCase.execute(id);
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a product (must own the product)' })
  @ApiParam({
    name: 'id',
    description: 'Product unique identifier',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product updated successfully',
    type: ProductOutput,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not own this product',
  })
  async updateProduct(
    @Param('id') id: string,
    @Body() input: UpdateProductInput,
    @CurrentUser() user: CurrentUserData,
  ): Promise<ProductOutput> {
    return this.updateProductUseCase.execute(id, input, user.id);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Soft delete a product (must own the product)' })
  @ApiParam({
    name: 'id',
    description: 'Product unique identifier',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product deleted successfully',
    type: ProductOutput,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not own this product',
  })
  async deleteProduct(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<ProductOutput> {
    return this.deleteProductUseCase.execute(id, user.id);
  }

  @Patch(':id/restore')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Restore a soft-deleted product (must own the product)' })
  @ApiParam({
    name: 'id',
    description: 'Product unique identifier',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product restored successfully',
    type: ProductOutput,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not own this product',
  })
  async restoreProduct(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<ProductOutput> {
    return this.restoreProductUseCase.execute(id, user.id);
  }

  @Post(':id/images')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FilesInterceptor('images', 5))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload images to a product (max 5 images per request, max 5 total)' })
  @ApiParam({
    name: 'id',
    description: 'Product unique identifier',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          maxItems: 5,
          description: 'Image files (PNG, JPEG, WebP - max 2MB each)',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Images uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        imageUrls: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of all product image URLs',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid files or exceeds maximum images limit',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not own this product',
  })
  async uploadProductImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: CurrentUserData,
  ): Promise<{ imageUrls: string[] }> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }
    return this.uploadProductImagesUseCase.execute(id, user.id, files);
  }

  @Delete(':id/images/:index')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a specific image from a product (must own the product)' })
  @ApiParam({
    name: 'id',
    description: 'Product unique identifier',
  })
  @ApiParam({
    name: 'index',
    description: 'Image index (0-based)',
    example: 0,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Image deleted successfully',
    schema: {
      type: 'object',
      properties: {
        imageUrls: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of remaining product image URLs',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid image index',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not own this product',
  })
  async deleteProductImage(
    @Param('id') id: string,
    @Param('index') index: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<{ imageUrls: string[] }> {
    const imageIndex = parseInt(index, 10);
    if (isNaN(imageIndex) || imageIndex < 0) {
      throw new BadRequestException('Invalid image index');
    }
    return this.deleteProductImageUseCase.execute(id, imageIndex, user.id);
  }
}