import { ApiProperty } from '@nestjs/swagger';

export class HistoriqueStatutResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  reservationId!: string;

  @ApiProperty()
  ancienStatutId!: string | null;

  @ApiProperty()
  nouveauStatutId!: string | null;

  @ApiProperty()
  createdAt!: Date | null;
}
