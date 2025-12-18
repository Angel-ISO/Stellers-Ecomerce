import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for roles.
 */
export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for a route.
 * Usage: @Roles('MODERATOR', 'SELLER', 'ADMIN')
 * Note: 'MODERATOR' checks the isModerator field, others check roles array.
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
