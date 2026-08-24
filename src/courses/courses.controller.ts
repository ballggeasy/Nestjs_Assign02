import { Controller, Post, Param, Body } from '@nestjs/common';
import { CoursesService } from './courses.service';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  createCourse(@Body('name') name: string, @Body('seats') seats: number) {
    return this.coursesService.createCourse(name, seats);
  }

  @Post(':id/enroll')
  enroll(@Param('id') id: string) {
    return this.coursesService.enroll(+id);
  }

  @Post(':id/enroll-safe')
  enrollSafe(@Param('id') id: string, @Body('studentId') studentId?: number) {
    return this.coursesService.enrollSafe(+id, studentId);
  }
}
