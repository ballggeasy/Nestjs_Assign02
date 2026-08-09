import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { StudentsRepository } from './students.repository';

@Module({
  controllers: [StudentsController],
  providers: [
    StudentsService,
    {
      provide: StudentsRepository,
      useClass: StudentsRepository, // สามารถเปลี่ยนเป็น MockStudentsRepository ได้เพื่อจำลอง Dependency Injection
    },
  ],
})
export class StudentsModule {}
