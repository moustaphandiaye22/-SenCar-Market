import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Le refresh token est obligatoire' })
  refreshToken!: string;
}
