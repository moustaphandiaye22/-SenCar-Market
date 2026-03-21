import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateRendezVousRequestDto {
  @ApiProperty({ description: 'ID du garage' })
  @IsUUID()
  garageId!: string;

  @ApiProperty({ description: 'ID du service (optionnel)', required: false })
  @IsUUID()
  @IsOptional()
  serviceId?: string;

  @ApiProperty({ description: 'Date du rendez-vous' })
  @IsDateString()
  dateRendezVous!: string;

  @ApiProperty({ description: 'Commentaire du client', required: false })
  @IsString()
  @IsOptional()
  commentaire?: string;
}
