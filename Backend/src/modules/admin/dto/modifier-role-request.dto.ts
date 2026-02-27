import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ModifierRoleRequestDto {
  @ApiProperty({ example: 'ADMIN' })
  @IsString()
  nouveauRole!: string;
}
