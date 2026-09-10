import qstashConfig from './qstash.config';

describe('QstashConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  beforeAll(() => {
    jest.spyOn(console, 'info').mockImplementation();
  });

  it('should return the qstash configuration', async () => {
    process.env.QSTASH_CURRENT_SIGNING_KEY = 'sig_current';
    process.env.QSTASH_NEXT_SIGNING_KEY = 'sig_next';
    process.env.QSTASH_DESTINATION_URL =
      'https://pbl-mail-service.example.com/tasks/email-verification';

    const config = await qstashConfig();

    expect(config.currentSigningKey).toBe('sig_current');
    expect(config.nextSigningKey).toBe('sig_next');
    expect(config.destinationUrl).toBe(
      'https://pbl-mail-service.example.com/tasks/email-verification',
    );
  });

  describe('currentSigningKey', () => {
    it('should throw an error if QSTASH_CURRENT_SIGNING_KEY is not set', async () => {
      delete process.env.QSTASH_CURRENT_SIGNING_KEY;
      process.env.QSTASH_NEXT_SIGNING_KEY = 'sig_next';
      process.env.QSTASH_DESTINATION_URL =
        'https://pbl-mail-service.example.com/tasks/email-verification';
      await expect(async () => await qstashConfig()).rejects.toThrow(Error);
    });
  });

  describe('nextSigningKey', () => {
    it('should throw an error if QSTASH_NEXT_SIGNING_KEY is not set', async () => {
      process.env.QSTASH_CURRENT_SIGNING_KEY = 'sig_current';
      delete process.env.QSTASH_NEXT_SIGNING_KEY;
      process.env.QSTASH_DESTINATION_URL =
        'https://pbl-mail-service.example.com/tasks/email-verification';
      await expect(async () => await qstashConfig()).rejects.toThrow(Error);
    });
  });

  describe('destinationUrl', () => {
    it('should throw an error if QSTASH_DESTINATION_URL is not a valid URL', async () => {
      process.env.QSTASH_CURRENT_SIGNING_KEY = 'sig_current';
      process.env.QSTASH_NEXT_SIGNING_KEY = 'sig_next';
      process.env.QSTASH_DESTINATION_URL = 'not-a-url';
      await expect(async () => await qstashConfig()).rejects.toThrow(Error);
    });

    it('should throw an error if QSTASH_DESTINATION_URL is not set', async () => {
      process.env.QSTASH_CURRENT_SIGNING_KEY = 'sig_current';
      process.env.QSTASH_NEXT_SIGNING_KEY = 'sig_next';
      delete process.env.QSTASH_DESTINATION_URL;
      await expect(async () => await qstashConfig()).rejects.toThrow(Error);
    });
  });
});
