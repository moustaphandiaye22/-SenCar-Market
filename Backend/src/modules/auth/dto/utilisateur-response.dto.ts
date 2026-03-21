import { ApiProperty } from '@nestjs/swagger';

export class UtilisateurResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  telephone!: string;

  @ApiProperty()
  prenom!: string | null;

  @ApiProperty()
  nom!: string | null;

  @ApiProperty()
  photoProfilUrl!: string | null;

  @ApiProperty()
  emailVerifie!: boolean | null;

  @ApiProperty()
  telephoneVerifie!: boolean | null;

  @ApiProperty()
  doubleAuthActive!: boolean | null;

  @ApiProperty()
  typeUtilisateur!: string | null;

  @ApiProperty()
  statutVerification!: string | null;

  @ApiProperty()
  createdAt!: Date | null;

  @ApiProperty()
  estActif!: boolean;
}
