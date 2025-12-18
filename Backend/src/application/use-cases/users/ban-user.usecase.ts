import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { IUserProfileRepository } from '../../../domain/repositories/user-profile.repository.interface';

@Injectable()
export class BanUserUseCase {
  constructor(
    @Inject('IUserProfileRepository') private readonly userRepository: IUserProfileRepository,
  ) {}

  async execute(userId: string, moderatorId: string): Promise<void> {
    // Verify the user to ban exists
    const userToBan = await this.userRepository.findById(userId);
    if (!userToBan) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    // Prevent moderators from banning themselves
    if (userId === moderatorId) {
      throw new ForbiddenException('You cannot ban yourself');
    }

    // Prevent banning other moderators (unless you're a higher level admin, but for now keep it simple)
    if (userToBan.isModerator) {
      throw new ForbiddenException('You cannot ban other moderators');
    }

    // Update the user to be banned
    await this.userRepository.update(userId, { isBanned: true });
  }
}