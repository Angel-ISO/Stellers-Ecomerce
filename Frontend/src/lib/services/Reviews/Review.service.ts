import RestServices from '$lib/services/RestServices';
import { config } from '$lib/config/env';

export interface ReviewOutput {
	id: string;
	reviewerId: string;
	productId?: string;
	storeId?: string;
	rating: number;
	comment?: string;
	createdAt: Date;
}

export interface CreateReviewInput {
	rating: number;
	comment?: string;
}

export interface UpdateReviewInput {
	rating?: number;
	comment?: string;
}

export interface ProductReviewsOutput {
	reviews: ReviewOutput[];
	averageRating: number;
	totalReviews: number;
}

class ReviewService {
	private readonly baseUrl = config.backendUrl;

	public async getProductReviews(productId: string): Promise<ProductReviewsOutput> {
		return RestServices.get<ProductReviewsOutput>(`${this.baseUrl}/reviews/products/${productId}`);
	}

	public async createProductReview(
		productId: string,
		data: CreateReviewInput
	): Promise<ReviewOutput> {
		return RestServices.post<ReviewOutput>(`${this.baseUrl}/reviews/products/${productId}`, data);
	}

	public async updateProductReview(
		productId: string,
		data: UpdateReviewInput
	): Promise<ReviewOutput> {
		return RestServices.patch<ReviewOutput>(`${this.baseUrl}/reviews/products/${productId}`, data);
	}

	public async deleteReview(reviewId: string): Promise<void> {
		return RestServices.delete<void>(`${this.baseUrl}/reviews/${reviewId}`);
	}
}

const reviewService = new ReviewService();
export default reviewService;

