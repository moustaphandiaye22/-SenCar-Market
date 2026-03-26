import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUUID } from "class-validator";

export class ActivateBoostRequestDto {
  @ApiProperty({
    description: "ID du paiement confirmé",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsString()
  paymentId!: string;
}
