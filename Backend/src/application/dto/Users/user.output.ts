import { ApiProperty } from '@nestjs/swagger';

export class UserOutput {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false })
  displayName?: string;

  @ApiProperty({ required: false })
  bio?: string;

  @ApiProperty({ required: false })
  avatarUrl?: string;

  @ApiProperty()
  isModerator: boolean;

  @ApiProperty()
  isBanned: boolean;

  @ApiProperty({ required: false })
  preferences?: any;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}