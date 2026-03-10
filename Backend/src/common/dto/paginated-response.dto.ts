import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
  @ApiProperty({ type: 'array', items: { type: 'object' } })
  content!: T[];

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  size!: number;

  @ApiProperty({ example: 125 })
  totalElements!: number;

  @ApiProperty({ example: 7 })
  totalPages!: number;

  @ApiProperty({ example: false })
  last!: boolean;

  @ApiProperty({ example: true })
  first!: boolean;
}
