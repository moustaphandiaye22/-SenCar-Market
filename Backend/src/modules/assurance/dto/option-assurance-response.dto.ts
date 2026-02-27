import { ApiProperty } from '@nestjs/swagger';

export class OptionAssuranceResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  nom!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty({ nullable: true })
  prixSupplementaire!: number | null;

  @ApiProperty({ format: 'uuid' })
  produitAssuranceId!: string;

  @ApiProperty({ nullable: true })
  estActif!: boolean | null;

  @ApiProperty({ nullable: true })
  createdAt!: Date | null;

  @ApiProperty({ nullable: true })
  updatedAt!: Date | null;
}
