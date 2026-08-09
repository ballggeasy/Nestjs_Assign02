import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'int', default: 1 })
  availableSeats: number;
}
