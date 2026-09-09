import { ResendConfig } from '@/resend/config/resend-config.type';
import { AppConfig } from './app-config.type';

export type AllConfigType = {
  app: AppConfig;
  resend: ResendConfig;
};
