import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { StudentsRepository } from './students.repository';
import { Student } from './entities/student.entity';
import { createClient } from 'redis';
import { REDIS_CLIENT } from './redis.constants';

@Module({
  imports: [TypeOrmModule.forFeature([Student])],
  controllers: [StudentsController],
  providers: [
    StudentsService,
    {
      provide: StudentsRepository,
      useClass: StudentsRepository,
    },
    {
      provide: REDIS_CLIENT,
      useFactory: async () => {
        const client = createClient({
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
          },
        });
        await client.connect();
        return client;
      },
    },
  ],
})
export class StudentsModule {}
