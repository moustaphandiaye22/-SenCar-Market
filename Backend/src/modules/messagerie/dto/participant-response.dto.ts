import { ApiProperty } from '@nestjs/swagger';

export class ParticipantResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  utilisateurId!: string;

  @ApiProperty({ nullable: true })
  utilisateurNom!: string | null;

  @ApiProperty({ nullable: true })
  utilisateurPhotoUrl!: string | null;

  @ApiProperty({ nullable: true })
  dateJoin!: Date | null;

  @ApiProperty({ nullable: true })
  estAdmin!: boolean | null;

  @ApiProperty({ nullable: true })
  estMute!: boolean | null;

  @ApiProperty({ nullable: true })
  nombreNonLus!: number | null;
}
