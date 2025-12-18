import { Injectable, Inject } from '@nestjs/common';
import { ISellerRequestRepository } from '../../../domain/repositories/seller-request.repository.interface';
import { SellerRequest } from '../../../domain/entities/seller-request.entity';

@Injectable()
export class GetMyRequestUseCase {
  constructor(
    @Inject('ISellerRequestRepository')
    private readonly sellerRequestRepository: ISellerRequestRepository,
  ) {}

  async execute(userId: string): Promise<SellerRequest | null> {
    return await this.sellerRequestRepository.findByUserId(userId);
  }
}

