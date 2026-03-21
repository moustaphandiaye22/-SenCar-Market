import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateGarageServiceItemDto {
  @ApiPropertyOptional()
  @IsString()
  serviceId!: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  prix?: number;
}
