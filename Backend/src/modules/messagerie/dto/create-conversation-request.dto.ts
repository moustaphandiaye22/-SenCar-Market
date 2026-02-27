import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID, Matches } from 'class-validator';

import { TYPE_CONVERSATION_VALUES, TypeConversation } from '../types/messagerie.types';

export class CreateConversationRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/\S/, { message: 'titre ne doit pas être vide' })
  titre?: string;

  @ApiProperty({ enum: TYPE_CONVERSATION_VALUES })
  @IsEnum(TYPE_CONVERSATION_VALUES)
  typeConversation!: TypeConversation;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  annonceId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  autreUtilisateurId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  participantIds?: string[];
}
