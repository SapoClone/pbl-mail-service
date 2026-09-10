import { AllConfigType } from '@/config/config.type';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  RawBodyRequest,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Receiver } from '@upstash/qstash';
import { Request } from 'express';

@Injectable()
export class QstashSignatureGuard implements CanActivate {
  private readonly logger = new Logger(QstashSignatureGuard.name);

  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<RawBodyRequest<Request>>();

    const signature = request.headers['upstash-signature'];
    if (!signature || Array.isArray(signature)) {
      this.logger.warn('Request missing Upstash-Signature header');
      throw new UnauthorizedException('Missing signature');
    }

    if (!request.rawBody) {
      this.logger.warn(
        'Request has no rawBody — is rawBody:true set on NestFactory.create?',
      );
      throw new UnauthorizedException('Cannot verify signature');
    }

    const receiver = new Receiver({
      currentSigningKey: this.configService.getOrThrow(
        'qstash.currentSigningKey',
        { infer: true },
      ),
      nextSigningKey: this.configService.getOrThrow('qstash.nextSigningKey', {
        infer: true,
      }),
    });

    const isValid = await receiver.verify({
      signature,
      body: request.rawBody.toString(),
      url: this.configService.getOrThrow('qstash.destinationUrl', {
        infer: true,
      }),
    });

    if (!isValid) {
      this.logger.warn('Invalid Upstash-Signature');
      throw new UnauthorizedException('Invalid signature');
    }

    return true;
  }
}
