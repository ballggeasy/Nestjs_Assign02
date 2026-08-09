import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { CoursesService } from './courses.service';
import { Course } from './entities/course.entity';

describe('CoursesService (Integration)', () => {
  let service: CoursesService;
  let module: TestingModule;
  let dataSource: DataSource;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_NAME || 'lab3_db',
          entities: [Course],
          synchronize: false,
        }),
        TypeOrmModule.forFeature([Course]),
      ],
      providers: [CoursesService],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    // ปิด DataSource (Database Connection) โดยตรง เพื่อให้ Jest exit ได้สะอาด
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
    if (module) {
      await module.close();
    }
  });

  it('should prevent race conditions when using enrollSafe (Pessimistic Lock)', async () => {
    // 1. สร้างคอร์สใหม่ที่มี 1 ที่นั่ง
    const course = await service.createCourse('Integration Test Course', 1);

    // 2. จำลองการยิง Request พร้อมกัน 2 ตัว
    const results = await Promise.allSettled([
      service.enrollSafe(course.id),
      service.enrollSafe(course.id),
    ]);

    // 3. ตรวจสอบผลลัพธ์: ต้องมี 1 อันที่สำเร็จ และอีก 1 อันต้อง Fail
    const successes = results.filter(r => r.status === 'fulfilled');
    const failures = results.filter(r => r.status === 'rejected');

    expect(successes.length).toBe(1);
    expect(failures.length).toBe(1);

    if (failures[0].status === 'rejected') {
      expect(failures[0].reason.message).toBe('No seats available');
    }
  });
});
