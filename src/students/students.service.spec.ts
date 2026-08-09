import { Test, TestingModule } from '@nestjs/testing';
import { StudentsService } from './students.service';
import { StudentsRepository } from './students.repository';

describe('StudentsService', () => {
  let service: StudentsService;
  let mockRepo: any;

  beforeEach(async () => {
    // จำลอง (Mock) ฟังก์ชันต่างๆ ของ Repository
    mockRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        {
          provide: StudentsRepository,
          useValue: mockRepo, // ฉีด mockRepo แทนของจริง
        },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new student successfully', () => {
    const dto = { studentId: '6610110232', name: 'Test Student', email: 'test@example.com' };
    const expectedResult = { id: 1, ...dto };

    // กำหนดพฤติกรรมว่าถ้า mockRepo.create ถูกเรียก จะต้อง return ค่าอะไร
    mockRepo.create.mockReturnValue(expectedResult);

    // ทดสอบรันฟังก์ชันใน Service
    const result = service.create(dto);

    // ตรวจสอบว่า mockRepo.create ถูกเรียกใช้งานอย่างถูกต้องด้วย DTO ที่ส่งไปหรือไม่
    expect(mockRepo.create).toHaveBeenCalledWith(dto);
    // ตรวจสอบว่าผลลัพธ์จาก Service ตรงตามที่คาดหวังหรือไม่
    expect(result).toEqual(expectedResult);
  });
});
