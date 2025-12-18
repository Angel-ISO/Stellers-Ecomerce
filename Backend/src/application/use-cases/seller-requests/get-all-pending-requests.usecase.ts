import { Injectable, Inject } from '@nestjs/common';
import { ISellerRequestRepository } from '../../../domain/repositories/seller-request.repository.interface';
import { SellerRequest } from '../../../domain/entities/seller-request.entity';

@Injectable()
export class GetAllPendingRequestsUseCase {
  constructor(
    @Inject('ISellerRequestRepository')
    private readonly sellerRequestRepository: ISellerRequestRepository,
  ) {}

  async execute(): Promise<SellerRequest[]> {
    return await this.sellerRequestRepository.findAllPending();
  }
}

