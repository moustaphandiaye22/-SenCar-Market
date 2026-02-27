import { ApiProperty } from '@nestjs/swagger';

export class PortefeuilleResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  utilisateurId!: string;

  @ApiProperty()
  solde!: string;

  @ApiProperty()
  soldeBloque!: string;

  @ApiProperty()
  soldeDisponible!: string;

  @ApiProperty({ nullable: true })
  dateDerniereRecharge!: Date | null;

  @ApiProperty({ nullable: true })
  createdAt!: Date | null;

  @ApiProperty({ nullable: true })
  updatedAt!: Date | null;
}
