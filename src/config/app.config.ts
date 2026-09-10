import { Environment, LogService } from "@/constants/app.constant";
import { registerAs } from "@nestjs/config";
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
} from "class-validator";
import process from "node:process";
import validateConfig from "../utils/validate-config";
import { AppConfig } from "./app-config.type";

class EnvironmentVariablesValidator {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment;

  @IsString()
  @IsOptional()
  APP_NAME: string;

  @IsUrl({ require_tld: false, require_protocol: true })
  API_PUBLIC_URL: string;

  @IsBoolean()
  @IsOptional()
  APP_DEBUG: boolean;

  @IsString()
  @IsOptional()
  APP_LOG_LEVEL: string;

  @IsString()
  @IsEnum(LogService)
  @IsOptional()
  APP_LOG_SERVICE: string;
}

export default registerAs<AppConfig>("app", () => {
  console.info(`Register AppConfig from environment variables`);
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    nodeEnv: process.env.NODE_ENV || Environment.DEVELOPMENT,
    name: process.env.APP_NAME || "app",
    apiPublicUrl: process.env.API_PUBLIC_URL,
    debug: process.env.APP_DEBUG === "true",
    logLevel: process.env.APP_LOG_LEVEL || "warn",
    logService: process.env.APP_LOG_SERVICE || LogService.CONSOLE,
  };
});
