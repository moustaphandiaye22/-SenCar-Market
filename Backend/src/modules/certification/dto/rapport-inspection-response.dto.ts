import { ApiProperty } from '@nestjs/swagger';

export class RapportInspectionResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  inspectionId!: string;

  @ApiProperty({ nullable: true })
  urlRapportPdf!: string | null;

  @ApiProperty({ nullable: true })
  dateGeneration!: Date | null;

  @ApiProperty({ nullable: true })
  scoreGlobale!: number | null;

  @ApiProperty({ nullable: true })
  recommendations!: string | null;

  @ApiProperty({ nullable: true })
  conclusion!: string | null;

  @ApiProperty({ nullable: true })
  estApprouve!: boolean | null;

  @ApiProperty({ nullable: true })
  createdAt!: Date | null;

  @ApiProperty({ nullable: true })
  updatedAt!: Date | null;
}
