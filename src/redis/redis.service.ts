import { Inject, Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(
    @Inject('REDIS_PUBLISHER_CLIENT') private readonly publisherClient: Redis,
    @Inject('REDIS_SUBSCRIBER_CLIENT') private readonly subscriberClient: Redis,
  ) {}

  async publish(channel: string, message: any): Promise<number> {
    this.logger.log(`Publishing to channel: ${channel}`);
    return this.publisherClient.publish(channel, JSON.stringify(message));
  }

  async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    this.logger.log(`Subscribing to channel: ${channel}`);
    await this.subscriberClient.subscribe(channel);
    
    this.subscriberClient.on('message', (ch, message) => {
      if (ch === channel) {
        let parsedMessage;
        try {
          parsedMessage = JSON.parse(message);
        } catch (e) {
          parsedMessage = message;
        }
        callback(parsedMessage);
      }
    });
  }

  onModuleDestroy() {
    this.publisherClient.disconnect();
    this.subscriberClient.disconnect();
  }
}
