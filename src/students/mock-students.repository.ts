import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class MockStudentsRepository {
  create() {
    throw new InternalServerErrorException('Simulated Database Error: Cannot create student');
  }

  findAll() {
    return [];
  }

  findOne() {
    throw new InternalServerErrorException('Simulated Database Error: Cannot find student');
  }

  update() {
    throw new InternalServerErrorException('Simulated Database Error: Cannot update student');
  }

  remove() {
    throw new InternalServerErrorException('Simulated Database Error: Cannot remove student');
  }
}
