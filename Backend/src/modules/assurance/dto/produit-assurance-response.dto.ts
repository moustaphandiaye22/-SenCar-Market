import { ApiProperty } from '@nestjs/swagger';

import { OptionAssuranceResponseDto } from './option-assurance-response.dto';

export class ProduitAssuranceResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  nom!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty()
  prixBase!: number;

  @ApiProperty()
  typeAssurance!: string;

  @ApiProperty({ nullable: true })
  dureeMois!: number | null;

  @ApiProperty({ nullable: true })
  estActif!: boolean | null;

  @ApiProperty({ type: [OptionAssuranceResponseDto] })
  options!: OptionAssuranceResponseDto[];

  @ApiProperty({ nullable: true })
  createdAt!: Date | null;

  @ApiProperty({ nullable: true })
  updatedAt!: Date | null;
}
