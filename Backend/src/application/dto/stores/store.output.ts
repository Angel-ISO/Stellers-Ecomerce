import { ApiProperty } from '@nestjs/swagger';
import { Store } from '../../../domain/entities/store.entity';
import { ProductOutput } from '../products/product.output';

export class StoreOutput {
  @ApiProperty({ description: 'Store identifier' })
  id: string;

  @ApiProperty({ description: 'Owner user id' })
  ownerId: string;

  @ApiProperty({ description: 'Store name' })
  name: string;

  @ApiProperty({ description: 'Store description', required: false })
  description?: string | null;

  @ApiProperty({ description: 'Logo URL', required: false })
  logoUrl?: string | null;

  @ApiProperty({ description: 'Store status' })
  status: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Active products' })
  products: ProductOutput[] = [];

  constructor(store: Store, products: any[] = []) {
    this.id = store.id;
    this.ownerId = store.ownerId;
    this.name = store.name;
    this.description = store.description ?? null;
    this.logoUrl = store.logoUrl ?? null;
    this.status = store.status;
    this.createdAt = store.createdAt;
    this.products = (products || []).map(p => new ProductOutput(p));
  }
}
