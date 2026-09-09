import { AllConfigType } from '@/config/config.type';
import { ISendEmailPayload } from '@/resend/resend.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import Handlebars from 'handlebars';
import { join } from 'path';

@Injectable()
export class MailService {
  private readonly emailVerificationTemplate = Handlebars.compile(
    readFileSync(
      join(__dirname, 'templates', 'email-verification.hbs'),
      'utf-8',
    ),
  );

  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  renderEmailVerification(email: string, token: string): ISendEmailPayload {
    const url = `${this.configService.get('app.url', { infer: true })}/api/v1/auth/verify/email?token=${token}`;

    return {
      to: email,
      subject: 'Email Verification',
      html: this.emailVerificationTemplate({ email, url }),
    };
  }
}
