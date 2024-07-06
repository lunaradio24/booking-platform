import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ENV } from 'src/common/constants/env.constant';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({ secret: ENV.ACCESS_TOKEN_SECRET_KEY }),
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
