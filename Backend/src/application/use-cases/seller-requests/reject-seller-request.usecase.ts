import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ISellerRequestRepository } from '../../../domain/repositories/seller-request.repository.interface';

@Injectable()
export class RejectSellerRequestUseCase {
  constructor(
    @Inject('ISellerRequestRepository')
    private readonly sellerRequestRepository: ISellerRequestRepository,
  ) {}

  async execute(requestId: string): Promise<void> {
    const request = await this.sellerRequestRepository.findById(requestId);

    if (!request) {
      throw new NotFoundException('Seller request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Only pending requests can be rejected');
    }

    request.reject();
    await this.sellerRequestRepository.update(requestId, { status: 'REJECTED' });

    await this.sellerRequestRepository.delete(requestId);
  }
}

