import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Show } from '../entities/show.entity';
import { OmitType } from '@nestjs/mapped-types';
import { SeatsByGrades } from '../types/ticket-prices.type';
import { ShowCategory } from '../types/category.type';
import { Type } from 'class-transformer';

export class CreateShowDto extends OmitType(Show, ['id', 'createdAt', 'updatedAt']) {
  @IsString()
  @IsNotEmpty({ message: '공연 제목을 입력해주세요.' })
  readonly title: string;

  @IsString()
  @IsNotEmpty({ message: '공연 설명을 입력해주세요.' })
  readonly description: string;

  @IsEnum(ShowCategory)
  @IsNotEmpty({ message: '공연 분류를 입력해주세요' })
  readonly category: ShowCategory;

  @IsString()
  @IsNotEmpty({ message: '공연 장소를 입력해주세요' })
  readonly location: string;

  @IsString()
  @IsNotEmpty({ message: '공연 이미지를 입력해주세요.' })
  readonly image: string;

  @IsArray()
  @ArrayNotEmpty({ message: '공연 날짜와 시간을 입력해주세요.' })
  @Type(() => String)
  @IsString({ each: true, message: '공연 날짜/시간은 문자열이어야 합니다.' })
  readonly schedules: string[];

  @IsInt()
  @IsPositive({ message: '공연 시간은 양수이어야 합니다.' })
  @IsNotEmpty({ message: '공연 시간을 입력해주세요.' })
  readonly runtime: number;

  @IsObject()
  @ValidateNested()
  @Type(() => SeatsByGrades)
  @IsNotEmpty({ message: '좌석 수를 입력해주세요.' })
  readonly numSeats: Partial<SeatsByGrades>;

  @IsObject()
  @ValidateNested()
  @Type(() => SeatsByGrades)
  @IsNotEmpty({ message: '티켓 가격을 입력해주세요.' })
  readonly ticketPrices: Partial<SeatsByGrades>;
}
