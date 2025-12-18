import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { IUserProfileRepository } from '../../../domain/repositories/user-profile.repository.interface';

@Injectable()
export class RemoveModeratorUseCase {
  constructor(
    @Inject('IUserProfileRepository') private readonly userRepository: IUserProfileRepository,
  ) {}

  async execute(userId: string, adminId: string): Promise<void> {
    // Verify the user to demote exists
    const userToDemote = await this.userRepository.findById(userId);
    if (!userToDemote) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    // Check if user is actually a moderator
    if (!userToDemote.isModerator) {
      throw new ForbiddenException('User is not a moderator');
    }

    // Prevent demoting yourself (for safety)
    if (userId === adminId) {
      throw new ForbiddenException('You cannot remove your own moderator status');
    }

    // Update the user to remove moderator status
    await this.userRepository.update(userId, { isModerator: false });
  }
}