import { Controller, Get, Post, Body, Param, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { RedisService } from './redis/redis.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('publish')
  async publishEvent(@Body() body: { message: any }) {
    await this.redisService.publish('test.event', body.message);
    return { status: 'Message published', message: body.message };
  }

  @Post('redis/set')
  async setRedisValue(@Body() body: { key: string; value: string }) {
    await this.cacheManager.set(body.key, body.value, 60000); // ttl 60 seconds
    return { message: 'Value set in Redis', key: body.key, value: body.value };
  }

  @Get('redis/get/:key')
  async getRedisValue(@Param('key') key: string) {
    const value = await this.cacheManager.get(key);
    return { key, value: value || null };
  }
}
