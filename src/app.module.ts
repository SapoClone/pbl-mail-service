import appConfig from '@/config/app.config';
import { HealthController } from '@/health/health.controller';
import { MailModule } from '@/mail/mail.module';
import qstashConfig from '@/qstash/config/qstash.config';
import { ResendModule } from '@/resend/resend.module';
import resendConfig from '@/resend/config/resend.config';
import loggerFactory from '@/utils/logger-factory';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';
import { LoggerModule } from 'nestjs-pino';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, resendConfig, qstashConfig],
      envFilePath: ['.env'],
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: loggerFactory,
    }),
    ResendModule,
    MailModule,
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY,
      appSecret: process.env.OBSERVE_APP_SECRET,
      serviceId: 'pbl-mail-service',
    }),
  ],
  controllers: [HealthController],
})
export class AppModule {}
