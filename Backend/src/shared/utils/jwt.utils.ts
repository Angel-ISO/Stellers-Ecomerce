import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/**
 * JWT utilities for internal token management.
 */
@Injectable()
export class JwtUtils {
  constructor(private readonly jwtService: JwtService) {}

 
  generateToken(payload: { sub: string; isModerator?: boolean; isBanned?: boolean; isSeller?: boolean }): string {
    return this.jwtService.sign(payload);
  }

 
  verifyToken(token: string): any {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      return null;
    }
  }
}