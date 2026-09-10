import validateConfig from '@/utils/validate-config';
import { registerAs } from '@nestjs/config';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { QstashConfig } from './qstash-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsNotEmpty()
  QSTASH_CURRENT_SIGNING_KEY: string;

  @IsString()
  @IsNotEmpty()
  QSTASH_NEXT_SIGNING_KEY: string;

  @IsUrl({ require_tld: false, require_protocol: true })
  QSTASH_DESTINATION_URL: string;
}

export default registerAs<QstashConfig>('qstash', () => {
  console.info(`Register QstashConfig from environment variables`);
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
    destinationUrl: process.env.QSTASH_DESTINATION_URL,
  };
});
