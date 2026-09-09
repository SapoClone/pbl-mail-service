import { AllConfigType } from '@/config/config.type';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface ISendEmailPayload {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class ResendService {
  private readonly logger = new Logger(ResendService.name);
  private readonly client: Resend;

  constructor(private readonly configService: ConfigService<AllConfigType>) {
    this.client = new Resend(
      this.configService.getOrThrow('resend.apiKey', { infer: true }),
    );
  }

  async send(payload: ISendEmailPayload): Promise<void> {
    const fromEmail = this.configService.getOrThrow('resend.fromEmail', {
      infer: true,
    });
    const fromName = this.configService.getOrThrow('resend.fromName', {
      infer: true,
    });

    this.logger.debug(`Sending email to ${payload.to}`);

    const { error } = await this.client.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });

    if (error) {
      throw new Error(error.message);
    }
  }
}
