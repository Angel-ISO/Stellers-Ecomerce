import { ApiProperty } from '@nestjs/swagger';
import { UserOutput } from './user.output';

export class PaginatedUserOutput {
  @ApiProperty({ type: [UserOutput] })
  registers: UserOutput[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  pageIndex: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  search: string;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasPreviousPage: boolean;

  @ApiProperty()
  hasNextPage: boolean;
}