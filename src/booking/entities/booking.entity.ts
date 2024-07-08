import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Grade } from '../types/grade.type';
import { BookingStatus } from '../types/booking-status.type';
import { User } from 'src/user/entities/user.entity';
import { ShowDate } from 'src/show/entities/show-date.entity';
import { Seat } from 'src/seat/entities/seat.entity';

@Entity({ name: 'bookings' })
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int', nullable: false })
  userId: number;

  @Column({ name: 'show_date_id', type: 'int', nullable: false })
  showDateId: number;

  @Column({ name: 'seat_id', type: 'int', nullable: false })
  seatId: number;

  @Column({ name: 'seat_num', type: 'int' })
  seatNum: number;

  @Column({ type: 'enum', enum: Grade })
  grade: Grade;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // name: Specifies the name of the foreign key column in the database.
  // referencedColumnName: Specifies the name of the column in the referenced (target) entity that the foreign key refers to.
  @ManyToOne(() => User, (user) => user.booking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => ShowDate, (showDate) => showDate.booking)
  @JoinColumn({ name: 'show_date_id', referencedColumnName: 'id' })
  showDate: ShowDate;

  @ManyToOne(() => Seat, (seat) => seat.booking)
  @JoinColumn({ name: 'seat_id', referencedColumnName: 'id' })
  seat: Seat;
}
