import { Injectable, ForbiddenException, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { IReviewRepository } from '../../../domain/repositories/review.repository.interface';
import { UpdateReviewInput } from '../../dto/reviews/update-review.input';
import { ReviewOutput } from '../../dto/reviews/review.output';

@Injectable()
export class UpdateOwnReviewUseCase {
  constructor(@Inject('IReviewRepository') private readonly reviews: IReviewRepository) {}

  async execute(userId: string, productId: string, input: UpdateReviewInput): Promise<ReviewOutput> {
    if (input.rating !== undefined && (input.rating < 1 || input.rating > 5)) throw new BadRequestException('Invalid rating');
    if (input.comment && input.comment.length > 300) throw new BadRequestException('Comment too long');

    const review = await this.reviews.findByUserAndProduct(userId, productId);
    if (!review) throw new NotFoundException('Review not found');
    if (review.reviewerId !== userId) throw new ForbiddenException('Not your review');

    return this.reviews.update(review.id, { rating: input.rating, comment: input.comment });
  }
}
