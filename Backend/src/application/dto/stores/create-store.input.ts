import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, IsUrl } from 'class-validator';

export class CreateStoreInput {
  @ApiProperty({ description: "Store name; at least 3 characters" })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({ description: 'Store description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Logo image URL', required: false })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;
}
