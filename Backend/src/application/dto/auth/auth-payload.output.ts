import { ApiProperty } from '@nestjs/swagger';

export class UserOutput {
  @ApiProperty({ description: 'User unique identifier' })
  id: string;

  @ApiProperty({ description: 'User full name' })
  name: string;

  @ApiProperty({ description: 'User email address' })
  email: string;

  @ApiProperty({ description: 'User avatar URL', required: false })
  avatarUrl?: string;

  @ApiProperty({ description: 'Whether the user email is verified' })
  isVerified: boolean;

  @ApiProperty({ description: 'Whether the user is a moderator' })
  isModerator: boolean;

  @ApiProperty({ description: 'Whether the user is banned' })
  isBanned: boolean;

  @ApiProperty({ description: 'Whether the user is a seller' })
  isSeller: boolean;

  @ApiProperty({ description: 'User creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'User last update date' })
  updatedAt: Date;
}

export class AuthPayload {
  @ApiProperty({ description: 'Authenticated user information', type: UserOutput })
  user: UserOutput;

  @ApiProperty({ description: 'Internal JWT token for API access' })
  token: string;

  @ApiProperty({ description: 'Original Supabase access token', required: false })
  supabaseAccessToken?: string;
}