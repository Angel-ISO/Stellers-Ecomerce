import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CreateProductUseCase } from './create-product.usecase';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { IStoreRepository } from '../../../domain/repositories/store.repository.interface';
import { StoragePort } from '../../ports/out/storage.port';
import { Store } from '../../../domain/entities/store.entity';
import { Product } from '../../../domain/entities/product.entity';
import { StoreNotFoundError, UnauthorizedStoreAccessError } from '../../../domain/errors/domain.errors';

describe('CreateProductUseCase', () => {
    let useCase: CreateProductUseCase;
    let productRepository: jest.Mocked<IProductRepository>;
    let storeRepository: jest.Mocked<IStoreRepository>;
    let storagePort: jest.Mocked<StoragePort>;

    beforeEach(async () => {
        const mockProductRepository = {
            save: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            restore: jest.fn(),
            findAllWithFilters: jest.fn(),
            findByStoreId: jest.fn(),
            count: jest.fn(),
        };

        const mockStoreRepository = {
            findById: jest.fn(),
            save: jest.fn(),
            findAll: jest.fn(),
            findByOwnerId: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const mockStoragePort = {
            uploadFile: jest.fn(),
            deleteFile: jest.fn(),
            getFileUrl: jest.fn(),
            predictUrl: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateProductUseCase,
                {
                    provide: 'IProductRepository',
                    useValue: mockProductRepository,
                },
                {
                    provide: 'IStoreRepository',
                    useValue: mockStoreRepository,
                },
                {
                    provide: 'StoragePort',
                    useValue: mockStoragePort,
                },
            ],
        }).compile();

        useCase = module.get<CreateProductUseCase>(CreateProductUseCase);
        productRepository = module.get('IProductRepository');
        storeRepository = module.get('IStoreRepository');
        storagePort = module.get('StoragePort');
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        const mockStore = new Store(
            'store-id',
            'owner-id',
            'Test Store',
            'Store description',
            'https://example.com/logo.jpg',
            'APPROVED',
            new Date(),
        );

        const createProductInput = {
            storeId: 'store-id',
            name: 'Test Product',
            description: 'Product description',
            price: 99.99,
            stock: 10,
            categoryId: 'category-id',
            isActive: true,
        };

        it('should create a product successfully without images', async () => {
            // Arrange
            storeRepository.findById.mockResolvedValue(mockStore);
            productRepository.save.mockResolvedValue(
                new Product(
                    'product-id',
                    'store-id',
                    'Test Product',
                    'Product description',
                    99.99,
                    10,
                    new Date(),
                    new Date(),
                    'category-id',
                    [],
                    true,
                    null,
                ),
            );

            // Act
            const result = await useCase.execute(createProductInput, 'owner-id');

            // Assert
            expect(result).toBeDefined();
            expect(result.name).toBe('Test Product');
            expect(result.price).toBe(99.99);
            expect(storeRepository.findById).toHaveBeenCalledWith('store-id');
            expect(productRepository.save).toHaveBeenCalled();
        });

        it('should throw StoreNotFoundError when store does not exist', async () => {
            // Arrange
            storeRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(
                useCase.execute(createProductInput, 'owner-id'),
            ).rejects.toThrow(StoreNotFoundError);
        });

        it('should throw UnauthorizedStoreAccessError when user does not own the store', async () => {
            // Arrange
            storeRepository.findById.mockResolvedValue(mockStore);

            // Act & Assert
            await expect(
                useCase.execute(createProductInput, 'different-owner-id'),
            ).rejects.toThrow(UnauthorizedStoreAccessError);
        });

        it('should throw BadRequestException when more than 5 images are provided', async () => {
            // Arrange
            storeRepository.findById.mockResolvedValue(mockStore);
            const mockFiles = Array(6).fill({
                buffer: Buffer.from('test'),
                mimetype: 'image/jpeg',
                originalname: 'test.jpg',
                size: 1000,
            }) as Express.Multer.File[];

            // Act & Assert
            await expect(
                useCase.execute(createProductInput, 'owner-id', mockFiles),
            ).rejects.toThrow(BadRequestException);
        });

        it('should create product with images successfully', async () => {
            // Arrange
            storeRepository.findById.mockResolvedValue(mockStore);
            storagePort.predictUrl.mockReturnValue('https://storage.example.com/image.jpg');
            storagePort.uploadFile.mockResolvedValue(undefined);

            const mockProduct = new Product(
                'product-id',
                'store-id',
                'Test Product',
                'Product description',
                99.99,
                10,
                new Date(),
                new Date(),
                'category-id',
                ['https://storage.example.com/image.jpg'],
                true,
                null,
            );

            productRepository.save.mockResolvedValue(mockProduct);

            const mockFiles = [{
                buffer: Buffer.from('test'),
                mimetype: 'image/jpeg',
                originalname: 'test.jpg',
                size: 1000,
            }] as Express.Multer.File[];

            // Act
            const result = await useCase.execute(createProductInput, 'owner-id', mockFiles);

            // Assert
            expect(result).toBeDefined();
            expect(storagePort.uploadFile).toHaveBeenCalled();
            expect(productRepository.save).toHaveBeenCalled();
        });
    });
});
