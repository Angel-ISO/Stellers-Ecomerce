import RestServices from '$lib/services/RestServices';
import reviewService, {
	CreateReviewInput,
	ProductReviewsOutput,
	ReviewOutput,
	UpdateReviewInput
} from '../Review.service';

jest.mock('$lib/services/RestServices');

describe('ReviewService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('getProductReviews', () => {
		it('should fetch product reviews', async () => {
			const mockReviewsData: ProductReviewsOutput = {
				reviews: [
					{
						id: '1',
						reviewerId: 'user-1',
						productId: 'product-1',
						rating: 5,
						comment: 'Great product!',
						createdAt: new Date()
					}
				],
				averageRating: 5,
				totalReviews: 1
			};
			(RestServices.get as jest.Mock).mockResolvedValue(mockReviewsData);

			const result = await reviewService.getProductReviews('product-1');

			expect(RestServices.get).toHaveBeenCalledWith(
				'http://localhost:3000/reviews/products/product-1'
			);
			expect(result).toEqual(mockReviewsData);
		});
	});

	describe('createProductReview', () => {
		it('should create a product review', async () => {
			const newReview: CreateReviewInput = {
				rating: 4,
				comment: 'Good product'
			};
			const mockResponse: ReviewOutput = {
				id: '2',
				reviewerId: 'user-2',
				productId: 'product-1',
				rating: 4,
				comment: 'Good product',
				createdAt: new Date()
			};
			(RestServices.post as jest.Mock).mockResolvedValue(mockResponse);

			const result = await reviewService.createProductReview('product-1', newReview);

			expect(RestServices.post).toHaveBeenCalledWith(
				'http://localhost:3000/reviews/products/product-1',
				newReview
			);
			expect(result).toEqual(mockResponse);
		});

		it('should create a review without comment', async () => {
			const newReview: CreateReviewInput = {
				rating: 5
			};
			const mockResponse: ReviewOutput = {
				id: '3',
				reviewerId: 'user-3',
				productId: 'product-1',
				rating: 5,
				createdAt: new Date()
			};
			(RestServices.post as jest.Mock).mockResolvedValue(mockResponse);

			const result = await reviewService.createProductReview('product-1', newReview);

			expect(RestServices.post).toHaveBeenCalledWith(
				'http://localhost:3000/reviews/products/product-1',
				newReview
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateProductReview', () => {
		it('should update a product review', async () => {
			const updateData: UpdateReviewInput = {
				rating: 3,
				comment: 'Updated comment'
			};
			const mockResponse: ReviewOutput = {
				id: '1',
				reviewerId: 'user-1',
				productId: 'product-1',
				rating: 3,
				comment: 'Updated comment',
				createdAt: new Date()
			};
			(RestServices.patch as jest.Mock).mockResolvedValue(mockResponse);

			const result = await reviewService.updateProductReview('product-1', updateData);

			expect(RestServices.patch).toHaveBeenCalledWith(
				'http://localhost:3000/reviews/products/product-1',
				updateData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteReview', () => {
		it('should delete a review', async () => {
			(RestServices.delete as jest.Mock).mockResolvedValue(undefined);

			await reviewService.deleteReview('1');

			expect(RestServices.delete).toHaveBeenCalledWith('http://localhost:3000/reviews/1');
		});
	});
});
