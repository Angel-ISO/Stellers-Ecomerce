import { Injectable, Inject } from '@nestjs/common';
import { ICategoryRepository } from '../../../domain/repositories/category.repository.interface';
import { Category } from '../../../domain/entities/category.entity';
import { UpdateCategoryInput } from '../../dto/categories/update-category.input';
import { CategoryNotFoundError } from '../../../domain/errors/domain.errors';

@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(id: string, input: UpdateCategoryInput): Promise<Category> {
    const existing = await this.categoryRepository.findById(id);
    if (!existing) {
      throw new CategoryNotFoundError(id);
    }

    const updated = existing.update({
      name: input.name,
    });

    const saved = await this.categoryRepository.save(updated);
    return saved;
  }
}
