import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { UserProfile } from '../../../domain/entities/user-profile.entity';
import { IUserProfileRepository } from '../../../domain/repositories/user-profile.repository.interface';

@Injectable()
export class PrismaUserRepository implements IUserProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userProfile: {
    id: string;
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    isModerator?: boolean;
    isBanned?: boolean;
    preferences?: any;
  }): Promise<UserProfile> {
    const created = await this.prisma.userProfile.create({
      data: userProfile,
    });

    return this.mapToEntity(created);
  }

  async findById(id: string): Promise<UserProfile | null> {
    const userProfile = await this.prisma.userProfile.findUnique({
      where: { id },
    });

    return userProfile ? this.mapToEntity(userProfile) : null;
  }

  async update(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const updated = await this.prisma.userProfile.update({
      where: { id },
      data: updates,
    });

    return this.mapToEntity(updated);
  }

  async findAll(params: {
    pageSize: number;
    pageIndex: number;
    search?: string;
  }): Promise<{ users: UserProfile[]; total: number }> {
    const { pageSize, pageIndex, search } = params;
    const skip = (pageIndex - 1) * pageSize;

    const where = search
      ? {
          OR: [
            { displayName: { contains: search } },
            { id: search },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.userProfile.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.userProfile.count({ where }),
    ]);

    console.log('Repository findAll - search:', search, 'users found:', users.length, 'total:', total);

    return {
      users: users.map(user => this.mapToEntity(user)),
      total,
    };
  }

  private mapToEntity(prismaUserProfile: any): UserProfile {
    return new UserProfile(
      prismaUserProfile.id,
      prismaUserProfile.displayName,
      prismaUserProfile.bio,
      prismaUserProfile.avatarUrl,
      prismaUserProfile.isModerator,
      prismaUserProfile.isBanned,
      prismaUserProfile.isSeller,
      prismaUserProfile.preferences,
      prismaUserProfile.createdAt,
      prismaUserProfile.updatedAt,
    );
  }
}