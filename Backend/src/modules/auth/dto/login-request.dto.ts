import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({ description: 'Email ou téléphone' })
  @IsString()
  @IsNotEmpty({ message: "L'email ou le téléphone est obligatoire" })
  identifiant!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  motDePasse!: string;
}
