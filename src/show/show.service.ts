import { ConflictException, Injectable } from '@nestjs/common';
import { CreateShowDto } from './dto/create-show.dto';
import { UpdateShowDto } from './dto/update-show.dto';
import { DataSource, Repository } from 'typeorm';
import { Show } from './entities/show.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ShowDate } from './entities/show-date.entity';
import { calculateEndTime } from 'src/utils/functions/calculate-endtime.function';
import { dateTimeTransformer } from 'src/utils/functions/datetime-transform.function';
import { Seat } from 'src/seat/entities/seat.entity';
import { SeatsByGrades } from './types/ticket-prices.type';

@Injectable()
export class ShowService {
  constructor(
    @InjectRepository(Show)
    private readonly showRepository: Repository<Show>,
    @InjectRepository(ShowDate)
    private readonly showDateRepository: Repository<ShowDate>,
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
    private dataSource: DataSource,
  ) {}

  async create(createShowDto: CreateShowDto) {
    const { location, schedules, runtime, numSeats, ticketPrices } = createShowDto;

    // 같은 장소, 시간대에 등록된 공연이 있는지 확인
    for (const schedule of schedules) {
      const { date, time } = dateTimeTransformer(schedule);
      const startTimeOfNewShow = Number(time);
      const endTimeOfNewShow = calculateEndTime(startTimeOfNewShow, runtime);

      // 같은 날짜 공연 검색
      const showsOnSameDate = await this.showDateRepository.find({
        where: { date },
        relations: ['show'],
      });

      for (const showDate of showsOnSameDate) {
        const startTimeOfExistingShow = Number(showDate.time);
        const endTimeOfExistingShow = calculateEndTime(startTimeOfExistingShow, showDate.show.runtime);

        // 장소 충돌
        const locationConflict = showDate.show.location.trim() === location.trim();
        // 시간 충돌
        const timeConflict = !(
          endTimeOfExistingShow < startTimeOfNewShow || endTimeOfNewShow < startTimeOfExistingShow
        );

        if (locationConflict && timeConflict) {
          throw new ConflictException('등록할 공연과 장소와 시간이 겹치는 공연이 있습니다.');
        }
      }
    }

    let createdShow: Show;
    // 트랜잭션 시작
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // (1) show 테이블에 저장
      createdShow = await this.showRepository.save(createShowDto);

      // showDate 테이블에 저장할 레코드 배열로 가공
      const showDateEntities = schedules.map((schedule) => {
        const { date, time } = dateTimeTransformer(schedule);
        const cancelableDate = date + String(Number(time) - 300);

        return {
          showId: createdShow.id,
          date,
          time,
          cancelableDate,
          remainSeats: numSeats,
        };
      });

      // (2) showDate 테이블에 저장
      const createdShowDates = await this.showDateRepository.save(showDateEntities);
      console.log(createdShowDates);

      // (3) showDate 날짜별로 seats 테이블에 저장
      for (const showDate of createdShowDates) {
        // seats 테이블에 저장할 레코드 배열로 가공
        const seatEntities = [];
        for (const grade in numSeats) {
          for (let i = 0; i < numSeats[grade]; i++) {
            seatEntities.push({
              showDateId: showDate.id,
              seatNum: seatEntities.length + 1,
              grade: grade,
              price: ticketPrices[grade],
            });
          }
        }
        // seats 테이블에 저장
        await this.seatRepository.save(seatEntities);
      }

      // 트랜잭션 종료
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return createdShow;
  }

  async findAll() {
    return `This action returns all show`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} show`;
  }

  async update(id: number, updateShowDto: UpdateShowDto) {
    return `This action updates a #${id} show`;
  }

  async remove(id: number) {
    return `This action removes a #${id} show`;
  }
}
