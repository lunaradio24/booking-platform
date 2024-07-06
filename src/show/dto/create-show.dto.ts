import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsObject, IsPositive, IsString, ValidateNested } from 'class-validator';
import { Show } from '../entities/show.entity';
import { OmitType } from '@nestjs/mapped-types';
import { TicketPrices } from '../types/ticket-prices.type';
import { Category } from '../types/category.type';
import { Type } from 'class-transformer';

export class CreateShowDto extends OmitType(Show, ['id', 'createdAt', 'updatedAt']) {
  @IsString()
  @IsNotEmpty({ message: '공연 제목을 입력해주세요.' })
  readonly title: string;

  @IsString()
  @IsNotEmpty({ message: '공연 설명을 입력해주세요.' })
  readonly description: string;

  @IsEnum(Category)
  @IsNotEmpty({ message: '공연 분류를 입력해주세요' })
  readonly category: Category;

  @IsString()
  @IsNotEmpty({ message: '공연 장소를 입력해주세요' })
  readonly location: string;

  @IsString()
  @IsNotEmpty({ message: '공연 이미지를 입력해주세요.' })
  readonly image: string;

  @IsArray()
  @IsString({ each: true, message: '각 공연 날짜는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '공연 날짜를 입력해주세요.' })
  readonly schedule: string[];

  @IsNumber()
  @IsPositive({ message: '공연 시간은 양수이어야 합니다.' })
  @IsNotEmpty({ message: '공연 시간을 입력해주세요.' })
  readonly runtime: number;

  @IsObject()
  @ValidateNested()
  @Type(() => TicketPrices)
  @IsNotEmpty({ message: '티켓 가격을 입력해주세요.' })
  readonly ticketPrices: TicketPrices;
}
