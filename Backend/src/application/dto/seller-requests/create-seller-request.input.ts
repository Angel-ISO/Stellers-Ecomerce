import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateSellerRequestInput {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  storeName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(500)
  storeDescription: string;
}

