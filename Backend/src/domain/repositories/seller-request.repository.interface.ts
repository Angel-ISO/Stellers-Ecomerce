import { SellerRequest } from '../entities/seller-request.entity';

export interface ISellerRequestRepository {
  create(request: SellerRequest): Promise<SellerRequest>;
  findById(id: string): Promise<SellerRequest | null>;
  findByUserId(userId: string): Promise<SellerRequest | null>;
  findAllPending(): Promise<SellerRequest[]>;
  update(id: string, updates: Partial<SellerRequest>): Promise<SellerRequest>;
  delete(id: string): Promise<void>;
}

