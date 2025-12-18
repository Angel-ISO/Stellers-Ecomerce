import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  HttpCode,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateUserAvatarUseCase } from '../../application/use-cases/users/update-user-avatar.usecase';
import { GetAllUsersUseCase } from '../../application/use-cases/users/get-all-users.usecase';
import { GetUserByIdUseCase } from '../../application/use-cases/users/get-user-by-id.usecase';
import { UpdateUserUseCase } from '../../application/use-cases/users/update-user.usecase';
import { DeleteUserUseCase } from '../../application/use-cases/users/delete-user.usecase';
import { BanUserUseCase } from '../../application/use-cases/users/ban-user.usecase';
import { UnbanUserUseCase } from '../../application/use-cases/users/unban-user.usecase';
import { GiveModeratorUseCase } from '../../application/use-cases/users/give-moderator.usecase';
import { RemoveModeratorUseCase } from '../../application/use-cases/users/remove-moderator.usecase';
import { UserOutput } from '../../application/dto/Users/user.output';
import { UpdateUserInput } from '../../application/dto/Users/update-user.input';
import { PaginatedUserOutput } from '../../application/dto/Users/paginated-user.output';
import { GetUsersInput } from '../../application/dto/Users/get-users.input';
import { createParams } from '../../shared/utils/params.utils';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly updateUserAvatarUseCase: UpdateUserAvatarUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly banUserUseCase: BanUserUseCase,
    private readonly unbanUserUseCase: UnbanUserUseCase,
    private readonly giveModeratorUseCase: GiveModeratorUseCase,
    private readonly removeModeratorUseCase: RemoveModeratorUseCase,
  ) {}

  @Post('avatar')
  @UseGuards(SupabaseAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Avatar image file',
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Image file (PNG, JPEG, WebP) - Max 2MB',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Avatar uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        avatarUrl: {
          type: 'string',
          example: 'https://project.supabase.co/storage/v1/object/public/avatars/user123/profile.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid file or validation error',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ): Promise<{ avatarUrl: string }> {
    const userId = req.user.id;
    const avatarUrl = await this.updateUserAvatarUseCase.execute(userId, file);
    return { avatarUrl };
  }

  @Get(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User retrieved successfully',
    type: UserOutput,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  async getUserById(@Param('id') userId: string): Promise<UserOutput | null> {
    return this.getUserByIdUseCase.execute(userId);
  }

  @Get()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('MODERATOR')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all users with pagination (moderator only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users retrieved successfully',
    type: PaginatedUserOutput,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async getAllUsers(@Query() query: GetUsersInput): Promise<PaginatedUserOutput> {
    const params = createParams({
      pageSize: query.pageSize,
      pageIndex: query.pageIndex,
      search: query.search,
    });

    const result = await this.getAllUsersUseCase.execute(params);

    return {
      registers: result.registers,
      total: result.total,
      pageIndex: result.pageIndex,
      pageSize: result.pageSize,
      search: result.search,
      totalPages: result.totalPages,
      hasPreviousPage: result.hasPreviousPage,
      hasNextPage: result.hasNextPage,
    };
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiOperation({ summary: 'Update user (own profile or moderator)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated successfully',
    type: UserOutput,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions - can only update own profile unless moderator',
  })
  async updateUser(
    @Param('id') userId: string,
    @Body() input: UpdateUserInput,
    @Req() req: any,
  ): Promise<UserOutput> {
    const currentUser = req.user;
    
    if (userId !== currentUser.id && !currentUser.isModerator) {
      throw new ForbiddenException('You can only update your own profile');
    }
    
    if (!currentUser.isModerator && (input.isModerator !== undefined || input.isBanned !== undefined)) {
      throw new ForbiddenException('Only moderators can modify user status');
    }
    
    return this.updateUserUseCase.execute(userId, input);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiOperation({ summary: 'Delete user (own account or moderator)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions - can only delete own account unless moderator',
  })
  async deleteUser(
    @Param('id') userId: string,
    @Req() req: any,
  ): Promise<void> {
    const currentUser = req.user;

    if (userId !== currentUser.id && !currentUser.isModerator) {
      throw new ForbiddenException('You can only delete your own account');
    }

    return this.deleteUserUseCase.execute(userId);
  }

  @Patch(':id/ban')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('MODERATOR')
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'User ID to ban' })
  @ApiOperation({ summary: 'Ban a user (moderator only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User banned successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions or cannot ban self/moderators',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async banUser(
    @Param('id') userId: string,
    @Req() req: any,
  ): Promise<void> {
    const moderatorId = req.user.id;
    return this.banUserUseCase.execute(userId, moderatorId);
  }

  @Patch(':id/unban')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('MODERATOR')
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'User ID to unban' })
  @ApiOperation({ summary: 'Unban a user (moderator only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User unbanned successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  @HttpCode(HttpStatus.OK)
  async unbanUser(@Param('id') userId: string): Promise<void> {
    return this.unbanUserUseCase.execute(userId);
  }

  @Patch(':id/givemod')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('MODERATOR')
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'User ID to give moderator status' })
  @ApiOperation({ summary: 'Give moderator status to a user (moderator only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Moderator status granted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions or invalid operation',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async giveModerator(@Param('id') userId: string, @Req() req: any): Promise<void> {
    const adminId = req.user.id;
    return this.giveModeratorUseCase.execute(userId, adminId);
  }

  @Patch(':id/unmod')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('MODERATOR')
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'User ID to remove moderator status' })
  @ApiOperation({ summary: 'Remove moderator status from a user (moderator only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Moderator status removed successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions or invalid operation',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.OK)
  async removeModerator(@Param('id') userId: string, @Req() req: any): Promise<void> {
    const adminId = req.user.id;
    return this.removeModeratorUseCase.execute(userId, adminId);
  }
}