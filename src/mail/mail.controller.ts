import { SendVerificationEmailDto } from '@/common/dto/send-verification-email.dto';
import { QstashSignatureGuard } from '@/qstash/qstash-signature.guard';
import { ResendService } from '@/resend/resend.service';
import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('tasks')
@UseGuards(QstashSignatureGuard)
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private readonly resendService: ResendService,
  ) {}

  @Post('email-verification')
  @HttpCode(204)
  async sendVerificationEmail(
    @Body() dto: SendVerificationEmailDto,
  ): Promise<void> {
    const payload = this.mailService.renderEmailVerification(
      dto.email,
      dto.token,
    );
    await this.resendService.send(payload);
  }
}
