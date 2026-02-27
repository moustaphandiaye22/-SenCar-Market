import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class OtpVerifyRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: "L'email est obligatoire" })
  email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Le code OTP est obligatoire' })
  codeOtp!: string;
}
