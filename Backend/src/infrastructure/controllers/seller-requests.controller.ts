import {
  Controller,
  Post,
  Get,
  UseGuards,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateSellerRequestUseCase } from '../../application/use-cases/seller-requests/create-seller-request.usecase';
import { GetAllPendingRequestsUseCase } from '../../application/use-cases/seller-requests/get-all-pending-requests.usecase';
import { GetMyRequestUseCase } from '../../application/use-cases/seller-requests/get-my-request.usecase';
import { ApproveSellerRequestUseCase } from '../../application/use-cases/seller-requests/approve-seller-request.usecase';
import { RejectSellerRequestUseCase } from '../../application/use-cases/seller-requests/reject-seller-request.usecase';
import { CreateSellerRequestInput } from '../../application/dto/seller-requests/create-seller-request.input';
import { SellerRequestOutput } from '../../application/dto/seller-requests/seller-request.output';

@ApiTags('seller-requests')
@Controller('seller-requests')
export class SellerRequestsController {
  constructor(
    private readonly createSellerRequestUseCase: CreateSellerRequestUseCase,
    private readonly getAllPendingRequestsUseCase: GetAllPendingRequestsUseCase,
    private readonly getMyRequestUseCase: GetMyRequestUseCase,
    private readonly approveSellerRequestUseCase: ApproveSellerRequestUseCase,
    private readonly rejectSellerRequestUseCase: RejectSellerRequestUseCase,
  ) {}

  @Post()
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a seller request' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Seller request created successfully' })
  @HttpCode(HttpStatus.CREATED)
  async createRequest(@Req() req: any, @Body() input: CreateSellerRequestInput): Promise<any> {
    const userId = req.user?.id;
    const request = await this.createSellerRequestUseCase.execute(userId, input);
    return new SellerRequestOutput(
      request.id,
      request.userId,
      request.storeName,
      request.storeDescription,
      request.status,
      request.createdAt,
      request.updatedAt,
    );
  }

  @Get('my-request')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my seller request' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User seller request' })
  async getMyRequest(@Req() req: any): Promise<any> {
    const userId = req.user?.id;
    const request = await this.getMyRequestUseCase.execute(userId);
    if (!request) {
      return null;
    }
    return new SellerRequestOutput(
      request.id,
      request.userId,
      request.storeName,
      request.storeDescription,
      request.status,
      request.createdAt,
      request.updatedAt,
    );
  }

  @Get('pending')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('MODERATOR')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all pending seller requests (Moderator only)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of pending requests' })
  async getPendingRequests(): Promise<any> {
    const requests = await this.getAllPendingRequestsUseCase.execute();
    return requests.map(
      (request) =>
        new SellerRequestOutput(
          request.id,
          request.userId,
          request.storeName,
          request.storeDescription,
          request.status,
          request.createdAt,
          request.updatedAt,
        ),
    );
  }

  @Post(':id/approve')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('MODERATOR')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Approve a seller request (Moderator only)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Request approved successfully' })
  @HttpCode(HttpStatus.OK)
  async approveRequest(@Param('id') id: string): Promise<any> {
    await this.approveSellerRequestUseCase.execute(id);
    return { message: 'Seller request approved successfully' };
  }

  @Post(':id/reject')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('MODERATOR')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Reject a seller request (Moderator only)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Request rejected successfully' })
  @HttpCode(HttpStatus.OK)
  async rejectRequest(@Param('id') id: string): Promise<any> {
    await this.rejectSellerRequestUseCase.execute(id);
    return { message: 'Seller request rejected successfully' };
  }
}

