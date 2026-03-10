import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class HealthController {
  @Get('hello')
  @ApiOperation({ summary: 'Message de disponibilité API' })
  @ApiResponse({
    status: 200,
    description: 'API disponible',
    schema: { type: 'object', properties: { message: { type: 'string', example: "L'API Sen-Car Market est opérationnelle" } } },
  })
  hello(): { message: string } {
    return { message: "L'API Sen-Car Market est opérationnelle" };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({
    status: 200,
    description: 'État de santé',
    schema: { type: 'object', properties: { status: { type: 'string', example: 'EN_SERVICE' } } },
  })
  health(): { status: string } {
    return { status: 'EN_SERVICE' };
  }
}
