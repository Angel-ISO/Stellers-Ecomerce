import RestServices from '$lib/services/RestServices';
import categoryService, {
	CategoryOutput,
	CreateCategoryInput,
	UpdateCategoryInput
} from '../Category.service';

jest.mock('$lib/services/RestServices');

describe('CategoryService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('getAllCategories', () => {
		it('should fetch all categories', async () => {
			const mockCategories: CategoryOutput[] = [
				{ id: '1', name: 'Category 1' },
				{ id: '2', name: 'Category 2', parentId: '1' }
			];
			(RestServices.get as jest.Mock).mockResolvedValue(mockCategories);

			const result = await categoryService.getAllCategories();

			expect(RestServices.get).toHaveBeenCalledWith('http://localhost:3000/categories');
			expect(result).toEqual(mockCategories);
		});
	});

	describe('getCategoryById', () => {
		it('should fetch a single category by id', async () => {
			const mockCategory: CategoryOutput = {
				id: '1',
				name: 'Category 1',
				children: [{ id: '2', name: 'Subcategory', parentId: '1' }]
			};
			(RestServices.get as jest.Mock).mockResolvedValue(mockCategory);

			const result = await categoryService.getCategoryById('1');

			expect(RestServices.get).toHaveBeenCalledWith('http://localhost:3000/categories/1');
			expect(result).toEqual(mockCategory);
		});
	});

	describe('createCategory', () => {
		it('should create a new category', async () => {
			const newCategory: CreateCategoryInput = {
				name: 'New Category'
			};
			const mockResponse: CategoryOutput = { ...newCategory, id: '3' };
			(RestServices.post as jest.Mock).mockResolvedValue(mockResponse);

			const result = await categoryService.createCategory(newCategory);

			expect(RestServices.post).toHaveBeenCalledWith(
				'http://localhost:3000/categories',
				newCategory
			);
			expect(result).toEqual(mockResponse);
		});

		it('should create a subcategory with parentId', async () => {
			const newSubcategory: CreateCategoryInput = {
				name: 'Subcategory',
				parentId: '1'
			};
			const mockResponse: CategoryOutput = { ...newSubcategory, id: '4' };
			(RestServices.post as jest.Mock).mockResolvedValue(mockResponse);

			const result = await categoryService.createCategory(newSubcategory);

			expect(RestServices.post).toHaveBeenCalledWith(
				'http://localhost:3000/categories',
				newSubcategory
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateCategory', () => {
		it('should update a category', async () => {
			const updateData: UpdateCategoryInput = {
				name: 'Updated Category'
			};
			const mockResponse: CategoryOutput = { ...updateData, id: '1' };
			(RestServices.put as jest.Mock).mockResolvedValue(mockResponse);

			const result = await categoryService.updateCategory('1', updateData);

			expect(RestServices.put).toHaveBeenCalledWith(
				'http://localhost:3000/categories/1',
				updateData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteCategory', () => {
		it('should delete a category', async () => {
			(RestServices.delete as jest.Mock).mockResolvedValue(undefined);

			await categoryService.deleteCategory('1');

			expect(RestServices.delete).toHaveBeenCalledWith('http://localhost:3000/categories/1');
		});
	});
});
