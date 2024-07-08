import { Controller, Get, Patch, Param } from '@nestjs/common';
import { SeatService } from './seat.service';

@Controller('seats')
export class SeatController {
  constructor(private readonly seatService: SeatService) {}

  @Get()
  findAll() {
    return this.seatService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seatService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.seatService.update(+id);
  }
}
