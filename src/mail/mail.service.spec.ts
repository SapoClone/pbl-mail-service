import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { MailService } from "./mail.service";

describe("MailService", () => {
  let service: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              key === "app.apiPublicUrl" ? "http://localhost:3000" : undefined,
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should render the email-verification template with a verify URL", () => {
    const result = service.renderEmailVerification(
      "user@example.com",
      "abc123",
    );

    expect(result.to).toBe("user@example.com");
    expect(result.subject).toBe("Email Verification");
    expect(result.html).toContain("user@example.com");
    expect(result.html).toContain(
      "http://localhost:3000/api/v1/auth/verify/email?token=abc123",
    );
  });

  it("should render the password-reset template in Vietnamese with the link", () => {
    const url = "http://localhost:5173/reset-password?token=abc_123-XYZ";

    const result = service.renderPasswordReset("user@example.com", url);

    expect(result.to).toBe("user@example.com");
    expect(result.subject).toBe("Đặt lại mật khẩu");
    expect(result.html).toContain("Xin chào user@example.com");
    expect(result.html).toContain("Đặt lại mật khẩu</a>");
    // Handlebars escapes `=` as an HTML entity; the browser decodes it back inside href
    expect(result.html).toContain(
      'href="http://localhost:5173/reset-password?token&#x3D;abc_123-XYZ"',
    );
    expect(result.html).toContain("60 phút");
    expect(result.html).toContain("bỏ qua email này");
  });

  it("should not let an address or url inject markup", () => {
    const result = service.renderPasswordReset(
      "a@b.vn",
      'http://x.test/?a=1"><script>1</script>',
    );

    expect(result.html).not.toContain("<script>1</script>");
  });
});
