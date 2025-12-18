export interface CreateReviewDTO {
  reviewerId: string;
  productId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewDTO {
  rating?: number;
  comment?: string | null;
}

export interface ProductReviewsResult {
  reviews: ReviewRecord[];
  averageRating: number;
  totalReviews: number;
}

export type ReviewRecord = {
  id: string;
  reviewerId: string;
  productId: string;
  rating: number;
  comment?: string | null;
  createdAt: Date;
};

export interface IReviewRepository {
  hasDeliveredOrder(userId: string, productId: string): Promise<boolean>;
  findByUserAndProduct(userId: string, productId: string): Promise<ReviewRecord | null>;
  findById(reviewId: string): Promise<ReviewRecord | null>;
  create(input: CreateReviewDTO): Promise<ReviewRecord>;
  update(reviewId: string, updates: UpdateReviewDTO): Promise<ReviewRecord>;
  deleteById(reviewId: string): Promise<void>;
  getProductReviews(productId: string): Promise<ProductReviewsResult>;
}
