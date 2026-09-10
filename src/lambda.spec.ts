import { MailService } from "@/mail/mail.service";
import { ResendService } from "@/resend/resend.service";
import { NestFactory } from "@nestjs/core";
import { Logger } from "nestjs-pino";
import { SQSEvent } from "aws-lambda";
import { handler } from "./lambda";

const renderEmailVerificationMock = jest.fn();
const sendMock = jest.fn();
const loggerMock = { log: jest.fn(), error: jest.fn() };

// AppModule itself isn't under test here (NestFactory is fully mocked below,
// so its value never matters) — stubbed out purely to dodge pulling in
// @nestjs/observe's ESM build through the real app.module.ts import graph,
// which jest's default CJS transform can't parse.
jest.mock("./app.module", () => ({ AppModule: class AppModule {} }));

jest.mock("@nestjs/core", () => ({
  NestFactory: {
    createApplicationContext: jest.fn().mockResolvedValue({
      get: (token: unknown) => {
        if (token === MailService)
          return { renderEmailVerification: renderEmailVerificationMock };
        if (token === ResendService) return { send: sendMock };
        if (token === Logger) return loggerMock;
        throw new Error(`unexpected token: ${String(token)}`);
      },
    }),
  },
}));

function record(id: string, body: unknown) {
  return {
    messageId: id,
    body: JSON.stringify(body),
  } as SQSEvent["Records"][number];
}

describe("lambda handler", () => {
  beforeEach(() => {
    renderEmailVerificationMock.mockReset();
    sendMock.mockReset();
    loggerMock.log.mockReset();
    loggerMock.error.mockReset();

    renderEmailVerificationMock.mockReturnValue({
      to: "user@example.com",
      subject: "Email Verification",
      html: "<p>verify</p>",
    });
    sendMock.mockResolvedValue("email_123");
  });

  // Every case below runs against the SAME cached application context
  // (module-level singleton, by design) — this also exercises that reuse
  // path rather than needing a dedicated test for it.
  it("creates the application context only once across invocations", async () => {
    await handler(
      { Records: [record("warmup", { email: "a@b.com", token: "x" })] },
      null,
      null,
    );
    await handler(
      { Records: [record("warmup-2", { email: "a@b.com", token: "x" })] },
      null,
      null,
    );

    expect(NestFactory.createApplicationContext).toHaveBeenCalledTimes(1);
  });

  it("processes every valid record and reports no failures", async () => {
    const event: SQSEvent = {
      Records: [
        record("1", { email: "user@example.com", token: "abc" }),
        record("2", { email: "other@example.com", token: "def" }),
      ],
    };

    const result = await handler(event, null, null);

    expect(sendMock).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ batchItemFailures: [] });
  });

  it("reports only the failing records via batchItemFailures", async () => {
    const event: SQSEvent = {
      Records: [
        record("1", { email: "user@example.com", token: "abc" }),
        record("2", { email: "not-an-email", token: "def" }),
      ],
    };

    const result = await handler(event, null, null);

    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ batchItemFailures: [{ itemIdentifier: "2" }] });
  });
});
