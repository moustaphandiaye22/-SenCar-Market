import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { UtilisateurResponseDto } from './utilisateur-response.dto';

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token pour l\'authentification',
    type: String,
  })
  accessToken!: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT refresh token pour renouvellement du token',
    type: String,
  })
  refreshToken!: string;

  @ApiProperty({
    example: '3600',
    description: 'Temps d\'expiration du token en secondes',
    type: Number,
  })
  expiresIn!: number;

  @ApiProperty({
    example: 'Bearer',
    description: 'Type du token',
    type: String,
  })
  tokenType!: string;

  @ApiPropertyOptional({
    description: 'Utilisateur connecté',
    type: () => UtilisateurResponseDto,
  })
  utilisateur?: UtilisateurResponseDto;
}
