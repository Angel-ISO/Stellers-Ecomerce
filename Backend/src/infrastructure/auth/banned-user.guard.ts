import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class BannedUserGuard implements CanActivate {
  // Endpoints that banned users can still access
  private readonly allowedEndpoints = [
    '/auth/login',           // Login endpoint
    '/auth/register',        // Register endpoint (though banned users shouldn't register)
    '/health',               // Health check
    '/api',                  // Swagger documentation
  ];

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const path = request.route?.path || request.url;

    // If no user (not authenticated), allow - let other guards handle auth
    if (!user) {
      return true;
    }

    // Check if user is banned
    if (user.isBanned) {
      // Allow access to specific endpoints even when banned
      if (this.allowedEndpoints.some(endpoint => path.includes(endpoint))) {
        return true;
      }

      throw new ForbiddenException('Your account has been banned. Please contact support for more information.');
    }

    return true;
  }
}