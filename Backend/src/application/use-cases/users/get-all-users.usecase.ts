import { Injectable, Inject } from '@nestjs/common';
import { IUserProfileRepository } from '../../../domain/repositories/user-profile.repository.interface';
import { UserOutput } from '../../dto/Users/user.output';
import { PaginatedUserOutput } from '../../dto/Users/paginated-user.output';
import { createPager, PagerResult } from '../../../shared/utils/pager.utils';
import { createParams, ParamsResult } from '../../../shared/utils/params.utils';

@Injectable()
export class GetAllUsersUseCase {
  constructor(
    @Inject('IUserProfileRepository') private readonly userRepository: IUserProfileRepository,
  ) {}

  async execute(params: ParamsResult): Promise<PagerResult<UserOutput>> {
    const result = await this.userRepository.findAll({
      pageSize: params.pageSize,
      pageIndex: params.pageIndex,
      search: params.search,
    });

    console.log('UseCase execute - users found:', result.users.length, 'total:', result.total);

    return createPager<UserOutput>({
      registers: result.users.map(user => ({
        id: user.id,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        isModerator: user.isModerator,
        isBanned: user.isBanned,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      total: result.total,
      pageIndex: params.pageIndex,
      pageSize: params.pageSize,
      search: params.search,
    });
  }
}