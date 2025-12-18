import {
  Controller,
  Post,
  UseGuards,
  Body,
  Param,
  Get,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  Req,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { CreateStoreUseCase } from '../../application/use-cases/stores/create-store.usecase';
import { CreateStoreInput } from '../../application/dto/stores/create-store.input';
import { GetStoreByIdUseCase } from '../../application/use-cases/stores/get-store-by-id.usecase';
import { UpdateStoreUseCase } from '../../application/use-cases/stores/update-store.usecase';
import { PrismaService } from '../config/prisma.service';
import { IStoreRepository } from '../../domain/repositories/store.repository.interface';

@ApiTags('stores')
@Controller('stores')
export class StoresController {
  constructor(
    private readonly createStoreUseCase: CreateStoreUseCase,
    private readonly getStoreByIdUseCase: GetStoreByIdUseCase,
    private readonly updateStoreUseCase: UpdateStoreUseCase,
    private readonly prisma: PrismaService,
    @Inject('IStoreRepository') private readonly storeRepository: IStoreRepository,
  ) {}

  @Post()
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new store' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Store created successfully' })
  @HttpCode(HttpStatus.CREATED)
  async createStore(@Req() req: any, @Body() input: CreateStoreInput): Promise<any> {
    // SupabaseAuthGuard attaches user to req.user
    const userId = req.user?.id ?? 'unknown-user';
    const store = await this.createStoreUseCase.execute(userId, input);
    return store;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get public store info by id' })
  @ApiParam({ name: 'id', description: 'Store id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Store retrieved successfully' })
  async getStore(@Param('id') id: string): Promise<any> {
    return this.getStoreByIdUseCase.execute(id);
  }

  @Put(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a store (owner or admin only)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Store updated' })
  async updateStore(@Req() req: any, @Param('id') id: string, @Body() input: Partial<CreateStoreInput>): Promise<any> {
    const callerId = req.user?.id;
    const callerRoles: string[] = req.user?.roles || [];

    const existing = await this.storeRepository.findById(id);
    if (!existing) {
      return this.getStoreByIdUseCase.execute(id); // will throw StoreNotFoundError
    }

    const isOwner = existing.ownerId === callerId;
    const isAdmin = callerRoles.includes('ADMIN');
    if (!isOwner && !isAdmin) {
      throw { status: HttpStatus.FORBIDDEN, message: 'Only owner or admin can update the store' };
    }

    return this.updateStoreUseCase.execute(id, input);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a store (owner or admin only)' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Store deleted' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteStore(@Req() req: any, @Param('id') id: string): Promise<void> {
    const callerId = req.user?.id;
    const callerRoles: string[] = req.user?.roles || [];

    const existing = await this.storeRepository.findById(id);
    if (!existing) {
      throw { status: HttpStatus.NOT_FOUND, message: 'Store not found' };
    }

    const isOwner = existing.ownerId === callerId;
    const isAdmin = callerRoles.includes('ADMIN');
    if (!isOwner && !isAdmin) {
      throw { status: HttpStatus.FORBIDDEN, message: 'Only owner or admin can delete the store' };
    }

    // Logical delete: disable products and block store
    await this.storeRepository.deleteById(id);
  }
}