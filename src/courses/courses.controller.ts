import { Controller, Post, Param, Body, Get, Req } from '@nestjs/common';
import { CoursesService } from './courses.service';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  createCourse(@Body('name') name: string, @Body('seats') seats: number) {
    return this.coursesService.createCourse(name, seats);
  }

  @Get(':id')
  getCourse(@Param('id') id: string) {
    return this.coursesService.getCourse(+id);
  }

  @Post('test-lag')
  testReplicationLag() {
    return this.coursesService.testReplicationLag();
  }

  @Post(':id/enroll')
  enroll(@Param('id') id: string) {
    return this.coursesService.enroll(+id);
  }

  @Post(':id/enroll-safe')
  enrollSafe(@Param('id') id: string, @Body('studentId') studentId?: number, @Req() req?: any) {
    return this.coursesService.enrollSafe(+id, studentId, req?.id);
  }
}
