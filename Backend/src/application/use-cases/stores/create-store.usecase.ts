import { Injectable, Inject } from '@nestjs/common';
import { IStoreRepository } from '../../../domain/repositories/store.repository.interface';
import { CreateStoreInput } from '../../dto/stores/create-store.input';
import { StoreOutput } from '../../dto/stores/store.output';
import { Store } from '../../../domain/entities/store.entity';

@Injectable()
export class CreateStoreUseCase {
  constructor(@Inject('IStoreRepository') private readonly storeRepository: IStoreRepository) {}

  async execute(userId: string, input: CreateStoreInput): Promise<StoreOutput> {
    const store = new Store(
      this.generateId(),
      userId,
      input.name,
      input.description ?? null,
      input.logoUrl ?? null,
      'PENDING',
      new Date(),
    );

    const saved = await this.storeRepository.save(store);
    return new StoreOutput(saved, []);
  }

  private generateId(): string {
    return Date.now().toString();
  }
}
