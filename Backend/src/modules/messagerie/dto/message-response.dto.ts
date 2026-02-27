import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  conversationId!: string;

  @ApiProperty({ format: 'uuid' })
  utilisateurId!: string;

  @ApiProperty({ nullable: true })
  utilisateurNom!: string | null;

  @ApiProperty()
  contenu!: string;

  @ApiProperty({ nullable: true })
  dateEnvoi!: Date | null;

  @ApiProperty({ nullable: true })
  dateLecture!: Date | null;

  @ApiProperty({ nullable: true })
  estLu!: boolean | null;

  @ApiProperty({ nullable: true })
  estEpingle!: boolean | null;

  @ApiProperty({ nullable: true })
  typeMessage!: string | null;
}
