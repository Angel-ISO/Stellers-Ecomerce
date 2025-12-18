import { Injectable, Inject } from '@nestjs/common';
import { ICategoryRepository } from '../../../domain/repositories/category.repository.interface';
import { CategoryOutput } from '../../dto/categories/category.output';
import { CategoryNotFoundError } from '../../../domain/errors/domain.errors';

@Injectable()
export class GetCategoryByIdUseCase {
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(id: string): Promise<CategoryOutput> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new CategoryNotFoundError(id);
    }

    // Get children categories
    const children = await this.categoryRepository.findChildren(id);

    return new CategoryOutput(category, children);
  }
}
