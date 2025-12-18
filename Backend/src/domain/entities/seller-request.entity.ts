export class SellerRequest {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public storeName: string,
    public storeDescription: string,
    public status: 'PENDING' | 'APPROVED' | 'REJECTED',
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.storeName || this.storeName.trim().length === 0) {
      throw new Error('Store name cannot be empty');
    }

    if (this.storeName.length < 2 || this.storeName.length > 100) {
      throw new Error('Store name must be between 2 and 100 characters');
    }

    if (!this.storeDescription || this.storeDescription.trim().length === 0) {
      throw new Error('Store description cannot be empty');
    }

    if (this.storeDescription.length < 10 || this.storeDescription.length > 500) {
      throw new Error('Store description must be between 10 and 500 characters');
    }
  }

  approve(): void {
    if (this.status !== 'PENDING') {
      throw new Error('Only pending requests can be approved');
    }
    this.status = 'APPROVED';
    this.updatedAt = new Date();
  }

  reject(): void {
    if (this.status !== 'PENDING') {
      throw new Error('Only pending requests can be rejected');
    }
    this.status = 'REJECTED';
    this.updatedAt = new Date();
  }
}

