import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CancelReservationRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  motif?: string;
}
