import { QstashConfig } from '@/qstash/config/qstash-config.type';
import { ResendConfig } from '@/resend/config/resend-config.type';
import { AppConfig } from './app-config.type';

export type AllConfigType = {
  app: AppConfig;
  resend: ResendConfig;
  qstash: QstashConfig;
};
