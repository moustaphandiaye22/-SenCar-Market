import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class EstimationRequestDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  vehiculeId!: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  kilometrage!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  etatVehicule!: string;
}
