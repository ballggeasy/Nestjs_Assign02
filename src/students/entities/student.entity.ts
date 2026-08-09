import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number; // ไอดีอ้างอิงในระบบ (Database ID)

  @Column({ unique: true })
  studentId: string; // รหัสนักศึกษา (เช่น "6610110232")

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: 'pending' })
  applicationStatus: string; // สถานะการสมัคร
}
