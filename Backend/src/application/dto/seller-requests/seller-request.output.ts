export class SellerRequestOutput {
  id: string;
  userId: string;
  storeName: string;
  storeDescription: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt?: Date;

  constructor(
    id: string,
    userId: string,
    storeName: string,
    storeDescription: string,
    status: 'PENDING' | 'APPROVED' | 'REJECTED',
    createdAt: Date,
    updatedAt?: Date,
  ) {
    this.id = id;
    this.userId = userId;
    this.storeName = storeName;
    this.storeDescription = storeDescription;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

