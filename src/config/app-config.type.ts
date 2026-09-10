export type AppConfig = {
  nodeEnv: string;
  name: string;
  /** Public base URL of pbl-api, used to build links (e.g. email verification) that must resolve to pbl-api's routes. */
  apiPublicUrl: string;
  debug: boolean;
  logLevel: string;
  logService: string;
};
