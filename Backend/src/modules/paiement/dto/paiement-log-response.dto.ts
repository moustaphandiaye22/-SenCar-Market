import { ApiProperty } from '@nestjs/swagger';

export class PaiementLogResponseDto {
  @ApiProperty({ format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440030' })
  id!: string;

  @ApiProperty({ type: String, format: 'uuid', nullable: true, example: '550e8400-e29b-41d4-a716-446655440000' })
  paiementId!: string | null;

  @ApiProperty({ example: 'CONFIRMATION' })
  action!: string;

  @ApiProperty({ type: String, nullable: true, example: 'Paiement confirmé avec référence externe: WAVE_20260228_001' })
  details!: string | null;

  @ApiProperty({ nullable: true, type: String, format: 'date-time', example: '2026-02-28T10:31:00.000Z' })
  dateAction!: Date | null;
}
