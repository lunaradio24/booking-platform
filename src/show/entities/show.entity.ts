import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Category } from '../types/category.type';
import { Booking } from 'src/booking/entities/booking.entity';
import { ShowDate } from './show-date.entity';
import { SeatsByGrades } from '../types/ticket-prices.type';

@Entity({ name: 'shows' })
export class Show {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'enum', enum: Category })
  category: Category;

  @Column({ type: 'varchar' })
  location: string;

  @Column({ type: 'varchar' })
  image: string;

  @Column({ type: 'json' })
  schedules: string[];

  @Column({ type: 'int' })
  runtime: number;

  @Column({ name: 'num_seats', type: 'json' })
  numSeats: Partial<SeatsByGrades>;

  @Column({ name: 'ticket_prices', type: 'json' })
  ticketPrices: Partial<SeatsByGrades>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ShowDate, (showDate) => showDate.show, { cascade: true })
  showDate: ShowDate[];

  @OneToMany(() => Booking, (booking) => booking.show, { cascade: true })
  booking: Booking[];
}
