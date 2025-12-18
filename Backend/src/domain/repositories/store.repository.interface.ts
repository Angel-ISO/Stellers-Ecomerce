import { Store } from '../entities/store.entity';
import { Product } from '../entities/product.entity';

export interface IStoreRepository {
  save(store: Store): Promise<Store>;
  findById(id: string): Promise<Store | null>;
  findPublicById(id: string): Promise<{ store: Store; products: Product[] } | null>;
  findByOwner(ownerId: string): Promise<Store[]>;
  findByOwnerId(ownerId: string): Promise<Store | null>;
  deleteById(id: string): Promise<void>;
  verifyOwnership(storeId: string, userId: string): Promise<boolean>;
}
