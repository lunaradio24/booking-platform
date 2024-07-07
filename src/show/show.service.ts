import { ConflictException, Injectable } from '@nestjs/common';
import { CreateShowDto } from './dto/create-show.dto';
import { UpdateShowDto } from './dto/update-show.dto';
import { DataSource, Like, Repository } from 'typeorm';
import { Show } from './entities/show.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ShowDate } from './entities/show-date.entity';
import { calculateEndTime } from 'src/utils/functions/calculate-endtime.function';
import { dateTimeTransformer } from 'src/utils/functions/datetime-transform.function';
import { Seat } from 'src/seat/entities/seat.entity';
import { ShowCategory } from './types/category.type';
import { scheduled } from 'rxjs';

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

  async findAll(category: ShowCategory | undefined, search: string | undefined) {
    return await this.showRepository.find({
      where: { category, title: search ? Like(`%${search}%`) : undefined },
      select: ['id', 'title', 'category', 'location', 'schedules'],
    });
  }

  async findOne(id: number) {
    const show = await this.showRepository.findOne({
      where: { id },
      relations: ['showDate'],
    });

    const { showDate: showDates, ...showInfo } = show;
    // 현재 시간을 기준으로 예약 가능 여부 추가
    const { date: currentDate, time: currentTime } = dateTimeTransformer(new Date().toISOString());
    const showDatesWithBookability = showDates.map((showDate) => {
      const isBookable = currentDate < showDate.date || (currentDate === showDate.date && currentTime < showDate.time);
      return { ...showDate, isBookable };
    });

    return { showInfo, showDatesWithBookability };
  }

  async update(id: number, updateShowDto: UpdateShowDto) {
    return `This action updates a #${id} show`;
  }

  async remove(id: number) {
    return `This action removes a #${id} show`;
  }
}
