import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: "L'email est obligatoire" })
  email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Le code OTP est obligatoire' })
  codeOtp!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  })
  @IsNotEmpty({ message: 'Le nouveau mot de passe est obligatoire' })
  nouveauMotDePasse!: string;
}
