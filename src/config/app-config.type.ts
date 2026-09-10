export type AppConfig = {
  nodeEnv: string;
  name: string;
  url: string;
  /** Public base URL of pbl-api, used to build links (e.g. email verification) that must resolve to pbl-api's routes. */
  apiPublicUrl: string;
  port: number;
  debug: boolean;
  apiPrefix: string;
  fallbackLanguage: string;
  logLevel: string;
  logService: string;
  corsOrigin: boolean | string | RegExp | (string | RegExp)[];
};
