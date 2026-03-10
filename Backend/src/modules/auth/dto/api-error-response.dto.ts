import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorResponseDto {
  @ApiProperty({ example: 400, description: 'HTTP status code' })
  statusCode!: number;

  @ApiProperty({ example: 'Bad Request', description: 'HTTP status message' })
  message!: string;

  @ApiProperty({ example: 'Données invalides ou email déjà utilisé', description: 'Detailed error description' })
  error!: string;

  @ApiProperty({ example: '/api/auth/register', description: 'Request path' })
  path!: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z', description: 'Timestamp' })
  timestamp!: string;
}
