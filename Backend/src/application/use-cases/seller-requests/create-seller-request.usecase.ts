import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ISellerRequestRepository } from '../../../domain/repositories/seller-request.repository.interface';
import { IUserProfileRepository } from '../../../domain/repositories/user-profile.repository.interface';
import { SellerRequest } from '../../../domain/entities/seller-request.entity';
import { CreateSellerRequestInput } from '../../dto/seller-requests/create-seller-request.input';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateSellerRequestUseCase {
  constructor(
    @Inject('ISellerRequestRepository')
    private readonly sellerRequestRepository: ISellerRequestRepository,
    @Inject('IUserProfileRepository')
    private readonly userRepository: IUserProfileRepository,
  ) {}

  async execute(userId: string, input: CreateSellerRequestInput): Promise<SellerRequest> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isSeller) {
      throw new BadRequestException('User is already a seller');
    }

    const existingRequest = await this.sellerRequestRepository.findByUserId(userId);

    if (existingRequest && existingRequest.status === 'PENDING') {
      throw new BadRequestException('User already has a pending seller request');
    }

    const request = new SellerRequest(
      uuidv4(),
      userId,
      input.storeName,
      input.storeDescription,
      'PENDING',
      new Date(),
      new Date(),
    );

    return await this.sellerRequestRepository.create(request);
  }
}

