import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Adresse email ou numéro de téléphone de l\'utilisateur',
    type: String,
  })
  @IsString()
  @IsNotEmpty({ message: "L'email ou le téléphone est obligatoire" })
  identifiant!: string;

  @ApiProperty({
    example: 'SecureP@ss123',
    description: 'Mot de passe de l\'utilisateur',
    type: String,
    format: 'password',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  motDePasse!: string;
}
