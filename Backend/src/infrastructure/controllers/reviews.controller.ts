import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateProductReviewUseCase } from '../../application/use-cases/reviews/create-product-review.usecase';
import { GetProductReviewsUseCase } from '../../application/use-cases/reviews/get-product-reviews.usecase';
import { UpdateOwnReviewUseCase } from '../../application/use-cases/reviews/update-own-review.usecase';
import { DeleteOwnReviewUseCase } from '../../application/use-cases/reviews/delete-own-review.usecase';
import { AdminDeleteReviewUseCase } from '../../application/use-cases/reviews/admin-delete-review.usecase';
import { CreateReviewInput } from '../../application/dto/reviews/create-review.input';
import { UpdateReviewInput } from '../../application/dto/reviews/update-review.input';
import { ReviewOutput } from '../../application/dto/reviews/review.output';
import { ProductReviewsOutput } from '../../application/dto/reviews/product-reviews.output';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly createReview: CreateProductReviewUseCase,
    private readonly getProductReviews: GetProductReviewsUseCase,
    private readonly updateOwnReview: UpdateOwnReviewUseCase,
    private readonly deleteOwnReview: DeleteOwnReviewUseCase,
    private readonly adminDeleteReview: AdminDeleteReviewUseCase,
  ) {}

  @Post('products/:productId')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'productId' })
  @ApiOperation({ summary: 'Create product review (only delivered orders)' })
  @ApiBody({ type: CreateReviewInput })
  @ApiResponse({ status: HttpStatus.CREATED, type: ReviewOutput })
  @HttpCode(HttpStatus.CREATED)
  async create(@Param('productId') productId: string, @Body() input: CreateReviewInput, @Req() req: any): Promise<ReviewOutput> {
    const userId = req.user.id;
    return this.createReview.execute(userId, productId, input);
  }

  @Get('products/:productId')
  @ApiParam({ name: 'productId' })
  @ApiOperation({ summary: 'Get product reviews and average rating' })
  @ApiResponse({ status: HttpStatus.OK, type: ProductReviewsOutput })
  async listByProduct(@Param('productId') productId: string): Promise<ProductReviewsOutput> {
    return this.getProductReviews.execute(productId);
  }

  @Patch('products/:productId')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'productId' })
  @ApiOperation({ summary: 'Update own review for a product' })
  @ApiBody({ type: UpdateReviewInput })
  @ApiResponse({ status: HttpStatus.OK, type: ReviewOutput })
  async updateOwn(@Param('productId') productId: string, @Body() input: UpdateReviewInput, @Req() req: any): Promise<ReviewOutput> {
    const userId = req.user.id;
    return this.updateOwnReview.execute(userId, productId, input);
  }

  @Delete(':reviewId')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'reviewId' })
  @ApiOperation({ summary: 'Delete own review' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOwn(@Param('reviewId') reviewId: string, @Req() req: any): Promise<void> {
    const userId = req.user.id;
    return this.deleteOwnReview.execute(userId, reviewId);
  }

  @Delete(':reviewId/admin')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('MODERATOR')
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'reviewId' })
  @ApiOperation({ summary: 'Moderator deletes an inappropriate review' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @HttpCode(HttpStatus.NO_CONTENT)
  async adminDelete(@Param('reviewId') reviewId: string): Promise<void> {
    return this.adminDeleteReview.execute(reviewId);
  }
}
