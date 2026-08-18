import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get('summary/report')
  getSummaryReport() {
    return this.studentsService.getSummaryReport();
  }

  @Get()
  findAll() {
    return this.studentsService.findAll();
  }

  @Get(':id/views')
  getViews(@Param('id') id: string) {
    return this.studentsService.getViews(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(+id);
  }

  @Post(':id/views/non-atomic')
  incrementViewsNonAtomic(@Param('id') id: string) {
    return this.studentsService.incrementViewsNonAtomic(+id);
  }

  @Post(':id/views/atomic')
  incrementViewsAtomic(@Param('id') id: string) {
    return this.studentsService.incrementViewsAtomic(+id);
  }

  @Post(':id/views/reset')
  resetViews(@Param('id') id: string) {
    return this.studentsService.resetViews(+id);
  }

  @Post(':id/send-email')
  sendWelcomeEmail(@Param('id') id: string) {
    return this.studentsService.sendWelcomeEmail(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(+id, updateStudentDto);
  }

  @Delete()
  remove(@Body('id') id: string) {
    return this.studentsService.remove(+id);
  }
}
