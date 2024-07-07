import { Grade } from 'src/booking/types/grade.type';
import { ShowDate } from 'src/show/entities/show-date.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'seats' })
export class Seat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'show_date_id', type: 'int', nullable: false })
  showDateId: number;

  @Column({ name: 'seat_num', type: 'int' })
  seatNum: number;

  @Column({ type: 'enum', enum: Grade })
  grade: Grade;

  @Column({ type: 'int' })
  price: number;

  @Column({ name: 'is_booked', type: 'boolean', default: false })
  isBooked: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ShowDate, (showDate) => showDate.seat)
  @JoinColumn({ name: 'show_date_id', referencedColumnName: 'id' })
  showDate: ShowDate;
}
