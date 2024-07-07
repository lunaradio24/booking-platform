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
import { Show } from 'src/show/entities/show.entity';

@Entity({ name: 'bookings' })
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int', nullable: false })
  userId: number;

  @Column({ name: 'show_id', type: 'int', nullable: false })
  showId: number;

  @Column({ name: 'seat_num', type: 'int' })
  seatNum: number;

  @Column({ type: 'enum', enum: Grade })
  grade: Grade;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'enum', enum: BookingStatus })
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

  @ManyToOne(() => Show, (show) => show.booking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'show_id', referencedColumnName: 'id' })
  show: Show;
}
