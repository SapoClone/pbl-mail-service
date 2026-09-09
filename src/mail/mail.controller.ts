import { SendVerificationEmailDto } from '@/common/dto/send-verification-email.dto';
import { ResendService } from '@/resend/resend.service';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('tasks')
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
