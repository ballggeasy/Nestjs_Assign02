import { Injectable } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsRepository } from './students.repository';

@Injectable()
export class StudentsService {
  constructor(private readonly studentsRepository: StudentsRepository) {}

  create(createStudentDto: CreateStudentDto) {
    return this.studentsRepository.create(createStudentDto);
  }

  findAll() {
    return this.studentsRepository.findAll();
  }

  findOne(id: number) {
    return this.studentsRepository.findOne(id);
  }

  update(id: number, updateStudentDto: UpdateStudentDto) {
    return this.studentsRepository.update(id, updateStudentDto);
  }

  remove(id: number) {
    return this.studentsRepository.remove(id);
  }
}
