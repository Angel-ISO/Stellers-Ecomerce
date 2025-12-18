import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { ICategoryRepository } from '../../../domain/repositories/category.repository.interface';
import { Category } from '../../../domain/entities/category.entity';

@Injectable()
export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(category: Category): Promise<Category> {
    const data = {
      id: category.id,
      name: category.name,
      parentId: category.parentId,
    };

    const saved = await this.prisma.category.upsert({
      where: { id: category.id },
      update: data,
      create: data,
    });

    return this.mapPrismaToCategory(saved);
  }

  async findById(id: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { id }
    });
    return category ? this.mapPrismaToCategory(category) : null;
  }

  async findAll(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    return categories.map(c => this.mapPrismaToCategory(c));
  }

  async findByParentId(parentId: string | null): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: { parentId },
      orderBy: { name: 'asc' },
    });
    return categories.map(c => this.mapPrismaToCategory(c));
  }

  async findChildren(categoryId: string): Promise<Category[]> {
    const children = await this.prisma.category.findMany({
      where: { parentId: categoryId },
      orderBy: { name: 'asc' },
    });
    return children.map(c => this.mapPrismaToCategory(c));
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.category.delete({
      where: { id },
    });
  }

  async hasChildren(categoryId: string): Promise<boolean> {
    const count = await this.prisma.category.count({
      where: { parentId: categoryId },
    });
    return count > 0;
  }

  private mapPrismaToCategory(prismaCategory: any): Category {
    return new Category(
      prismaCategory.id,
      prismaCategory.name,
      prismaCategory.parentId ?? null,
    );
  }
}
