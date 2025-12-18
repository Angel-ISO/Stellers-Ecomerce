import { Injectable, Inject } from '@nestjs/common';
import { IUserProfileRepository } from '../../../domain/repositories/user-profile.repository.interface';
import { JwtUtils } from '../../../shared/utils/jwt.utils';

@Injectable()
export class LoginWithSupabaseUseCase {
  constructor(
    @Inject('IUserProfileRepository') private readonly userRepository: IUserProfileRepository,
    private readonly jwtUtils: JwtUtils,
  ) {}

  async execute(supabaseAccessToken: string): Promise<{
    user: any;
    token: string;
    supabaseAccessToken: string;
  }> {
    let claims: any;
    try {
      const payload = JSON.parse(Buffer.from(supabaseAccessToken.split('.')[1], 'base64').toString());
      claims = {
        sub: payload.sub,
        email: payload.email,
        name: payload.user_metadata?.full_name || payload.user_metadata?.name,
        avatarUrl: payload.user_metadata?.avatar_url || payload.user_metadata?.picture,
        emailVerified: payload.user_metadata?.email_verified || true,
      };
    } catch (error) {
      throw new Error(`Invalid token format: ${error.message}`);
    }

    let userProfile = await this.userRepository.findById(claims.sub);

    if (!userProfile) {
      userProfile = await this.userRepository.create({
        id: claims.sub,
        displayName: claims.name,
        avatarUrl: claims.avatarUrl,
      });
    }

    const internalToken = this.jwtUtils.generateToken({
      sub: userProfile.id,
      isModerator: userProfile.isModerator,
      isBanned: userProfile.isBanned,
      isSeller: userProfile.isSeller,
    });

    return {
      user: {
        id: userProfile.id,
        name: claims.name,
        email: claims.email,
        avatarUrl: userProfile.avatarUrl,
        isVerified: claims.emailVerified,
        isModerator: userProfile.isModerator,
        isBanned: userProfile.isBanned,
        isSeller: userProfile.isSeller,
        createdAt: userProfile.createdAt,
        updatedAt: userProfile.updatedAt,
      },
      token: internalToken,
      supabaseAccessToken,
    };
  }
}