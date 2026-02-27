import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, Matches } from 'class-validator';

import { TYPE_MESSAGE_VALUES, TypeMessage } from '../types/messagerie.types';

export class SendMessageRequestDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  conversationId!: string;

  @ApiProperty()
  @IsString()
  @Matches(/\S/, { message: 'contenu ne doit pas être vide' })
  contenu!: string;

  @ApiPropertyOptional({ enum: TYPE_MESSAGE_VALUES })
  @IsOptional()
  @IsEnum(TYPE_MESSAGE_VALUES)
  typeMessage?: TypeMessage;
}
