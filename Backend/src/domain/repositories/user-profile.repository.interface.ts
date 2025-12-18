import { UserProfile } from '../entities/user-profile.entity';


export interface IUserProfileRepository {
 
  create(userProfile: {
    id: string;
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    isModerator?: boolean;
    isBanned?: boolean;
    preferences?: any;
  }): Promise<UserProfile>;

 
  findById(id: string): Promise<UserProfile | null>;

 
  update(id: string, updates: Partial<UserProfile>): Promise<UserProfile>;

  findAll(params: {
    pageSize: number;
    pageIndex: number;
    search?: string;
  }): Promise<{ users: UserProfile[]; total: number }>;

}