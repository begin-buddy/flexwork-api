import { Module } from '@nestjs/common';
import {
  I18nModule as NestI18nModule,
  AcceptLanguageResolver,
  QueryResolver,
  HeaderResolver,
} from 'nestjs-i18n';
import * as path from 'path';

@Module({
  imports: [
    NestI18nModule.forRoot({
      fallbackLanguage: 'ko',
      loaderOptions: {
        path: path.join(__dirname, '../../../i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-custom-lang']),
      ],
      typesOutputPath: path.join(__dirname, '../../../src/generated/i18n.generated.ts'),
    }),
  ],
})
export class I18nConfigModule {}
