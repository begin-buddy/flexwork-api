import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: '헬스체크 및 환영 메시지' })
  async getHello() {
    const welcome = await this.i18n.translate('common.welcome');
    const hello = await this.i18n.translate('common.hello', {
      args: { name: 'NestJS' },
    });

    return {
      message: this.appService.getHello(),
      i18n: {
        welcome,
        hello,
      },
    };
  }
}
