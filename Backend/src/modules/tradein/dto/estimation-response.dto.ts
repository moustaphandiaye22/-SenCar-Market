import { ApiProperty } from '@nestjs/swagger';

export class EstimationResponseDto {
  @ApiProperty({ format: 'uuid' })
  vehiculeId!: string;

  @ApiProperty()
  vehiculeDescription!: string;

  @ApiProperty()
  prixEstime!: number;

  @ApiProperty()
  prixMinimum!: number;

  @ApiProperty()
  prixMaximum!: number;

  @ApiProperty()
  kilometrage!: number;

  @ApiProperty()
  etatVehicule!: string;

  @ApiProperty()
  scoreCondition!: number;

  @ApiProperty()
  recommandation!: string;
}
