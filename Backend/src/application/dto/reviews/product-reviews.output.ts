import { ApiProperty } from '@nestjs/swagger';
import { ReviewOutput } from './review.output';

export class ProductReviewsOutput {
  @ApiProperty({ type: [ReviewOutput] })
  reviews: ReviewOutput[];

  @ApiProperty()
  averageRating: number;

  @ApiProperty()
  totalReviews: number;
}
