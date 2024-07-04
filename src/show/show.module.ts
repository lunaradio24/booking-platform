import { Module } from '@nestjs/common';
import { ShowService } from './show.service';
import { ShowController } from './show.controller';
import { Show } from './entities/show.entity';
import { ShowDate } from 'src/show-date/entities/show-date.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Show, ShowDate])],
  controllers: [ShowController],
  providers: [ShowService],
})
export class ShowModule {}
