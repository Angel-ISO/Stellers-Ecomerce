import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterInput {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password (minimum 6 characters)', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'User display name' })
  @IsString()
  displayName: string;

  @ApiProperty({ description: 'User bio (optional)', required: false })
  @IsOptional()
  @IsString()
  bio?: string;
}