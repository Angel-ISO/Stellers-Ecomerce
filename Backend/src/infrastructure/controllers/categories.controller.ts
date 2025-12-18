import {
  Controller,
  Post,
  UseGuards,
  Body,
  Param,
  Get,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { CreateCategoryUseCase } from '../../application/use-cases/categories/create-category.usecase';
import { GetCategoryByIdUseCase } from '../../application/use-cases/categories/get-category-by-id.usecase';
import { GetAllCategoriesUseCase } from '../../application/use-cases/categories/get-all-categories.usecase';
import { UpdateCategoryUseCase } from '../../application/use-cases/categories/update-category.usecase';
import { DeleteCategoryUseCase } from '../../application/use-cases/categories/delete-category.usecase';
import { CreateCategoryInput } from '../../application/dto/categories/create-category.input';
import { UpdateCategoryInput } from '../../application/dto/categories/update-category.input';
import { CategoryOutput } from '../../application/dto/categories/category.output';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly getCategoryByIdUseCase: GetCategoryByIdUseCase,
    private readonly getAllCategoriesUseCase: GetAllCategoriesUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
  ) {}

  @Post()
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new category (authenticated users only)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Category created successfully', type: CategoryOutput })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Parent category not found' })
  @HttpCode(HttpStatus.CREATED)
  async createCategory(@Body() input: CreateCategoryInput): Promise<CategoryOutput> {
    return this.createCategoryUseCase.execute(input);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories with hierarchical structure' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Categories retrieved successfully', type: [CategoryOutput] })
  async getAllCategories(): Promise<CategoryOutput[]> {
    return this.getAllCategoriesUseCase.execute();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by id with children' })
  @ApiParam({ name: 'id', description: 'Category id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Category retrieved successfully', type: CategoryOutput })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' })
  async getCategory(@Param('id') id: string): Promise<CategoryOutput> {
    return this.getCategoryByIdUseCase.execute(id);
  }

  @Put(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a category (authenticated users only)' })
  @ApiParam({ name: 'id', description: 'Category id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Category updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  async updateCategory(
    @Param('id') id: string,
    @Body() input: UpdateCategoryInput,
  ): Promise<CategoryOutput> {
    const updated = await this.updateCategoryUseCase.execute(id, input);
    return new CategoryOutput(updated, []);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a category (authenticated users only)' })
  @ApiParam({ name: 'id', description: 'Category id' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Category deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Category has children and cannot be deleted' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCategory(@Param('id') id: string): Promise<void> {
    await this.deleteCategoryUseCase.execute(id);
  }
}
