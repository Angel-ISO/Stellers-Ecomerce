import { Injectable, Inject } from '@nestjs/common';
import { IUserProfileRepository } from '../../../domain/repositories/user-profile.repository.interface';
import { UpdateUserInput } from '../../dto/Users/update-user.input';
import { UserOutput } from '../../dto/Users/user.output';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject('IUserProfileRepository') private readonly userRepository: IUserProfileRepository,
  ) {}

  async execute(userId: string, input: UpdateUserInput): Promise<UserOutput> {
    const updatedUser = await this.userRepository.update(userId, input);

    return {
      id: updatedUser.id,
      displayName: updatedUser.displayName,
      bio: updatedUser.bio,
      avatarUrl: updatedUser.avatarUrl,
      isModerator: updatedUser.isModerator,
      isBanned: updatedUser.isBanned,
      preferences: updatedUser.preferences,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }
}