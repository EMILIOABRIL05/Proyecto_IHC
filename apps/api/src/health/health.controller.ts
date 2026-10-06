import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Comprueba que la API está arriba' })
  check(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
