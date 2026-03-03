import { ApiProperty } from '@nestjs/swagger';

export class PortefeuilleResponseDto {
  @ApiProperty({ format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440020' })
  id!: string;

  @ApiProperty({ format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440021' })
  utilisateurId!: string;

  @ApiProperty({ example: '50000.00' })
  solde!: string;

  @ApiProperty({ example: '10000.00' })
  soldeBloque!: string;

  @ApiProperty({ example: '40000.00' })
  soldeDisponible!: string;

  @ApiProperty({ nullable: true, type: String, format: 'date-time', example: '2026-02-28T09:45:00.000Z' })
  dateDerniereRecharge!: Date | null;

  @ApiProperty({ nullable: true, type: String, format: 'date-time', example: '2026-02-01T08:00:00.000Z' })
  createdAt!: Date | null;

  @ApiProperty({ nullable: true, type: String, format: 'date-time', example: '2026-02-28T09:45:00.000Z' })
  updatedAt!: Date | null;
}
