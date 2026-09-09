import resendConfig from './resend.config';

describe('ResendConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  beforeAll(() => {
    jest.spyOn(console, 'info').mockImplementation();
  });

  it('should return the resend configuration', async () => {
    process.env.RESEND_API_KEY = 're_test_key';
    process.env.RESEND_FROM_EMAIL = 'noreply@example.com';
    process.env.RESEND_FROM_NAME = 'pbl-api';

    const config = await resendConfig();

    expect(config.apiKey).toBe('re_test_key');
    expect(config.fromEmail).toBe('noreply@example.com');
    expect(config.fromName).toBe('pbl-api');
  });

  describe('apiKey', () => {
    it('should throw an error if RESEND_API_KEY is not set', async () => {
      delete process.env.RESEND_API_KEY;
      process.env.RESEND_FROM_EMAIL = 'noreply@example.com';
      process.env.RESEND_FROM_NAME = 'pbl-api';
      await expect(async () => await resendConfig()).rejects.toThrow(Error);
    });
  });

  describe('fromEmail', () => {
    it('should throw an error if RESEND_FROM_EMAIL is not a valid email', async () => {
      process.env.RESEND_API_KEY = 're_test_key';
      process.env.RESEND_FROM_EMAIL = 'not-an-email';
      process.env.RESEND_FROM_NAME = 'pbl-api';
      await expect(async () => await resendConfig()).rejects.toThrow(Error);
    });
  });

  describe('fromName', () => {
    it('should throw an error if RESEND_FROM_NAME is not set', async () => {
      process.env.RESEND_API_KEY = 're_test_key';
      process.env.RESEND_FROM_EMAIL = 'noreply@example.com';
      delete process.env.RESEND_FROM_NAME;
      await expect(async () => await resendConfig()).rejects.toThrow(Error);
    });
  });
});
