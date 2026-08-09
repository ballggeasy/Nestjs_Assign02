import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './entities/student.entity';

@Injectable()
export class StudentsRepository {
  private students: Student[] = [];
  private currentId = 1;

  create(createStudentDto: CreateStudentDto): Student {
    const newStudent: Student = {
      id: this.currentId++,
      ...createStudentDto,
    };
    this.students.push(newStudent);
    return newStudent;
  }

  findAll(): Student[] {
    return this.students;
  }

  findOne(id: number): Student {
    const student = this.students.find(s => s.id === id);
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  update(id: number, updateStudentDto: UpdateStudentDto): Student {
    const student = this.findOne(id);
    Object.assign(student, updateStudentDto);
    return student;
  }

  remove(id: number) {
    const index = this.students.findIndex(s => s.id === id);
    if (index >= 0) {
      this.students.splice(index, 1);
    }
    return { deleted: true };
  }
}
