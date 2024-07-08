import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { SeatService } from './seat.service';

@Controller('seats')
export class SeatController {
  constructor(private readonly seatService: SeatService) {}

  @Get('showDate/:showDateId')
  findAllAvailable(@Param('showDateId', ParseIntPipe) showDateId: number) {
    return this.seatService.findAllAvailable(showDateId);
  }
}
