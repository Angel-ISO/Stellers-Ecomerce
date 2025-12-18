import { Injectable, BadRequestException, ForbiddenException, ConflictException, Inject } from '@nestjs/common';
import { IReviewRepository } from '../../../domain/repositories/review.repository.interface';
import { CreateReviewInput } from '../../dto/reviews/create-review.input';
import { ReviewOutput } from '../../dto/reviews/review.output';

@Injectable()
export class CreateProductReviewUseCase {
  constructor(@Inject('IReviewRepository') private readonly reviews: IReviewRepository) {}

  async execute(userId: string, productId: string, input: CreateReviewInput): Promise<ReviewOutput> {
    if (input.rating < 1 || input.rating > 5) throw new BadRequestException('Invalid rating');
    if (input.comment && input.comment.length > 300) throw new BadRequestException('Comment too long');

    const already = await this.reviews.findByUserAndProduct(userId, productId);
    if (already) throw new ConflictException('User already reviewed this product');

    const delivered = await this.reviews.hasDeliveredOrder(userId, productId);
    if (!delivered) throw new ForbiddenException('Only delivered purchases can be reviewed');

    return this.reviews.create({ reviewerId: userId, productId, rating: input.rating, comment: input.comment });
  }
}
