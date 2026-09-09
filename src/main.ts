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

  app.useLogger(app.get(Logger));
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
