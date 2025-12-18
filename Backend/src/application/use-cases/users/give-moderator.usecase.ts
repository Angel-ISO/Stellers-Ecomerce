import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { IUserProfileRepository } from '../../../domain/repositories/user-profile.repository.interface';

@Injectable()
export class GiveModeratorUseCase {
  constructor(
    @Inject('IUserProfileRepository') private readonly userRepository: IUserProfileRepository,
  ) {}

  async execute(userId: string, adminId: string): Promise<void> {
    // Verify the user to promote exists
    const userToPromote = await this.userRepository.findById(userId);
    if (!userToPromote) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    // Prevent promoting banned users
    if (userToPromote.isBanned) {
      throw new ForbiddenException('Cannot promote banned users to moderator');
    }

    // Check if user is already a moderator
    if (userToPromote.isModerator) {
      throw new ForbiddenException('User is already a moderator');
    }

    // Update the user to be a moderator
    await this.userRepository.update(userId, { isModerator: true });
  }
}