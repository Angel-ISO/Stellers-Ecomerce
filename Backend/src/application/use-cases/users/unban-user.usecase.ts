import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUserProfileRepository } from '../../../domain/repositories/user-profile.repository.interface';

@Injectable()
export class UnbanUserUseCase {
  constructor(
    @Inject('IUserProfileRepository') private readonly userRepository: IUserProfileRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    // Verify the user to unban exists
    const userToUnban = await this.userRepository.findById(userId);
    if (!userToUnban) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    // Update the user to be unbanned
    await this.userRepository.update(userId, { isBanned: false });
  }
}