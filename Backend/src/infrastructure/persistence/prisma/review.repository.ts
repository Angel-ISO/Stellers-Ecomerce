import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { IReviewRepository, CreateReviewDTO, UpdateReviewDTO, ProductReviewsResult } from '../../../domain/repositories/review.repository.interface';
import { ReviewOutput } from '../../../application/dto/reviews/review.output';

@Injectable()
export class PrismaReviewRepository implements IReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async hasDeliveredOrder(userId: string, productId: string): Promise<boolean> {
    const order = await this.prisma.order.findFirst({
      where: {
        buyerId: userId,
        status: 'DELIVERED',
        items: { some: { productId } },
      },
      select: { id: true },
    });
    return !!order;
  }

  private map(review: any): ReviewOutput {
    return {
      id: review.id,
      reviewerId: review.reviewerId,
      productId: review.productId!,
      rating: review.rating,
      comment: review.comment ?? null,
      createdAt: review.createdAt,
    };
  }

  async findByUserAndProduct(userId: string, productId: string): Promise<ReviewOutput | null> {
    const found = await this.prisma.review.findFirst({ where: { reviewerId: userId, productId } });
    return found ? this.map(found) : null;
    }

  async findById(reviewId: string): Promise<ReviewOutput | null> {
    const found = await this.prisma.review.findUnique({ where: { id: reviewId } });
    return found ? this.map(found) : null;
  }

  async create(input: CreateReviewDTO): Promise<ReviewOutput> {
    const created = await this.prisma.review.create({ data: {
      reviewerId: input.reviewerId,
      productId: input.productId,
      rating: input.rating,
      comment: input.comment,
    }});
    return this.map(created);
  }

  async update(reviewId: string, updates: UpdateReviewDTO): Promise<ReviewOutput> {
    const updated = await this.prisma.review.update({ where: { id: reviewId }, data: updates });
    return this.map(updated);
  }

  async deleteById(reviewId: string): Promise<void> {
    await this.prisma.review.delete({ where: { id: reviewId } });
  }

  async getProductReviews(productId: string): Promise<ProductReviewsResult> {
    const [list, aggregate] = await this.prisma.$transaction([
      this.prisma.review.findMany({ where: { productId }, orderBy: { createdAt: 'desc' } }),
      this.prisma.review.aggregate({ where: { productId }, _avg: { rating: true }, _count: { _all: true } }),
    ]);

    return {
      reviews: list.map(r => this.map(r)),
      averageRating: Number(aggregate._avg.rating ?? 0),
      totalReviews: aggregate._count._all,
    };
  }
}
