import { ApiProperty } from '@nestjs/swagger';

export class DisponibiliteLocationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  annonceLocationId!: string;

  @ApiProperty()
  date!: Date | null;

  @ApiProperty()
  estDisponible!: boolean | null;
}
