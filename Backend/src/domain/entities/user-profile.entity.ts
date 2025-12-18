/**
 * UserProfile domain entity representing a user's profile in the e-commerce system.
 * Contains business rules and validation logic for user profiles.
 */
export class UserProfile {
  constructor(
    public readonly id: string,
    public displayName: string | null,
    public bio: string | null,
    public avatarUrl: string | null,
    public isModerator: boolean,
    public isBanned: boolean,
    public isSeller: boolean,
    public preferences: any | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {
    this.validate();
  }

  
  private validate(): void {
    if (this.displayName && this.displayName.trim().length === 0) {
      throw new Error('Display name cannot be empty if provided');
    }

    if (this.bio && this.bio.length > 500) {
      throw new Error('Bio cannot exceed 500 characters');
    }
  }

  update(updates: Partial<Pick<UserProfile, 'displayName' | 'bio' | 'avatarUrl' | 'isModerator' | 'isBanned' | 'isSeller' | 'preferences'>>): UserProfile {
    return new UserProfile(
      this.id,
      updates.displayName ?? this.displayName,
      updates.bio ?? this.bio,
      updates.avatarUrl ?? this.avatarUrl,
      updates.isModerator ?? this.isModerator,
      updates.isBanned ?? this.isBanned,
      updates.isSeller ?? this.isSeller,
      updates.preferences ?? this.preferences,
      this.createdAt,
      new Date(),
    );
  }

  isProfileComplete(): boolean {
    return !!(this.displayName && this.bio);
  }
}