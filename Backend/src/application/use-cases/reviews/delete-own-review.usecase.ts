import { Injectable, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { IReviewRepository } from '../../../domain/repositories/review.repository.interface';

@Injectable()
export class DeleteOwnReviewUseCase {
  constructor(@Inject('IReviewRepository') private readonly reviews: IReviewRepository) {}

  async execute(userId: string, reviewId: string): Promise<void> {
    const review = await this.reviews.findById(reviewId);
    if (!review) throw new NotFoundException('Review not found');
    if (review.reviewerId !== userId) throw new ForbiddenException('Not your review');
    await this.reviews.deleteById(reviewId);
  }
}
