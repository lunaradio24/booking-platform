import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { TransactionLogService } from 'src/transaction-log/transaction-log.service';
import { TransactionLogModule } from 'src/transaction-log/transaction-log.module';
import { TransactionLog } from 'src/transaction-log/entities/transaction-log.entity';
import { LocalStrategy } from './strategies/local.strategy';
import { RefreshToken } from './entities/refresh-token.entity';
import { ENV } from 'src/common/constants/env.constant';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, TransactionLog, RefreshToken]),
    PassportModule.register({ defaultStrategy: 'access-token', session: false }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: ENV.ACCESS_TOKEN_SECRET_KEY,
        signOptions: { expiresIn: ENV.ACCESS_TOKEN_EXPIRED_IN },
      }),
    }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: ENV.REFRESH_TOKEN_SECRET_KEY,
        signOptions: { expiresIn: ENV.REFRESH_TOKEN_EXPIRED_IN },
      }),
    }),
    UserModule,
    TransactionLogModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    TransactionLogService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    LocalStrategy,
  ],
  exports: [PassportModule, JwtModule],
})
export class AuthModule {}
