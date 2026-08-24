import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, UnrecoverableError } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('email')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    const attemptsMade = job.attemptsMade;
    this.logger.log(`\n--- Job ${job.id} (Attempt: ${attemptsMade + 1}) is active! ---`);
    
    const { studentId, courseName, isInvalidEmail } = job.data;
    
    // 1. จำลอง Permanent Failure (ล้มเหลวถาวร)
    // ถ้ารหัสประจำตัวนักศึกษาถูกส่งมาพร้อม flag ว่าอีเมลปลอม/ผิด 
    // เราไม่ควรจะพยายาม retry ซ้ำให้เสียเวลา (และเปลืองทรัพยากร)
    if (isInvalidEmail) {
      this.logger.error(`[Permanent Failure] Email address for Student ${studentId} is invalid. Do not retry.`);
      // การโยน UnrecoverableError ใน BullMQ จะหยุดการ retry และย้ายงานไปที่ failed ทันที
      throw new UnrecoverableError('Invalid email address');
    }

    // 2. จำลอง Transient Failure (ล้มเหลวชั่วคราว)
    // สมมติว่า SMTP Server ล่ม และต้องใช้เวลาสักพักกว่าจะกลับมา
    // เราจะให้มันพังใน 2 attempt แรก
    if (attemptsMade < 2) {
      this.logger.warn(`[Transient Failure] SMTP server timeout for Student ${studentId}. Needs retry.`);
      // การโยน Error ทั่วไป จะทำให้ BullMQ ทำการ retry ตามที่ตั้งค่าไว้ (exponential backoff)
      throw new Error('SMTP connection timeout');
    }

    // ถ้ารอดมาได้จนถึง attempt ที่ 3 หรือไม่มี error ก็ทำงานปกติ
    this.logger.log(`Sending mock email to Student ${studentId} for course: ${courseName}...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.logger.log(`✅ Email successfully sent for Job ${job.id}`);
    
    return { status: 'completed', time: new Date() };
  }
}
