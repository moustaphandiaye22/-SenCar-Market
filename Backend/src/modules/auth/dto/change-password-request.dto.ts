import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe actuel est obligatoire' })
  motDePasseActuel!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8, {
    message: 'Le nouveau mot de passe doit contenir au moins 8 caractères',
  })
  @IsNotEmpty({ message: 'Le nouveau mot de passe est obligatoire' })
  nouveauMotDePasse!: string;
}
