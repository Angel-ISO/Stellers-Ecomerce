import { Injectable, Inject } from '@nestjs/common';
import { IReviewRepository } from '../../../domain/repositories/review.repository.interface';
import { ProductReviewsOutput } from '../../dto/reviews/product-reviews.output';

@Injectable()
export class GetProductReviewsUseCase {
  constructor(@Inject('IReviewRepository') private readonly reviews: IReviewRepository) {}

  async execute(productId: string): Promise<ProductReviewsOutput> {
    const result = await this.reviews.getProductReviews(productId);
    return { reviews: result.reviews, averageRating: result.averageRating, totalReviews: result.totalReviews };
  }
}
