import { Category } from '../entities/category.entity';

export interface ICategoryRepository {
  save(category: Category): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  findAll(): Promise<Category[]>;
  findByParentId(parentId: string | null): Promise<Category[]>;
  findChildren(categoryId: string): Promise<Category[]>;
  deleteById(id: string): Promise<void>;
  hasChildren(categoryId: string): Promise<boolean>;
}
