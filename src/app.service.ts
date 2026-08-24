import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RedisService } from './redis/redis.service';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly redisService: RedisService) {}

  onModuleInit() {
    // Subscribe to test event (Part 1)
    this.redisService.subscribe('test.event', (message) => {
      this.logger.log(`Received test.event with message: ${JSON.stringify(message)}`);
    });

    // Subscribe to enrollment created event (Part 2)
    this.redisService.subscribe('course.enrollment.created', (payload) => {
      this.logger.log({
        req: { id: payload.reqId }, // Use req.id format to match pino-http correlation ID format
        msg: `🎉 [Subscriber] Received Enrollment Event: ${JSON.stringify(payload)}`
      });
    });
  }

  getHello(): string {
    return 'Hello World!';
  }
}
