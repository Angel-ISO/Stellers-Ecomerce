export interface SellerRequest {
	id: string;
	userId: string;
	storeName: string;
	storeDescription: string;
	status: 'PENDING' | 'APPROVED' | 'REJECTED';
	createdAt: Date;
	updatedAt?: Date;
}

export interface CreateSellerRequestInput {
	storeName: string;
	storeDescription: string;
}

