import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { IStoreRepository } from '../../../domain/repositories/store.repository.interface';
import { Store } from '../../../domain/entities/store.entity';
import { Product } from '../../../domain/entities/product.entity';

@Injectable()
export class PrismaStoreRepository implements IStoreRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(store: Store): Promise<Store> {
    const data = {
      id: store.id,
      ownerId: store.ownerId,
      name: store.name,
      description: store.description,
      logoUrl: store.logoUrl,
      status: store.status,
      createdAt: store.createdAt,
    };

    const saved = await this.prisma.store.upsert({
      where: { id: store.id },
      update: data,
      create: data,
    });

    return this.mapPrismaToStore(saved);
  }

  async findById(id: string): Promise<Store | null> {
    const store = await this.prisma.store.findUnique({ where: { id } });
    return store ? this.mapPrismaToStore(store) : null;
  }

  async findPublicById(id: string): Promise<{ store: Store; products: Product[] } | null> {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: { products: { where: { isActive: true } } },
    });

    if (!store) return null;

    const domainStore = this.mapPrismaToStore(store);
    const products = (store.products || []).map((p: any) => this.mapPrismaToProduct(p));
    return { store: domainStore, products };
  }

  async findByOwner(ownerId: string): Promise<Store[]> {
    const stores = await this.prisma.store.findMany({ where: { ownerId } });
    return stores.map(s => this.mapPrismaToStore(s));
  }

  async findByOwnerId(ownerId: string): Promise<Store | null> {
    const store = await this.prisma.store.findUnique({
      where: { ownerId },
    });
    return store ? this.mapPrismaToStore(store) : null;
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.product.updateMany({ where: { storeId: id }, data: { isActive: false } }),
      this.prisma.store.update({ where: { id }, data: { status: 'BLOCKED' } }),
    ]);
  }

  async verifyOwnership(storeId: string, userId: string): Promise<boolean> {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: { ownerId: true },
    });

    return store?.ownerId === userId;
  }

  private mapPrismaToStore(prismaStore: any): Store {
    return new Store(
      prismaStore.id,
      prismaStore.ownerId,
      prismaStore.name,
      prismaStore.description ?? null,
      prismaStore.logoUrl ?? null,
      prismaStore.status,
      prismaStore.createdAt,
    );
  }

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
