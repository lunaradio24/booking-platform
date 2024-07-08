import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe, Query, UseGuards, Request } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/utils/decorators/roles.decorator';

@Controller('bookings')
@UseGuards(AccessTokenGuard, RoleGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @Roles(['USER'])
  async create(@Request() req: any, @Body() createBookingDto: CreateBookingDto) {
    const userId = req.user.id;
    const newBooking = await this.bookingService.create(userId, createBookingDto);
    return {
      message: '공연 예매 예약상태입니다. 10분 이내 미결제시 자동으로 취소됩니다.',
      data: newBooking,
    };
  }

  @Get('my')
  @Roles(['USER'])
  async findAll(@Request() req: any, @Query('sort') sort: string) {
    const userId = req.user.id;
    const myBookingList = this.bookingService.findAll(userId, sort);
    return {
      message: '예매 목록 조회',
      data: myBookingList,
    };
  }

  @Get(':bookingId')
  async findOne(@Request() req: any, @Param('bookingId', ParseIntPipe) bookingId: number) {
    const userId = req.user.id;
    return this.bookingService.findOne(userId, bookingId);
  }

  @Patch(':bookingId/cancel')
  @Roles(['USER'])
  async cancel(@Request() req: any, @Param('bookingId', ParseIntPipe) bookingId: number) {
    const userId = req.user.id;
    return this.bookingService.cancel(userId, bookingId);
  }

  @Patch(':bookingId/confirm')
  @Roles(['ADMIN', 'MANAGER'])
  async confirm(@Param('bookingId', ParseIntPipe) bookingId: number) {
    return this.bookingService.confirm(bookingId);
  }
}
