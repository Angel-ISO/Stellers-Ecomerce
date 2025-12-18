import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateCategoryInput {
  @ApiProperty({ description: 'Category name; at least 2 characters' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;
}
