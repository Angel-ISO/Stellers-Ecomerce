import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { IUserProfileRepository } from '../../domain/repositories/user-profile.repository.interface';
import { JwtUtils } from '../../shared/utils/jwt.utils';
import { UserProfile } from '../../domain/entities/user-profile.entity';

describe('SupabaseAuthGuard', () => {
    let guard: SupabaseAuthGuard;
    let userRepository: any;
    let jwtUtils: any;

    beforeEach(async () => {
        const mockUserRepository = {
            findById: jest.fn(),
            findAll: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const mockJwtUtils = {
            verifyToken: jest.fn(),
            generateToken: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SupabaseAuthGuard,
                {
                    provide: 'IUserProfileRepository',
                    useValue: mockUserRepository,
                },
                {
                    provide: JwtUtils,
                    useValue: mockJwtUtils,
                },
            ],
        }).compile();

        guard = module.get<SupabaseAuthGuard>(SupabaseAuthGuard);
        userRepository = mockUserRepository;
        jwtUtils = mockJwtUtils;
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    describe('canActivate', () => {
        let mockExecutionContext: ExecutionContext;
        let mockRequest: any;

        beforeEach(() => {
            mockRequest = {
                headers: {},
                user: null,
            };

            mockExecutionContext = {
                switchToHttp: jest.fn().mockReturnValue({
                    getRequest: jest.fn().mockReturnValue(mockRequest),
                }),
            } as any;
        });

        it('should throw UnauthorizedException when authorization header is missing', async () => {
            await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
                UnauthorizedException,
            );
        });

        it('should throw UnauthorizedException when token is invalid', async () => {
            mockRequest.headers.authorization = 'Bearer invalid-token';
            jwtUtils.verifyToken.mockReturnValue(null);

            await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
                UnauthorizedException,
            );
        });

        it('should return true when authentication succeeds', async () => {
            const mockUser = new UserProfile(
                'user-id',
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

            mockRequest.headers.authorization = 'Bearer valid-token';
            jwtUtils.verifyToken.mockReturnValue({
                sub: 'user-id',
                isModerator: false,
                isBanned: false,
                isSeller: false,
            });
            userRepository.findById.mockResolvedValue(mockUser);

            const result = await guard.canActivate(mockExecutionContext);

            expect(result).toBe(true);
            expect(mockRequest.user).toBeDefined();
            expect(mockRequest.user.id).toBe('user-id');
        });
    });
});
