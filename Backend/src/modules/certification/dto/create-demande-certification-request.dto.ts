import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateDemandeCertificationRequestDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  vehiculeId!: string;
}
