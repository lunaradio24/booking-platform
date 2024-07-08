import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { DataSource, Repository } from 'typeorm';
import { BookingStatus } from './types/booking-status.type';
import { TransactionLog } from 'src/transaction-log/entities/transaction-log.entity';
import { ConfigService } from '@nestjs/config';
import { TransactionType } from 'src/transaction-log/types/transaction-type.type';
import { User } from 'src/user/entities/user.entity';
import { Seat } from 'src/seat/entities/seat.entity';
import { dateTimeTransformer } from 'src/utils/functions/datetime-transform.function';
import { ShowDate } from 'src/show/entities/show-date.entity';
import { SeatsByGrades } from 'src/show/types/ticket-prices.type';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(ShowDate)
    private readonly showDateRepository: Repository<ShowDate>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TransactionLog)
    private readonly transactionLogRepository: Repository<TransactionLog>,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: number, createBookingDto: CreateBookingDto) {
    const { showDateId, seatNum } = createBookingDto;
    const seat = await this.seatRepository.findOne({
      where: { showDateId, seatNum },
    });
    if (!seat) {
      throw new NotFoundException('존재하지 않는 좌석입니다.');
    }
    if (seat.isBooked) {
      throw new BadRequestException('예약된 좌석입니다. 다른 좌석을 선택해주세요.');
    }

    return await this.bookingRepository.save({ userId, createBookingDto });
  }

  async findAll(userId: number, sort: string) {
    const sortOption = sort?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    return await this.bookingRepository.find({
      where: { userId },
      order: { createdAt: sortOption },
      select: ['id', 'showDateId', 'seatNum', 'grade', 'price', 'status', 'createdAt'],
    });
  }

  async findOne(userId: number, bookingId: number) {
    const booking = await this.bookingRepository.findOneBy({ id: bookingId });
    // 존재하는 예매인지 확인
    if (!booking) {
      throw new NotFoundException('존재하지 않는 예매입니다.');
    }

    // 예매자 본인인지 확인
    if (booking.userId !== userId) {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }

    return booking;
  }

  async cancel(userId: number, bookingId: number) {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['showDate'],
    });

    // 존재하는 예매인지 확인
    if (!booking) {
      throw new NotFoundException('존재하지 않는 예매입니다.');
    }

    // 예매자 본인인지 확인
    if (booking.userId !== userId) {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }

    // 취소된 예매인지 확인
    const prevStatus = booking.status;
    if (prevStatus === BookingStatus.CANCELLED) {
      throw new BadRequestException('이미 취소된 예매입니다.');
    }

    // 결제 이전 상태인 경우
    if (prevStatus === BookingStatus.PENDING) {
      await this.bookingRepository.update({ id: bookingId }, { status: BookingStatus.CANCELLED });
    }

    // 결제완료한 상태인 경우
    if (prevStatus === BookingStatus.BOOKED) {
      // 예매 취소 가능 시간이 지났는지 확인
      const { date: currentDate, time: currentTime } = dateTimeTransformer(new Date().toISOString());
      const currentDateTime = currentDate + currentTime;
      const cancelableDateTime = booking.showDate.cancelableDate;

      if (currentDateTime > cancelableDateTime) {
        throw new BadRequestException('예매 취소가 가능한 날짜/시간이 지났습니다.');
      }

      const adminId = Number(this.configService.get('ADMIN_ID'));
      const amountOfRefund = booking.price;
      // 트랜잭션
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction('SERIALIZABLE');
      try {
        // USER 포인트 증가 (환불)
        await this.userRepository.increment({ id: userId }, 'points', amountOfRefund);
        // ADMIN 포인트 감소
        await this.userRepository.decrement({ id: adminId }, 'points', amountOfRefund);
        // 상태 변경
        await this.bookingRepository.update({ id: bookingId }, { status: BookingStatus.CANCELLED });
        // 거래 기록
        await this.transactionLogRepository.insert({
          senderId: adminId,
          receiverId: userId,
          type: TransactionType.REFUND,
          amount: amountOfRefund,
        });

        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
      }
    }
    return await this.bookingRepository.update({ id: bookingId }, { status: BookingStatus.CANCELLED });
  }

  async confirm(bookingId: number) {
    // 존재하는 예매인지 확인
    const booking = await this.bookingRepository.findOneBy({ id: bookingId });
    if (!booking) {
      throw new NotFoundException('존재하지 않는 예매입니다.');
    }

    const prevStatus = booking.status;
    // 취소된 예매인지 확인
    if (prevStatus === BookingStatus.CANCELLED) {
      throw new BadRequestException('취소된 예매입니다.');
    }

    // 결제된 상태인지 확인
    if (prevStatus === BookingStatus.BOOKED) {
      throw new BadRequestException('이미 결제완료된 예매입니다.');
    }

    // 결제 대기 상태인 경우
    if (prevStatus === BookingStatus.PENDING) {
      const adminId = Number(this.configService.get('ADMIN_ID'));
      const userId = booking.userId;
      const amountOfPayment = booking.price;
      const grade = booking.grade;

      // 포인트가 부족한지 확인
      const user = await this.userRepository.findOneBy({ id: userId });
      if (user.points < amountOfPayment) {
        throw new BadRequestException('포인트가 부족합니다.');
      }

      // 트랜잭션
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction('SERIALIZABLE');
      try {
        // USER 포인트 감소 (결제)
        await this.userRepository.decrement({ id: userId }, 'points', amountOfPayment);
        // ADMIN 포인트 증가
        await this.userRepository.increment({ id: adminId }, 'points', amountOfPayment);
        // 예매 상태 변경
        await this.bookingRepository.update({ id: bookingId }, { status: BookingStatus.BOOKED });
        // 좌석 상태 변경
        await this.seatRepository.update({ id: booking.seatId }, { isBooked: true });

        // 예매 가능한 좌석 수 감소
        const showDate = await this.showDateRepository.findOneBy({ id: booking.showDateId });
        const remainSeats = showDate.remainSeats as SeatsByGrades;
        if (remainSeats[grade] > 0) remainSeats[grade]--;
        await this.showDateRepository.update({ id: booking.showDateId }, { remainSeats });

        // 거래 기록
        await this.transactionLogRepository.insert({
          senderId: userId,
          receiverId: adminId,
          type: TransactionType.PAYMENT,
          amount: amountOfPayment,
        });

        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
      }
    }
    return booking.id;
  }
}
