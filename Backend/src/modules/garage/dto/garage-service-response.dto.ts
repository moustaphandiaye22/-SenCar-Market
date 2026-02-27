import { ApiProperty } from '@nestjs/swagger';

export class GarageServiceResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  garageId!: string;

  @ApiProperty({ nullable: true })
  garageNom!: string | null;

  @ApiProperty({ format: 'uuid' })
  serviceId!: string;

  @ApiProperty({ nullable: true })
  serviceNom!: string | null;

  @ApiProperty({ nullable: true })
  prix!: number | null;

  @ApiProperty({ nullable: true })
  dureeEstimee!: number | null;

  @ApiProperty({ nullable: true })
  actif!: boolean | null;

  @ApiProperty({ nullable: true })
  createdAt!: Date | null;

  @ApiProperty({ nullable: true })
  updatedAt!: Date | null;
}
