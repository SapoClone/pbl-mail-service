import validateConfig from '@/utils/validate-config';
import { registerAs } from '@nestjs/config';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ResendConfig } from './resend-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsNotEmpty()
  RESEND_API_KEY: string;

  @IsEmail()
  RESEND_FROM_EMAIL: string;

  @IsString()
  @IsNotEmpty()
  RESEND_FROM_NAME: string;
}

export default registerAs<ResendConfig>('resend', () => {
  console.info(`Register ResendConfig from environment variables`);
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_FROM_EMAIL,
    fromName: process.env.RESEND_FROM_NAME,
  };
});
