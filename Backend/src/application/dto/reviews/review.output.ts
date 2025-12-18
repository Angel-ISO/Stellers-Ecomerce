import { ApiProperty } from '@nestjs/swagger';

export class ReviewOutput {
  @ApiProperty()
  id: string;

  @ApiProperty()
  reviewerId: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  rating: number;

  @ApiProperty({ required: false })
  comment?: string | null;

  @ApiProperty()
  createdAt: Date;
}
