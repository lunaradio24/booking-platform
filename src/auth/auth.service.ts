import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
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
import { JwtPayload } from './constants/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly tokenRepository: Repository<RefreshToken>,
    private readonly userService: UserService,
    private readonly transactionService: TransactionLogService,
    private readonly configService: ConfigService,
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
    const hashRounds = Number(this.configService.get('HASH_ROUNDS'));
    const hashedPassword = await hash(password, hashRounds);

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
        senderId: Number(this.configService.get('ADMIN_ID')),
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
    // DB에서 Refresh Token이 null인지 확인
    const { token: existingToken } = await this.tokenRepository.findOneBy({ userId });
    if (!existingToken) {
      throw new UnauthorizedException('이미 로그아웃 되었습니다.');
    }
    // DB에서 Refresh Token 삭제(soft delete)
    await this.tokenRepository.update({ userId }, { token: null });
  }

  async validateUser(signInDto: SignInDto) {
    const { email, password } = signInDto;

    // 등록된 이메일인지 확인
    const user = await this.userRepository.findOne({
      select: ['id', 'email', 'password'],
      where: { email },
    });

    if (!user) return null;

    // 입력한 비밀번호가 맞는 비밀번호인지 확인
    const isPasswordMatched = await compare(password, user.password);

    if (isPasswordMatched) {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }

  async issueTokens(payload: JwtPayload) {
    const userId = payload.userId;

    // Access Token, Refresh Token 생성
    const accessToken = sign(payload, this.configService.get('ACCESS_TOKEN_SECRET_KEY'));
    const refreshToken = sign(payload, this.configService.get('REFRESH_TOKEN_SECRET_KEY'));

    // Refresh Token Hashing 후 DB에 저장
    const hashRounds = Number(this.configService.get('HASH_ROUNDS'));
    const hashedRefreshToken = await hash(refreshToken, hashRounds);

    // DB에 해당 유저의 Refresh Token 데이터가 있는지 확인
    const existingToken = await this.tokenRepository.findOne({ where: { userId } });

    // 없으면 데이터 삽입
    if (!existingToken) {
      await this.tokenRepository.insert({
        userId,
        token: hashedRefreshToken,
      });
    }
    // 있으면 갱신
    else {
      await this.tokenRepository.update({ userId }, { token: hashedRefreshToken });
    }

    // Access Token, Refresh Token 반환
    return { accessToken, refreshToken };
  }
}
