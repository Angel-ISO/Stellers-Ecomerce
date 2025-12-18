import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ISellerRequestRepository } from '../../../domain/repositories/seller-request.repository.interface';
import { IUserProfileRepository } from '../../../domain/repositories/user-profile.repository.interface';
import { CreateStoreUseCase } from '../stores/create-store.usecase';
import { CreateStoreInput } from '../../dto/stores/create-store.input';

@Injectable()
export class ApproveSellerRequestUseCase {
  constructor(
    @Inject('ISellerRequestRepository')
    private readonly sellerRequestRepository: ISellerRequestRepository,
    @Inject('IUserProfileRepository')
    private readonly userRepository: IUserProfileRepository,
    private readonly createStoreUseCase: CreateStoreUseCase,
  ) {}

  async execute(requestId: string): Promise<void> {
    const request = await this.sellerRequestRepository.findById(requestId);

    if (!request) {
      throw new NotFoundException('Seller request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Only pending requests can be approved');
    }

    const user = await this.userRepository.findById(request.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isSeller) {
      throw new BadRequestException('User is already a seller');
    }

    request.approve();
    await this.sellerRequestRepository.update(requestId, { status: 'APPROVED' });

    const updatedUser = user.update({ isSeller: true });
    await this.userRepository.update(request.userId, updatedUser);

    const storeInput = new CreateStoreInput();
    storeInput.name = request.storeName;
    storeInput.description = request.storeDescription;
    storeInput.logoUrl = null;

    await this.createStoreUseCase.execute(request.userId, storeInput);

    await this.sellerRequestRepository.delete(requestId);
  }
}

