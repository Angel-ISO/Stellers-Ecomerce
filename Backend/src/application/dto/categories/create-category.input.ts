import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateCategoryInput {
  @ApiProperty({ description: 'Category name; at least 2 characters' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Parent category ID for hierarchical structure',
    required: false
  })
  @IsOptional()
  @IsString()
  parentId?: string;
}
