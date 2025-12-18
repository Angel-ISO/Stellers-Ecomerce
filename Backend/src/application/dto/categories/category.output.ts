import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../../../domain/entities/category.entity';

export class CategoryOutput {
  @ApiProperty({ description: 'Category identifier' })
  id: string;

  @ApiProperty({ description: 'Category name' })
  name: string;

  @ApiProperty({ description: 'Parent category ID', required: false })
  parentId?: string | null;

  @ApiProperty({ description: 'Child categories', required: false, type: [CategoryOutput] })
  children?: CategoryOutput[];

  constructor(category: Category, children: Category[] = []) {
    this.id = category.id;
    this.name = category.name;
    this.parentId = category.parentId ?? null;

    if (children && children.length > 0) {
      this.children = children.map(child => new CategoryOutput(child, []));
    }
  }
}
