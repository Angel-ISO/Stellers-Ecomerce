import { Injectable, Inject } from '@nestjs/common';
import { IUserProfileRepository } from '../../../domain/repositories/user-profile.repository.interface';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject('IUserProfileRepository') private readonly userRepository: IUserProfileRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    // Note: This would need to be implemented in the repository
    // We'd need to handle cascading deletes or soft deletes
    // For now, this is a placeholder
    throw new Error('DeleteUserUseCase not implemented - needs repository method and cascade handling');
  }
}