import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';


@Injectable()
export class SupabaseJwtService {
  private jwks: ReturnType<typeof createRemoteJWKSet>;

  constructor(private configService: ConfigService) {
    const jwksUri = this.configService.get<string>('SUPABASE_JWKS_URI');
    this.jwks = createRemoteJWKSet(new URL(jwksUri));
  }


  async verifyToken(token: string): Promise<JWTPayload> {
    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: `${this.configService.get<string>('SUPABASE_URL')}/auth/v1`,
        audience: this.configService.get<string>('SUPABASE_ANON_KEY'),
      });

      if (!payload.sub) {
        throw new Error('Token missing subject claim');
      }

      if (!payload.email) {
        throw new Error('Token missing email claim');
      }

      return payload;
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

 
  extractUserClaims(payload: JWTPayload): {
    providerId: string;
    email: string;
    emailVerified: boolean;
    name?: string;
    picture?: string;
    provider: string;
  } {
    return {
      providerId: payload.sub as string,
      email: payload.email as string,
      emailVerified: payload.email_verified as boolean || false,
      name: payload.name as string,
      picture: payload.picture as string,
      provider: this.extractProvider(payload.iss as string),
    };
  }

  private extractProvider(issuer: string): string {
    return 'google';
  }
}