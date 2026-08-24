import { Controller, Get, Post, Body, Param, Inject, InternalServerErrorException } from '@nestjs/common';
import { AppService } from './app.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { RedisService } from './redis/redis.service';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly redisService: RedisService,
    private readonly dataSource: DataSource,
  ) {}

  @Get('health')
  async checkHealth() {
    try {
      // 1. Check Database (Readiness)
      const isDbConnected = this.dataSource.isInitialized;
      if (!isDbConnected) throw new Error('Database not initialized');
      await this.dataSource.query('SELECT 1');

      // 2. Check Redis (Readiness)
      // using ping to check if redis is responding
      await this.redisService.getRedisClient().ping();

      return { 
        status: 'ok', 
        instanceId: process.env.INSTANCE_ID || 'unknown',
        database: 'connected',
        redis: 'connected'
      };
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        instanceId: process.env.INSTANCE_ID || 'unknown',
        message: error.message
      });
    }
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('instance')
  getInstanceId() {
    return { instanceId: process.env.INSTANCE_ID || 'unknown' };
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
