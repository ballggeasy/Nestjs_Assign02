import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './entities/student.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StudentsRepository {
  private readonly filePath = path.join(process.cwd(), 'students.json');
  private students: Student[] = [];
  private currentId = 1;

  constructor() {
    this.loadFromFile();
  }

  private loadFromFile() {
    if (fs.existsSync(this.filePath)) {
      const data = fs.readFileSync(this.filePath, 'utf8');
      this.students = JSON.parse(data);
      if (this.students.length > 0) {
        const maxId = Math.max(...this.students.map(s => s.id));
        this.currentId = maxId + 1;
      }
    }
  }

  private saveToFile() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.students, null, 2), 'utf8');
  }

  create(createStudentDto: CreateStudentDto): Student {
    const newStudent: Student = {
      id: this.currentId++,
      ...createStudentDto,
    };
    this.students.push(newStudent);
    this.saveToFile(); // บันทึกลงไฟล์
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
    this.saveToFile(); // บันทึกลงไฟล์
    return student;
  }

  remove(id: number) {
    const index = this.students.findIndex(s => s.id === id);
    if (index >= 0) {
      this.students.splice(index, 1);
      this.saveToFile(); // บันทึกลงไฟล์
    }
    return { deleted: true };
  }
}
