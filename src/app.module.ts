import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentsModule } from './students/students.module';
import { CoursesModule } from './courses/courses.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { RedisModule } from './redis/redis.module';
import { BullModule } from '@nestjs/bullmq';
import { EmailModule } from './email/email.module';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        base: { instanceId: process.env.INSTANCE_ID || 'unknown' },
        genReqId: (req) => req.headers['x-request-id'] || randomUUID(),
        redact: {
          paths: ['req.headers.authorization', 'req.headers.cookie', 'req.body.password', 'req.body.token'],
          censor: '[REDACTED]'
        }
      },
    }),
    ConfigModule.forRoot(),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
          },
        }),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      replication: {
        master: {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_NAME || 'lab3_db',
        },
        slaves: [
          {
            // Note: Since this is run inside docker-compose with backend instances, the hostname is 'db_replica' and port '5432' (internal port)
            // But we can fallback to localhost:5433 for external access if needed. Let's use env vars.
            host: process.env.DB_REPLICA_HOST || 'db_replica',
            port: parseInt(process.env.DB_REPLICA_PORT || '5432', 10),
            username: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_NAME || 'lab3_db',
          }
        ]
      },
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // ปิดการใช้งาน synchronize ตามโจทย์
    }),
    StudentsModule,
    CoursesModule,
    RedisModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
