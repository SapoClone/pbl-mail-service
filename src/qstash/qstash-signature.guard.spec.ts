import { ConfigService } from '@nestjs/config';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { QstashSignatureGuard } from './qstash-signature.guard';

const verifyMock = jest.fn();

jest.mock('@upstash/qstash', () => ({
  Receiver: jest.fn().mockImplementation(() => ({
    verify: verifyMock,
  })),
}));

describe('QstashSignatureGuard', () => {
  let guard: QstashSignatureGuard;
  let configService: ConfigService;

  const buildContext = (
    headers: Record<string, string>,
    rawBody?: Buffer,
  ): ExecutionContext => {
    const request = { headers, rawBody };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    verifyMock.mockReset();

    const configValues: Record<string, string> = {
      'qstash.currentSigningKey': 'sig_current',
      'qstash.nextSigningKey': 'sig_next',
      'qstash.destinationUrl':
        'https://pbl-mail-service.example.com/tasks/email-verification',
    };
    configService = {
      getOrThrow: (key: string) => configValues[key],
    } as unknown as ConfigService;

    guard = new QstashSignatureGuard(configService);
  });

  it('should allow the request when the signature is valid', async () => {
    verifyMock.mockResolvedValue(true);

    const context = buildContext(
      { 'upstash-signature': 'valid-jwt' },
      Buffer.from('{"email":"a@b.com","token":"tok"}'),
    );

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(verifyMock).toHaveBeenCalledWith({
      signature: 'valid-jwt',
      body: '{"email":"a@b.com","token":"tok"}',
      url: 'https://pbl-mail-service.example.com/tasks/email-verification',
    });
  });

  it('should reject when the Upstash-Signature header is missing', async () => {
    const context = buildContext({}, Buffer.from('{}'));

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(verifyMock).not.toHaveBeenCalled();
  });

  it('should reject when rawBody is unavailable', async () => {
    const context = buildContext({ 'upstash-signature': 'some-jwt' });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(verifyMock).not.toHaveBeenCalled();
  });

  it('should reject when the signature fails verification', async () => {
    verifyMock.mockResolvedValue(false);

    const context = buildContext(
      { 'upstash-signature': 'forged-jwt' },
      Buffer.from('{}'),
    );

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
