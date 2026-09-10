import {
  HttpStatus,
  UnprocessableEntityException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule, ObserveInstrument } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    instrument: ObserveInstrument,
  });

  const logger = app.get(Logger);
  app.useLogger(logger);

  // Defense-in-depth: mirrors pbl-api's main.ts handler, added there for the
  // @google-cloud/tasks floating-promise bug. pbl-mail-service depends on
  // its own third-party API client (resend), so guard against an
  // unhandled rejection taking down the whole process the same way.
  process.on('unhandledRejection', (reason) => {
    logger.error(reason, 'unhandledRejection');
  });

  // OBSERVE_APP_KEY/OBSERVE_APP_SECRET are read straight off process.env in
  // app.module.ts's createObserveModule() call, bypassing the class-validator
  // validateConfig pattern used elsewhere — so a missing/empty value fails
  // silently (monitoring just stops working) instead of crashing the app.
  // Warn loudly at boot so this doesn't go unnoticed.
  if (!process.env.OBSERVE_APP_KEY || !process.env.OBSERVE_APP_SECRET) {
    logger.warn(
      'OBSERVE_APP_KEY and/or OBSERVE_APP_SECRET is unset — Observe monitoring is disabled/broken.',
      'ObserveConfig',
    );
  }

  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      exceptionFactory: (errors: ValidationError[]) => {
        return new UnprocessableEntityException(errors);
      },
    }),
  );

  const port = process.env.APP_PORT
    ? parseInt(process.env.APP_PORT, 10)
    : process.env.PORT
      ? parseInt(process.env.PORT, 10)
      : 3001;

  await app.listen(port);

  console.info(`pbl-mail-service running on ${await app.getUrl()}`);

  return app;
}

void bootstrap();
