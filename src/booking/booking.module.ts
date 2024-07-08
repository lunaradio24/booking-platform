import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seat } from 'src/seat/entities/seat.entity';
import { Booking } from './entities/booking.entity';
import { ShowDate } from 'src/show/entities/show-date.entity';
import { User } from 'src/user/entities/user.entity';
import { TransactionLog } from 'src/transaction-log/entities/transaction-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Seat, Booking, ShowDate, User, TransactionLog])],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
