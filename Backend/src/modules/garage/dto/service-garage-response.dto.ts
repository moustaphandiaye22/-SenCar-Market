import { ApiProperty } from '@nestjs/swagger';

export class ServiceGarageResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  nom!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty({ nullable: true })
  prix!: number | null;

  @ApiProperty({ nullable: true })
  dureeEstimee!: number | null;

  @ApiProperty({ nullable: true })
  categorie!: string | null;

  @ApiProperty({ nullable: true })
  actif!: boolean | null;

  @ApiProperty({ nullable: true })
  createdAt!: Date | null;

  @ApiProperty({ nullable: true })
  updatedAt!: Date | null;
}
