import { ApiProperty } from '@nestjs/swagger';

export class PaiementLogResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid', nullable: true })
  paiementId!: string | null;

  @ApiProperty()
  action!: string;

  @ApiProperty({ nullable: true })
  details!: string | null;

  @ApiProperty({ nullable: true })
  dateAction!: Date | null;
}
