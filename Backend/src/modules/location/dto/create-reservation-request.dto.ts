import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsUUID } from 'class-validator';

export class CreateReservationRequestDto {
  @ApiProperty()
  @IsUUID()
  annonceLocationId!: string;

  @ApiProperty()
  @IsDateString()
  dateDebut!: string;

  @ApiProperty()
  @IsDateString()
  dateFin!: string;
}
