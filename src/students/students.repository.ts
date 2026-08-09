import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './entities/student.entity';

@Injectable()
export class StudentsRepository {
  constructor(
    @InjectRepository(Student)
    private readonly repo: Repository<Student>,
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    const newStudent = this.repo.create(createStudentDto);
    return await this.repo.save(newStudent);
  }

  async findAll(): Promise<Student[]> {
    return await this.repo.find();
  }

  async findOne(id: number): Promise<Student> {
    const student = await this.repo.findOneBy({ id });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async update(id: number, updateStudentDto: UpdateStudentDto): Promise<Student> {
    const student = await this.findOne(id);
    Object.assign(student, updateStudentDto);
    return await this.repo.save(student);
  }

  async remove(id: number) {
    const student = await this.repo.findOneBy({ id });
    if (student) {
      await this.repo.remove(student);
    }
    return { deleted: true };
  }
}
