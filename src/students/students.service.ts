import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import type { RedisClientType } from 'redis';
import { REDIS_CLIENT } from './redis.constants';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsRepository } from './students.repository';

@Injectable()
export class StudentsService {
  private activeQueries = new Map<string, Promise<any>>();

  constructor(
    private readonly studentsRepository: StudentsRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType,
  ) {}

  create(createStudentDto: CreateStudentDto) {
    return this.studentsRepository.create(createStudentDto);
  }

  async getSummaryReport() {
    const cacheKey = 'students:summary';
    
    // 1. Check Redis Cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      console.log('[Cache Hit] Returning summary report');
      return cached;
    }

    // 2. Lock-based approach (Promise Deduplication)
    // ถ้าระหว่างนี้มีคนกำลัง Query คีย์นี้อยู่ (มี Lock) ให้รอและเอาผลลัพธ์จากคิวรี่แรกไปเลย ไม่ต้องไปต่อ DB ใหม่
    if (this.activeQueries.has(cacheKey)) {
      console.log('🔒 [Lock] Request is waiting for existing database query to finish...');
      return this.activeQueries.get(cacheKey);
    }

    // 3. ถ้าไม่มีคน Query อยู่ ให้สร้าง Promise ขึ้นมาใหม่และเก็บไว้ใน activeQueries เพื่อเป็น Lock
    const promise = (async () => {
      console.log('[Cache Miss] 🚀 Generating heavy summary report... (3 seconds)');
      // Simulate heavy query
      await new Promise(resolve => setTimeout(resolve, 3000));
      const report = { totalStudents: await this.studentsRepository.findAll().then(res => res.length), generatedAt: new Date() };
      
      // Save to Redis
      await this.cacheManager.set(cacheKey, report, 5000);
      console.log('[Cache Set] Summary report cached');
      
      // ปลด Lock ออกเมื่อทำงานเสร็จ
      this.activeQueries.delete(cacheKey);
      
      return report;
    })();

    // เซ็ต Lock ทันทีที่ Request แรกเข้ามา
    this.activeQueries.set(cacheKey, promise);

    return promise;
  }

  findAll() {
    return this.studentsRepository.findAll();
  }

  async findOne(id: number) {
    const cacheKey = `students:${id}`;
    
    // 1. Check Redis (Cache Hit)
    const cachedStudent = await this.cacheManager.get(cacheKey);
    if (cachedStudent) {
      console.log(`[Cache Hit] Redis: found student ${id}`);
      return cachedStudent;
    }

    // 2. Query Database (Cache Miss)
    console.log(`[Cache Miss] PostgreSQL: querying student ${id}`);
    const student = await this.studentsRepository.findOne(id);

    // 3. Save to Redis with TTL
    if (student) {
      // TTL 60 วินาที (60000 ms)
      await this.cacheManager.set(cacheKey, student, 60000);
    }

    return student;
  }

  async update(id: number, updateStudentDto: UpdateStudentDto) {
    const result = await this.studentsRepository.update(id, updateStudentDto);
    
    // Cache Invalidation
    const cacheKey = `students:${id}`;
    await this.cacheManager.del(cacheKey);
    console.log(`[Cache Invalidated] Redis: deleted student ${id} on update`);

    return result;
  }

  async incrementViewsNonAtomic(id: number) {
    const viewKey = `students:${id}:views`;
    // 1. Get current value (อ่านค่าจาก Redis โดยตรงเพื่อให้ได้ตัวเลข)
    const raw = await this.redisClient.get(viewKey);
    let views = raw ? parseInt(raw, 10) : 0;
    
    // Simulate slight delay (like processing time) to trigger race condition
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // 2. Increment
    views++;
    
    // 3. Set back (เก็บเป็น String ตรงๆ เหมือน Redis INCR)
    await this.redisClient.set(viewKey, views.toString());
    
    return { views };
  }

  async incrementViewsAtomic(id: number) {
    const viewKey = `students:${id}:views`;
    // INCR เป็น Atomic operation ของ Redis - ปลอดภัยจาก Race Condition
    const views = await this.redisClient.incr(viewKey);
    return { views };
  }

  async resetViews(id: number) {
    const viewKey = `students:${id}:views`;
    await this.redisClient.del(viewKey);
    return { views: 0 };
  }

  async sendWelcomeEmail(id: number) {
    const lockKey = `lock:students:${id}:send-email`;
    
    // 1. Acquire Lock (SETNX + TTL 5 วินาที เพื่อกัน Deadlock)
    const acquired = await this.redisClient.set(lockKey, 'locked', {
      NX: true, // Set if Not eXists
      PX: 5000, // TTL in milliseconds
    });

    if (!acquired) {
      console.log(`❌ [Lock Rejected] Someone is already sending an email to student ${id}.`);
      return { status: 'rejected', message: 'Email is already being sent. Please try again later.' };
    }

    try {
      console.log(`✅ [Lock Acquired] Sending email to student ${id}...`);
      
      // 2. Simulate sending email (ใช้เวลา 2 วินาที)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(`✉️ [Email Sent] Successfully sent to student ${id}`);
      return { status: 'success', message: 'Welcome email sent successfully.' };
    } finally {
      // 3. Release Lock
      await this.redisClient.del(lockKey);
      console.log(`🔓 [Lock Released] Lock for student ${id} removed.`);
    }
  }

  async getViews(id: number) {
    const viewKey = `students:${id}:views`;
    const raw = await this.redisClient.get(viewKey);
    return { views: raw ? parseInt(raw, 10) : 0 };
  }

  async remove(id: number) {
    const result = await this.studentsRepository.remove(id);

    // Cache Invalidation
    const cacheKey = `students:${id}`;
    await this.cacheManager.del(cacheKey);
    console.log(`[Cache Invalidated] Redis: deleted student ${id} on remove`);

    return result;
  }
}
