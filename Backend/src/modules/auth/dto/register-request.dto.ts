import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterRequestDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Adresse email valide et unique',
    format: 'email',
    type: String,
  })
  @IsEmail({}, { message: "Format d'email invalide" })
  @IsNotEmpty({ message: "L'email est obligatoire" })
  email!: string;

  @ApiProperty({
    example: '+221771234567',
    description: 'Numéro de téléphone mobile (format international)',
    type: String,
    pattern: '^\\+221[7-9][0-9]{8}$',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le téléphone est obligatoire' })
  telephone!: string;

  @ApiProperty({
    example: 'SecureP@ss123',
    description: 'Mot de passe sécurisé (min 8 caractères, majuscule, minuscule, chiffre)',
    type: String,
    minLength: 8,
    maxLength: 100,
  })
  @IsString()
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  })
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  motDePasse!: string;

  @ApiProperty({
    example: 'John',
    description: 'Prénom de l\'utilisateur',
    type: String,
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'Le prénom est obligatoire' })
  prenom!: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Nom de famille de l\'utilisateur',
    type: String,
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  nom!: string;

  @ApiProperty({
    example: 'particulier',
    description: 'Type d\'utilisateur: particulier, professionnel, ou garage',
    enum: ['particulier', 'professionnel', 'garage'],
    enumName: 'TypeUtilisateur',
  })
  @IsString()
  @IsNotEmpty({ message: "Le type d'utilisateur est obligatoire" })
  typeUtilisateur!: string;

  @ApiPropertyOptional({
    example: ' Dakar',
    description: 'Adresse de l\'utilisateur (optionnel)',
    type: String,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  adresse?: string;

  @ApiPropertyOptional({
    example: '1990-05-15',
    description: 'Date de naissance (optionnel, format ISO 8601)',
    type: String,
    format: 'date',
  })
  @IsOptional()
  @IsString()
  dateDeNaissance?: string;
}
