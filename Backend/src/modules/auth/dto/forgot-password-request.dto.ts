import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: "L'email est obligatoire" })
  email!: string;
}
