import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { IUserProfileRepository } from '../../../domain/repositories/user-profile.repository.interface';
import { LoginInput } from '../../dto/auth/login.input';
import { AuthPayload } from '../../dto/auth/auth-payload.output';
import { JwtUtils } from '../../../shared/utils/jwt.utils';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('SupabaseClient') private readonly supabase: SupabaseClient,
    @Inject('IUserProfileRepository') private readonly userRepository: IUserProfileRepository,
    private readonly jwtUtils: JwtUtils,
  ) {}

  async execute(input: LoginInput): Promise<AuthPayload> {
    try {
      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (authError) {
        throw new Error(`Authentication failed: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Login failed - no user data returned');
      }

      const userProfile = await this.userRepository.findById(authData.user.id);
      if (!userProfile) {
        throw new Error('User profile not found - please contact support');
      }

      const token = this.jwtUtils.generateToken({
        sub: userProfile.id,
        isModerator: userProfile.isModerator,
        isBanned: userProfile.isBanned,
        isSeller: userProfile.isSeller,
      });

      return {
        token,
        user: {
          id: userProfile.id,
          name: userProfile.displayName || authData.user.email || 'User',
          email: input.email,
          avatarUrl: userProfile.avatarUrl,
          isVerified: authData.user.email_confirmed_at ? true : false,
          isModerator: userProfile.isModerator,
          isBanned: userProfile.isBanned,
          isSeller: userProfile.isSeller,
          createdAt: userProfile.createdAt,
          updatedAt: userProfile.updatedAt,
        },
      };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }
}