/**
 * Store domain entity representing a seller's store.
 */
export class Store {
  constructor(
    public readonly id: string,
    public readonly ownerId: string,
    public name: string,
    public description: string | null,
    public logoUrl: string | null,
    public status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED' = 'PENDING',
    public readonly createdAt: Date = new Date(),
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Store name is required');
    }
    if (this.name.trim().length < 3) {
      throw new Error('Store name must have at least 3 characters');
    }
    if (this.logoUrl && this.logoUrl.trim().length > 0) {
      try {
        // Basic URL validation
        // eslint-disable-next-line no-new
        new URL(this.logoUrl);
      } catch (err) {
        throw new Error('logoUrl must be a valid URL');
      }
    }
  }

  update(updates: Partial<Pick<Store, 'name' | 'description' | 'logoUrl' | 'status'>>): Store {
    return new Store(
      this.id,
      this.ownerId,
      updates.name ?? this.name,
      updates.description ?? this.description,
      updates.logoUrl ?? this.logoUrl,
      updates.status ?? this.status,
      this.createdAt,
    );
  }
}
