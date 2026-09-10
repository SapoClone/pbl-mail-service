import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              key === 'app.apiPublicUrl' ? 'http://localhost:3000' : undefined,
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should render the email-verification template with a verify URL', () => {
    const result = service.renderEmailVerification(
      'user@example.com',
      'abc123',
    );

    expect(result.to).toBe('user@example.com');
    expect(result.subject).toBe('Email Verification');
    expect(result.html).toContain('user@example.com');
    expect(result.html).toContain(
      'http://localhost:3000/api/v1/auth/verify/email?token=abc123',
    );
  });
});
