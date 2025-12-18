import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IReviewRepository } from '../../../domain/repositories/review.repository.interface';

@Injectable()
export class AdminDeleteReviewUseCase {
  constructor(@Inject('IReviewRepository') private readonly reviews: IReviewRepository) {}

  async execute(reviewId: string): Promise<void> {
    const review = await this.reviews.findById(reviewId);
    if (!review) throw new NotFoundException('Review not found');
    await this.reviews.deleteById(reviewId);
  }
}
