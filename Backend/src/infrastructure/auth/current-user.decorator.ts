import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * User interface extracted from JWT token.
 */
export interface CurrentUserData {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  isVerified: boolean;
  isSeller: boolean;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Custom decorator to extract the current authenticated user from the request.
 * Usage: @CurrentUser() user: CurrentUserData
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserData => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
