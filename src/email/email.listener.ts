import { QueueEventsHost, QueueEventsListener, OnQueueEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';

@QueueEventsListener('email')
export class EmailEventsListener extends QueueEventsHost {
  private readonly logger = new Logger(EmailEventsListener.name);

  @OnQueueEvent('failed')
  onFailed(
    args: { jobId: string; failedReason: string; prev?: string },
    id: string,
  ) {
    this.logger.error(`❌ [Queue Event] Job ${args.jobId} has completely FAILED. Reason: ${args.failedReason}`);
    // ที่นี่คือจุดที่เราสามารถนำข้อมูล Job ไปบันทึกลง Dead Letter Queue (DLQ) ใน Database ได้
  }

  @OnQueueEvent('completed')
  onCompleted(args: { jobId: string; returnvalue: string; prev?: string }, id: string) {
    this.logger.log(`✅ [Queue Event] Job ${args.jobId} has successfully completed.`);
  }
}
