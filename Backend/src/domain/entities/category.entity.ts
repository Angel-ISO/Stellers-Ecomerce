export class Category {
  constructor(
    public readonly id: string,
    public name: string,
    public readonly parentId: string | null = null,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Category name is required');
    }
    if (this.name.trim().length < 2) {
      throw new Error('Category name must have at least 2 characters');
    }
    if (this.name.trim().length > 100) {
      throw new Error('Category name must not exceed 100 characters');
    }
    if (this.parentId && this.parentId === this.id) {
      throw new Error('A category cannot be its own parent');
    }
  }

  update(updates: Partial<Pick<Category, 'name'>>): Category {
    return new Category(
      this.id,
      updates.name ?? this.name,
      this.parentId,
    );
  }

  isRoot(): boolean {
    return this.parentId === null;
  }
}
