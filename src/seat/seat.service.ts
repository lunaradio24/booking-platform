import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Seat } from './entities/seat.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SeatService {
  constructor(
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
  ) {}

  async findAllAvailable(showDateId: number) {
    const seats = await this.seatRepository.find({
      where: { showDateId, isBooked: false },
    });
    return seats.map((seat) => ({
      seatNum: seat.seatNum,
      grade: seat.grade,
      price: seat.price,
    }));
  }
}
