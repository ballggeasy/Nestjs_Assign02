import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { RedisService } from '../redis/redis.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    private readonly redisService: RedisService,
    @InjectQueue('email') private readonly emailQueue: Queue,
  ) {}

  // สร้างคอร์สเรียนเพื่อทดสอบ
  async createCourse(name: string, seats: number) {
    const course = this.courseRepo.create({ name, availableSeats: seats });
    return await this.courseRepo.save(course);
  }

  // สมัครเรียน แบบไม่มีการป้องกัน Race Condition
  async enroll(courseId: number) {
    // 1. อ่านข้อมูลจำนวนที่นั่ง
    const course = await this.courseRepo.findOneBy({ id: courseId });
    if (!course) {
      throw new BadRequestException('Course not found');
    }

    // 2. ตรวจสอบที่นั่งว่าง
    if (course.availableSeats <= 0) {
      throw new BadRequestException('No seats available');
    }

    // จำลอง Delay (สมมติว่ามีการทำงานอื่นแทรก หรือระบบช้า) เพื่อให้เกิด Race Condition ได้ง่ายขึ้นเมื่อยิงพร้อมกัน
    await new Promise(resolve => setTimeout(resolve, 500));

    // 3. ลดจำนวนที่นั่งและบันทึก
    course.availableSeats -= 1;
    await this.courseRepo.save(course);

    return { success: true, seatsLeft: course.availableSeats };
  }

  // สมัครเรียน แบบปลอดภัย (มี Transaction + Pessimistic Lock)
  async enrollSafe(courseId: number, studentId?: number) {
    return await this.courseRepo.manager.transaction(async (manager) => {
      // 1. อ่านข้อมูลจำนวนที่นั่ง พร้อม "ล็อก" แถวข้อมูลนี้ไว้ (คนอื่นรอจนกว่าเราจะ commit)
      const course = await manager.findOne(Course, {
        where: { id: courseId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!course) {
        throw new BadRequestException('Course not found');
      }

      // 2. ตรวจสอบที่นั่งว่าง
      if (course.availableSeats <= 0) {
        throw new BadRequestException('No seats available');
      }

      // จำลอง Delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // 3. ลดจำนวนที่นั่งและบันทึก
      course.availableSeats -= 1;
      await manager.save(course);

      // 4. Publish Event 'enrollment.created'
      const payload = {
        courseId: course.id,
        courseName: course.name,
        studentId: studentId || null,
        timestamp: new Date().toISOString(),
      };
      await this.redisService.publish('course.enrollment.created', payload);

      // 5. Add job to email queue (Part 3 & 4)
      if (studentId) {
        await this.emailQueue.add(
          'sendWelcomeEmail',
          {
            studentId,
            courseName: course.name,
            // ส่งค่าไปเพื่อใช้จำลอง Permanent Failure ใน Part 4
            // (เช่น สมมติว่าถ้า studentId == 999 ให้จำลองว่าเป็นอีเมลปลอม)
            isInvalidEmail: studentId === 999,
          },
          {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 1000,
            },
          },
        );
      }

      return { success: true, seatsLeft: course.availableSeats };
    });
  }
}
