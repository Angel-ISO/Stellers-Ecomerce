import { Injectable, Inject } from '@nestjs/common';
import { ICategoryRepository } from '../../../domain/repositories/category.repository.interface';
import { CategoryNotFoundError, CategoryHasChildrenError } from '../../../domain/errors/domain.errors';

@Injectable()
export class DeleteCategoryUseCase {
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new CategoryNotFoundError(id);
    }

    // Check if category has children
    const hasChildren = await this.categoryRepository.hasChildren(id);
    if (hasChildren) {
      throw new CategoryHasChildrenError(id);
    }

    await this.categoryRepository.deleteById(id);
  }
}
