import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { IUserProfileRepository } from '../../../domain/repositories/user-profile.repository.interface';
import { RegisterInput } from '../../dto/auth/register.input';
import { AuthPayload } from '../../dto/auth/auth-payload.output';
import { JwtUtils } from '../../../shared/utils/jwt.utils';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject('SupabaseClient') private readonly supabase: SupabaseClient,
    @Inject('IUserProfileRepository') private readonly userRepository: IUserProfileRepository,
    private readonly jwtUtils: JwtUtils,
  ) {}

  async execute(input: RegisterInput): Promise<AuthPayload> {
    try {
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            display_name: input.displayName,
          },
        },
      });

      if (authError) {
        throw new Error(`Supabase auth error: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('User creation failed');
      }

      const userProfile = await this.userRepository.create({
        id: authData.user.id,
        displayName: input.displayName,
        bio: input.bio,
        avatarUrl: null,
        isModerator: false,
        isBanned: false,
        preferences: null,
      });

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
          name: userProfile.displayName || input.displayName,
          email: input.email,
          avatarUrl: userProfile.avatarUrl,
          isVerified: false,
          isModerator: userProfile.isModerator,
          isBanned: userProfile.isBanned,
          isSeller: userProfile.isSeller,
          createdAt: userProfile.createdAt,
          updatedAt: userProfile.updatedAt,
        },
      };
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }
}