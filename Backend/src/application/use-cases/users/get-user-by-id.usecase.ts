import { Injectable, Inject } from '@nestjs/common';
import { IUserProfileRepository } from '../../../domain/repositories/user-profile.repository.interface';
import { UserOutput } from '../../dto/Users/user.output';

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject('IUserProfileRepository') private readonly userRepository: IUserProfileRepository,
  ) {}

  async execute(userId: string): Promise<UserOutput | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      isModerator: user.isModerator,
      isBanned: user.isBanned,
      preferences: user.preferences,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}