import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateDemandeTradeInRequestDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  vehiculeActuelId!: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  vehiculeSouhaiteId?: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  kilometrageActuel!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  etatVehicule!: string;
}
