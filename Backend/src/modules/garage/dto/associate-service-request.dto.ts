import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class AssociateServiceRequestDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  serviceId!: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  prix?: number;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  dureeEstimee?: number;
}
