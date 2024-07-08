import { OmitType } from '@nestjs/mapped-types';
import { Booking } from '../entities/booking.entity';
import { Grade } from '../types/grade.type';
import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';

export class CreateBookingDto extends OmitType(Booking, ['id', 'createdAt', 'updatedAt']) {
  @IsInt()
  @IsNotEmpty({ message: 'showDateId를 입력해주세요.' })
  showDateId: number;

  @IsInt()
  @IsNotEmpty({ message: '좌석 번호를 입력해주세요.' })
  seatNum: number;

  @IsEnum(Grade)
  @IsNotEmpty({ message: '좌석 등급을 입력해주세요.' })
  grade: Grade;

  @IsInt()
  @IsNotEmpty({ message: '티켓 가격을 입력해주세요.' })
  price: number;
}
