import { Test, TestingModule } from '@nestjs/testing';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { ResendService } from '@/resend/resend.service';

describe('MailController', () => {
  let controller: MailController;
  let mailServiceValue: Partial<Record<keyof MailService, jest.Mock>>;
  let resendServiceValue: Partial<Record<keyof ResendService, jest.Mock>>;

  beforeEach(async () => {
    mailServiceValue = {
      renderEmailVerification: jest.fn().mockReturnValue({
        to: 'user@example.com',
        subject: 'Email Verification',
        html: '<p>verify</p>',
      }),
    };
    resendServiceValue = { send: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailController],
      providers: [
        { provide: MailService, useValue: mailServiceValue },
        { provide: ResendService, useValue: resendServiceValue },
      ],
    }).compile();

    controller = module.get<MailController>(MailController);
  });

  it('should render and send the verification email', async () => {
    await controller.sendVerificationEmail({
      email: 'user@example.com',
      token: 'abc123',
    });

    expect(mailServiceValue.renderEmailVerification).toHaveBeenCalledWith(
      'user@example.com',
      'abc123',
    );
    expect(resendServiceValue.send).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: 'Email Verification',
      html: '<p>verify</p>',
    });
  });
});
