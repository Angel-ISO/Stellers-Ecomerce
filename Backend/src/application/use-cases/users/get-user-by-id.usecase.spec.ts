import { Test, TestingModule } from '@nestjs/testing';
import { GetUserByIdUseCase } from './get-user-by-id.usecase';
import { IUserProfileRepository } from '../../../domain/repositories/user-profile.repository.interface';
import { UserProfile } from '../../../domain/entities/user-profile.entity';

describe('GetUserByIdUseCase', () => {
  let useCase: GetUserByIdUseCase;
  let userRepository: jest.Mocked<IUserProfileRepository>;

  beforeEach(async () => {
    // Create mock repository
    const mockUserRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserByIdUseCase,
        {
          provide: 'IUserProfileRepository',
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetUserByIdUseCase>(GetUserByIdUseCase);
    userRepository = module.get('IUserProfileRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return user output when user exists', async () => {
      // Arrange
      const userId = 'test-user-id';
      const mockUser = new UserProfile(
        userId,
        'Test User',
        'Test bio',
        'https://example.com/avatar.jpg',
        false,
        false,
        false,
        { theme: 'dark' },
        new Date('2024-01-01'),
        new Date('2024-01-02'),
      );

      userRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe(userId);
      expect(result?.displayName).toBe('Test User');
      expect(result?.bio).toBe('Test bio');
      expect(result?.avatarUrl).toBe('https://example.com/avatar.jpg');
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should return null when user does not exist', async () => {
      // Arrange
      const userId = 'non-existent-user-id';
      userRepository.findById.mockResolvedValue(null);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(result).toBeNull();
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should map user entity to output correctly', async () => {
      // Arrange
      const userId = 'test-user-id';
      const mockUser = new UserProfile(
        userId,
        'John Doe',
        'Software Developer',
        'https://example.com/john.jpg',
        true, // isModerator
        false, // isBanned
        true, // isSeller
        { language: 'en', notifications: true },
        new Date('2024-01-01'),
        new Date('2024-01-15'),
      );

      userRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(result).toEqual({
        id: userId,
        displayName: 'John Doe',
        bio: 'Software Developer',
        avatarUrl: 'https://example.com/john.jpg',
        isModerator: true,
        isBanned: false,
        preferences: { language: 'en', notifications: true },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      });
    });
  });
});
