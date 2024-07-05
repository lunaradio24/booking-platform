import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { JwtStrategy } from './jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { TransactionLogService } from 'src/transaction-log/transaction-log.service';
import { TransactionLogModule } from 'src/transaction-log/transaction-log.module';
import { TransactionLog } from 'src/transaction-log/entities/transaction-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, TransactionLog]),
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_PASSPORT_KEY'),
        signOptions: { expiresIn: '60m' },
      }),
      inject: [ConfigService],
    }),
    UserModule,
    TransactionLogModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, TransactionLogService, JwtStrategy],
  exports: [],
})
export class AuthModule {}
