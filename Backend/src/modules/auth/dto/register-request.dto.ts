import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterRequestDto {
  @ApiProperty()
  @IsEmail({}, { message: "Format d'email invalide" })
  @IsNotEmpty({ message: "L'email est obligatoire" })
  email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Le téléphone est obligatoire' })
  telephone!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  })
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  motDePasse!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Le prénom est obligatoire' })
  prenom!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  nom!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: "Le type d'utilisateur est obligatoire" })
  typeUtilisateur!: string;
}
