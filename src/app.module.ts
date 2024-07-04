import Joi from 'joi';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { ShowModule } from './show/show.module';
import { BookingModule } from './booking/booking.module';
import { SeatModule } from './seat/seat.module';
import { RefreshTokenModule } from './refresh-token/refresh-token.module';
import { TransactionLogModule } from './transaction-log/transaction-log.module';
import { ShowDateService } from './show-date/show-date.service';
import { Booking } from './booking/entities/booking.entity';
import { RefreshToken } from './refresh-token/entities/refresh-token.entity';
import { Show } from './show/entities/show.entity';
import { Seat } from './seat/entities/seat.entity';
import { ShowDate } from './show-date/entities/show-date.entity';
import { TransactionLog } from './transaction-log/entities/transaction-log.entity';
import { ShowService } from './show/show.service';

const typeOrmModuleOptions = {
  useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => ({
    namingStrategy: new SnakeNamingStrategy(),
    type: 'mysql',
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    database: configService.get('DB_NAME'),
    entities: [User, Booking, RefreshToken, Show, ShowDate, Seat, TransactionLog],
    synchronize: configService.get('DB_SYNC'),
    logging: true,
  }),
  inject: [ConfigService],
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_PASSPORT_KEY: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_NAME: Joi.string().required(),
        DB_SYNC: Joi.boolean().required(),
      }),
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    AuthModule,
    UserModule,
    ShowModule,
    BookingModule,
    SeatModule,
    RefreshTokenModule,
    TransactionLogModule,
  ],
  controllers: [],
  providers: [ShowService, ShowDateService],
})
export class AppModule {}
