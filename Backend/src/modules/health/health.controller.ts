import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('hello')
  hello(): { message: string } {
    return { message: "L'API Sen-Car Market est opérationnelle" };
  }

  @Get('health')
  health(): { status: string } {
    return { status: 'EN_SERVICE' };
  }
}
