import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsObject } from 'class-validator';

export class UpdateUserInput {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isModerator?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isBanned?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  preferences?: any;
}