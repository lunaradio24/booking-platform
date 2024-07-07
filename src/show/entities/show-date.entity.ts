import { Seat } from 'src/seat/entities/seat.entity';
import { Show } from 'src/show/entities/show.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SeatsByGrades } from '../types/ticket-prices.type';

@Entity({ name: 'show_dates' })
export class ShowDate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'show_id', type: 'int', nullable: false })
  showId: number;

  @Column({ type: 'varchar' })
  date: string;

  @Column({ type: 'varchar' })
  time: string;

  @Column({ name: 'cancelable_date', type: 'varchar' })
  cancelableDate: string;

  @Column({ name: 'remain_seats', type: 'json' })
  remainSeats: Partial<SeatsByGrades>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Show, (show) => show.showDate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'show_id', referencedColumnName: 'id' })
  show: Show;

  @OneToMany(() => Seat, (seat) => seat.showDate)
  seat: Seat;
}
