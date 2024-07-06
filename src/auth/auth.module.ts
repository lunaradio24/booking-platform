import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { TransactionLog } from 'src/transaction-log/entities/transaction-log.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { TransactionLogService } from 'src/transaction-log/transaction-log.service';
import { TransactionLogModule } from 'src/transaction-log/transaction-log.module';
import { LocalStrategy } from './strategies/local.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, TransactionLog, RefreshToken]),
    PassportModule.register({ defaultStrategy: 'access-token', session: false }),
    ConfigModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('ACCESS_TOKEN_SECRET_KEY'),
        signOptions: { expiresIn: configService.get('ACCESS_TOKEN_EXPIRED_IN') },
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('REFRESH_TOKEN_SECRET_KEY'),
        signOptions: { expiresIn: configService.get('REFRESH_TOKEN_EXPIRED_IN') },
      }),
      inject: [ConfigService],
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
