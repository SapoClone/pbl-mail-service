import { SendVerificationEmailDto } from "@/common/dto/send-verification-email.dto";
import { MailService } from "@/mail/mail.service";
import { ResendService } from "@/resend/resend.service";
import { INestApplicationContext } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { Logger } from "nestjs-pino";
import {
  SQSBatchItemFailure,
  SQSBatchResponse,
  SQSEvent,
  SQSHandler,
  SQSRecord,
} from "aws-lambda";
import { AppModule } from "./app.module";

// Reused across warm invocations of the same Lambda execution environment —
// createApplicationContext (not create()) since this consumes SQS directly
// and never serves HTTP.
let appContextPromise: Promise<INestApplicationContext> | undefined;

function getAppContext(): Promise<INestApplicationContext> {
  appContextPromise ??= NestFactory.createApplicationContext(AppModule, {
    bufferLogs: true,
  });
  return appContextPromise;
}

async function processRecord(
  record: SQSRecord,
  mailService: MailService,
  resendService: ResendService,
  logger: Logger,
): Promise<void> {
  const dto = plainToInstance(
    SendVerificationEmailDto,
    JSON.parse(record.body),
  );
  const errors = validateSync(dto);
  if (errors.length > 0) {
    throw new Error(
      `Invalid message body for record ${record.messageId}: ${errors.toString()}`,
    );
  }

  const payload = mailService.renderEmailVerification(dto.email, dto.token);
  await resendService.send(payload);
  logger.log(`Sent verification email to ${dto.email}`, "Lambda");
}

export const handler: SQSHandler = async (
  event: SQSEvent,
): Promise<SQSBatchResponse> => {
  const app = await getAppContext();
  const logger = app.get(Logger);
  const mailService = app.get(MailService);
  const resendService = app.get(ResendService);

  const batchItemFailures: SQSBatchItemFailure[] = [];

  for (const record of event.Records) {
    try {
      await processRecord(record, mailService, resendService, logger);
    } catch (err) {
      logger.error(err, `Failed to process record ${record.messageId}`);
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures };
};
