import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsResponseDto {
  @ApiProperty()
  totalUtilisateurs!: number;

  @ApiProperty()
  totalAnnonces!: number;

  @ApiProperty()
  totalAnnoncesActives!: number;

  @ApiProperty()
  totalReservations!: number;

  @ApiProperty()
  reservationsEnAttente!: number;

  @ApiProperty()
  revenusTotaux!: number;

  @ApiProperty()
  revenusCeMois!: number;

  @ApiProperty()
  totalTransactions!: number;

  @ApiProperty()
  totalPaiements!: number;

  @ApiProperty()
  paiementsEnAttente!: number;

  @ApiProperty()
  reprisesEnAttente!: number;

  @ApiProperty()
  totalAbonnements!: number;

  @ApiProperty()
  abonnementsActifs!: number;

  @ApiProperty({ type: [Number], required: false })
  revenusMensuels?: number[];
}
