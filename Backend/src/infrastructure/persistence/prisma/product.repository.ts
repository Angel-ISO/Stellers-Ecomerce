import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { Product } from '../../../domain/entities/product.entity';
import {
  IProductRepository,
  ProductFilters,
  ProductPagination,
  PaginatedResult,
} from '../../../domain/repositories/product.repository.interface';

@Injectable()
export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(product: Product): Promise<Product> {
    const data = {
      id: product.id,
      storeId: product.storeId,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
      imageUrls: product.imageUrls,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      deletedAt: product.deletedAt,
    };

    const savedProduct = await this.prisma.product.upsert({
      where: { id: product.id },
      update: data,
      create: data,
    });

    return this.mapPrismaToProduct(savedProduct);
  }

  async findAll(options?: { limit?: number; offset?: number }): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      where: { deletedAt: null },
      take: options?.limit,
      skip: options?.offset,
      orderBy: { createdAt: 'desc' },
    });

    return products.map(product => this.mapPrismaToProduct(product));
  }

  async findById(id: string, includeDeleted: boolean = false): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return null;
    }

    if (!includeDeleted && product.deletedAt !== null) {
      return null;
    }

    return this.mapPrismaToProduct(product);
  }

  async update(id: string, updates: Partial<Product>): Promise<Product> {
    const existingProduct = await this.findById(id, false);
    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const updatedProduct = existingProduct.update(updates);
    return this.save(updatedProduct);
  }

  async softDelete(id: string): Promise<Product> {
    const product = await this.findById(id, false);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const deletedProduct = product.deactivate();
    return this.save(deletedProduct);
  }

  async restore(id: string): Promise<Product> {
    const product = await this.findById(id, true);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const restoredProduct = product.restore();
    return this.save(restoredProduct);
  }

  async findAllWithFilters(
    filters: ProductFilters,
    pagination: ProductPagination,
  ): Promise<PaginatedResult<Product>> {
    const where = this.buildWhereClause(filters);
    const orderBy = this.buildOrderByClause(pagination);

    const skip = (pagination.page - 1) * pagination.limit;
    const take = Math.min(pagination.limit, 100); // Max 100 items per page

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map(p => this.mapPrismaToProduct(p)),
      total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  async findByStoreId(storeId: string, includeDeleted: boolean = false): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      where: {
        storeId,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return products.map(p => this.mapPrismaToProduct(p));
  }

  async count(filters: ProductFilters): Promise<number> {
    const where = this.buildWhereClause(filters);
    return this.prisma.product.count({ where });
  }

  /**
   * Builds the Prisma where clause from filters.
   */
  private buildWhereClause(filters: ProductFilters): any {
    const where: any = {};

    // Exclude soft-deleted by default
    if (!filters.includeDeleted) {
      where.deletedAt = null;
    }

    // Search term (searches in name and description)
    if (filters.searchTerm) {
      where.OR = [
        { name: { contains: filters.searchTerm, mode: 'insensitive' } },
        { description: { contains: filters.searchTerm, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    // Store filter
    if (filters.storeId) {
      where.storeId = filters.storeId;
    }

    // Price range filter
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      where.price = {};
      if (filters.priceMin !== undefined) {
        where.price.gte = filters.priceMin;
      }
      if (filters.priceMax !== undefined) {
        where.price.lte = filters.priceMax;
      }
    }

    return where;
  }

  /**
   * Builds the Prisma orderBy clause from pagination options.
   */
  private buildOrderByClause(pagination: ProductPagination): any {
    const sortBy = pagination.sortBy || 'createdAt';
    const sortOrder = pagination.sortOrder || 'desc';

    return { [sortBy]: sortOrder };
  }

  /**
   * Maps Prisma product model to domain entity.
   */
  private mapPrismaToProduct(prismaProduct: any): Product {
    return new Product(
      prismaProduct.id,
      prismaProduct.storeId,
      prismaProduct.name,
      prismaProduct.description,
      prismaProduct.price,
      prismaProduct.stock,
      prismaProduct.createdAt,
      prismaProduct.updatedAt,
      prismaProduct.categoryId,
      prismaProduct.imageUrls,
      prismaProduct.isActive,
      prismaProduct.deletedAt,
    );
  }
}