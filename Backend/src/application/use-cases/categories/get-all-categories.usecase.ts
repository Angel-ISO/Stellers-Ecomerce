import { Injectable, Inject } from '@nestjs/common';
import { ICategoryRepository } from '../../../domain/repositories/category.repository.interface';
import { CategoryOutput } from '../../dto/categories/category.output';

@Injectable()
export class GetAllCategoriesUseCase {
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(): Promise<CategoryOutput[]> {
    const categories = await this.categoryRepository.findAll();

    // Build hierarchical structure
    const categoryMap = new Map<string, CategoryOutput>();
    const rootCategories: CategoryOutput[] = [];

    // First pass: create all category outputs
    for (const category of categories) {
      const children = categories.filter(c => c.parentId === category.id);
      const categoryOutput = new CategoryOutput(category, children);
      categoryMap.set(category.id, categoryOutput);
    }

    // Second pass: build tree structure
    for (const category of categories) {
      const categoryOutput = categoryMap.get(category.id);
      if (!categoryOutput) continue;

      if (category.isRoot()) {
        rootCategories.push(categoryOutput);
      }
    }

    return rootCategories;
  }
}
