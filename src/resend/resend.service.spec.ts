import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ResendService } from './resend.service';

const sendMock = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: sendMock },
  })),
}));

describe('ResendService', () => {
  let service: ResendService;

  beforeEach(async () => {
    sendMock.mockReset();
    sendMock.mockResolvedValue({ data: { id: 'email_123' }, error: null });

    const configValues: Record<string, string> = {
      'resend.apiKey': 're_test_key',
      'resend.fromEmail': 'noreply@example.com',
      'resend.fromName': 'pbl-api',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResendService,
        {
          provide: ConfigService,
          useValue: { getOrThrow: (key: string) => configValues[key] },
        },
      ],
    }).compile();

    service = module.get<ResendService>(ResendService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send with the configured from address and given payload', async () => {
    await service.send({
      to: 'user@example.com',
      subject: 'Email Verification',
      html: '<p>verify</p>',
    });

    expect(sendMock).toHaveBeenCalledWith({
      from: 'pbl-api <noreply@example.com>',
      to: 'user@example.com',
      subject: 'Email Verification',
      html: '<p>verify</p>',
    });
  });

  it('should throw when Resend returns an error', async () => {
    sendMock.mockResolvedValue({
      data: null,
      error: { message: 'invalid domain' },
    });

    await expect(
      service.send({ to: 'a@b.com', subject: 'x', html: '<p>x</p>' }),
    ).rejects.toThrow('invalid domain');
  });
});
