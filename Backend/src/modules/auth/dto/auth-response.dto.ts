import { ApiProperty } from '@nestjs/swagger';

import { UtilisateurResponseDto } from './utilisateur-response.dto';

export class AuthResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty({ default: 'Bearer' })
  tokenType!: string;

  @ApiProperty()
  expiresIn!: number;

  @ApiProperty({ type: UtilisateurResponseDto })
  utilisateur!: UtilisateurResponseDto;
}
