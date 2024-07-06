import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Category } from '../types/category.type';
import { Booking } from 'src/booking/entities/booking.entity';
import { ShowDate } from 'src/show-date/entities/show-date.entity';
import { TicketPrices } from '../types/ticket-prices.type';

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
  schedule: string[];

  @Column({ type: 'int' })
  runtime: number;

  @Column({ type: 'json' })
  ticketPrices: TicketPrices;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ShowDate, (showDate) => showDate.show)
  showDate: ShowDate[];

  @OneToMany(() => Booking, (booking) => booking.show)
  booking: Booking[];
}
