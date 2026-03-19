import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsUUID } from "class-validator";

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  paiementId?: string;
}
