import { Injectable, Inject } from '@nestjs/common';
import { ICategoryRepository } from '../../../domain/repositories/category.repository.interface';
import { CreateCategoryInput } from '../../dto/categories/create-category.input';
import { CategoryOutput } from '../../dto/categories/category.output';
import { Category } from '../../../domain/entities/category.entity';
import { CategoryNotFoundError } from '../../../domain/errors/domain.errors';

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(input: CreateCategoryInput): Promise<CategoryOutput> {
    // Validate parent category exists if parentId is provided
    if (input.parentId) {
      const parentExists = await this.categoryRepository.findById(input.parentId);
      if (!parentExists) {
        throw new CategoryNotFoundError(input.parentId);
      }
    }

    const category = new Category(
      this.generateId(),
      input.name,
      input.parentId ?? null,
    );

    const saved = await this.categoryRepository.save(category);
    return new CategoryOutput(saved, []);
  }

  private generateId(): string {
    return Date.now().toString();
  }
}
