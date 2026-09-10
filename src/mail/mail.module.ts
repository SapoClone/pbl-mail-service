import { QstashSignatureGuard } from '@/qstash/qstash-signature.guard';
import { Module } from '@nestjs/common';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';

@Module({
  controllers: [MailController],
  providers: [MailService, QstashSignatureGuard],
  exports: [MailService],
})
export class MailModule {}
