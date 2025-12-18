import { Injectable, Inject } from '@nestjs/common';
import { IStoreRepository } from '../../../domain/repositories/store.repository.interface';
import { Store } from '../../../domain/entities/store.entity';
import { CreateStoreInput } from '../../dto/stores/create-store.input';
import { StoreNotFoundError } from '../../../domain/errors/domain.errors';

@Injectable()
export class UpdateStoreUseCase {
  constructor(@Inject('IStoreRepository') private readonly storeRepository: IStoreRepository) {}

  async execute(id: string, input: Partial<CreateStoreInput>): Promise<Store> {
    const existing = await this.storeRepository.findById(id);
    if (!existing) {
      throw new StoreNotFoundError(id);
    }

    const updated = existing.update({
      name: input.name,
      description: input.description ?? existing.description ?? null,
      logoUrl: input.logoUrl ?? existing.logoUrl ?? null,
    });

    const saved = await this.storeRepository.save(updated);
    return saved;
  }
}
