import { Injectable, Inject } from '@nestjs/common';
import { IStoreRepository } from '../../../domain/repositories/store.repository.interface';
import { StoreOutput } from '../../dto/stores/store.output';
import { StoreNotFoundError } from '../../../domain/errors/domain.errors';

@Injectable()
export class GetStoreByIdUseCase {
  constructor(@Inject('IStoreRepository') private readonly storeRepository: IStoreRepository) {}

  async execute(id: string): Promise<StoreOutput> {
    const result = await this.storeRepository.findPublicById(id);
    if (!result) {
      throw new StoreNotFoundError(id);
    }

    return new StoreOutput(result.store, result.products);
  }
}
