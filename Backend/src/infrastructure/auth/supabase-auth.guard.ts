import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { IUserProfileRepository } from '../../domain/repositories/user-profile.repository.interface';
import { JwtUtils } from '../../shared/utils/jwt.utils';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    @Inject('IUserProfileRepository') private readonly userRepository: IUserProfileRepository,
    private readonly jwtUtils: JwtUtils,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { req } = { req: request };

    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const token = this.extractTokenFromHeader(authHeader);
    if (!token) {
      throw new UnauthorizedException('Token is missing');
    }

    try {
      const payload = this.jwtUtils.verifyToken(token);
      if (!payload) {
        throw new UnauthorizedException('Invalid token');
      }

      if (!payload.sub) {
        throw new UnauthorizedException('Invalid token format: missing sub');
      }

      const userProfile = await this.userRepository.findById(payload.sub);
      if (!userProfile) {
        throw new UnauthorizedException('User not found');
      }

      req.user = {
        id: userProfile.id,
        userId: payload.sub,
        username: payload.sub,
        isModerator: payload.isModerator,
        isBanned: payload.isBanned,
        isSeller: payload.isSeller,
        avatarUrl: userProfile.avatarUrl,
        displayName: userProfile.displayName,
        bio: userProfile.bio,
        preferences: userProfile.preferences,
        createdAt: userProfile.createdAt,
        updatedAt: userProfile.updatedAt,
      };

      return true;
    } catch (error) {
      console.error('Authentication error:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(authHeader: string): string | null {
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}