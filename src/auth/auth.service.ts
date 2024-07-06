import _ from 'lodash';
import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { compare, hash } from 'bcrypt';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { UserService } from 'src/user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionType } from 'src/transaction-log/types/transaction-type.type';
import { WELCOME_POINTS } from './constants/sign-up.constant';
import { TransactionLogService } from 'src/transaction-log/transaction-log.service';
import { sign } from 'jsonwebtoken';
import { RefreshToken } from './entities/refresh-token.entity';
import { ENV } from 'src/common/constants/env.constant';
import { JwtPayload } from './constants/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly tokenRepository: Repository<RefreshToken>,
    private readonly userService: UserService,
    private readonly transactionService: TransactionLogService,
    private readonly jwtService: JwtService,
    private dataSource: DataSource,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const { email, password } = signUpDto;

    // 이메일 중복 여부 확인
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('이미 해당 이메일로 가입된 사용자가 있습니다!');
    }

    // 비밀번호 해싱
    const hashedPassword = await hash(password, ENV.HASH_ROUNDS);

    // 트랜잭션
    let newUser: User;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 유저 등록
      newUser = await this.userRepository.save({
        email,
        password: hashedPassword,
      });

      // 거래 기록
      await this.transactionService.create({
        senderId: ENV.ADMIN_ID,
        receiverId: newUser.id,
        type: TransactionType.CHARGE,
        amount: WELCOME_POINTS,
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    // 비밀번호 제외 후 반환
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...newUserWithoutPassword } = newUser;
    return newUserWithoutPassword;
  }

  async signOut(userId: number) {
    // DB에서 Refresh Token 삭제(soft delete)
    await this.tokenRepository.delete({ userId });
  }

  async validateUser(signInDto: SignInDto) {
    const { email, password } = signInDto;

    // 등록된 이메일인지 확인
    const user = await this.userRepository.findOne({
      select: ['id', 'email', 'password'],
      where: { email },
    });

    if (_.isNil(user)) return null;

    // 입력한 비밀번호가 맞는 비밀번호인지 확인
    const isPasswordMatched = await compare(password, user.password);

    if (isPasswordMatched) {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }

  async issueTokens(payload: JwtPayload) {
    // Access Token, Refresh Token 생성
    const accessToken = sign(payload, ENV.ACCESS_TOKEN_SECRET_KEY);
    const refreshToken = sign(payload, ENV.REFRESH_TOKEN_SECRET_KEY);

    // Refresh Token Hashing 후 DB에 저장
    const hashedRefreshToken = await hash(refreshToken, ENV.HASH_ROUNDS);
    await this.tokenRepository.save({
      userId: payload.userId,
      token: hashedRefreshToken,
    });

    // Access Token, Refresh Token 반환
    return { accessToken, refreshToken };
  }
}
