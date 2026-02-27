import { ApiProperty } from '@nestjs/swagger';

import { MessageResponseDto } from './message-response.dto';
import { ParticipantResponseDto } from './participant-response.dto';

export class ConversationResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ nullable: true })
  titre!: string | null;

  @ApiProperty({ nullable: true })
  avatarUrl!: string | null;

  @ApiProperty({ nullable: true })
  typeConversation!: string | null;

  @ApiProperty({ format: 'uuid', nullable: true })
  annonceId!: string | null;

  @ApiProperty({ nullable: true })
  createdAt!: Date | null;

  @ApiProperty({ nullable: true })
  updatedAt!: Date | null;

  @ApiProperty({ nullable: true, type: MessageResponseDto })
  dernierMessage!: MessageResponseDto | null;

  @ApiProperty({ type: ParticipantResponseDto, isArray: true })
  participants!: ParticipantResponseDto[];

  @ApiProperty({ nullable: true })
  nombreNonLus!: number | null;
}
