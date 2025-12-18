
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}


export class ProductNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Product with id ${id} not found`);
    this.name = 'ProductNotFoundError';
  }
}


export class ProductValidationError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'ProductValidationError';
  }
}

export class StoreNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Store with id ${id} not found`);
    this.name = 'StoreNotFoundError';
  }
}

export class StoreValidationError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'StoreValidationError';
  }
}

export class UnauthorizedStoreAccessError extends DomainError {
  constructor(userId: string, storeId: string) {
    super(`User ${userId} is not authorized to access store ${storeId}`);
    this.name = 'UnauthorizedStoreAccessError';
  }
}

export class ProductAlreadyDeletedError extends DomainError {
  constructor(productId: string) {
    super(`Product ${productId} is already deleted`);
    this.name = 'ProductAlreadyDeletedError';
  }
}

export class ProductNotDeletedError extends DomainError {
  constructor(productId: string) {
    super(`Product ${productId} is not deleted and cannot be restored`);
    this.name = 'ProductNotDeletedError';
  }
}

export class UnauthorizedProductAccessError extends DomainError {
  constructor(userId: string, productId: string) {
    super(`User ${userId} is not authorized to access product ${productId}`);
    this.name = 'UnauthorizedProductAccessError';
  }
}

export class CategoryNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Category with id ${id} not found`);
    this.name = 'CategoryNotFoundError';
  }
}

export class CategoryValidationError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'CategoryValidationError';
  }
}

export class CategoryHasChildrenError extends DomainError {
  constructor(categoryId: string) {
    super(`Category ${categoryId} has children and cannot be deleted`);
    this.name = 'CategoryHasChildrenError';
  }
}