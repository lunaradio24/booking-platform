import _ from 'lodash';
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
import { ConfigService } from '@nestjs/config';
import { WELCOME_POINTS } from './constants/sign-up.constant';
import { TransactionLogService } from 'src/transaction-log/transaction-log.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
    const hashedPassword = await hash(password, 10);

    // 트랜잭션
    let newUser: User;
    const config = new ConfigService();
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
        senderId: config.get('ADMIN_ID'),
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

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    // 등록된 이메일인지 확인
    const user = await this.userRepository.findOne({
      select: ['id', 'email', 'password'],
      where: { email },
    });

    if (_.isNil(user)) {
      throw new UnauthorizedException('이메일을 확인해주세요.');
    }

    // 입력한 비밀번호가 맞는 비밀번호인지 확인
    if (!(await compare(password, user.password))) {
      throw new UnauthorizedException('비밀번호를 확인해주세요.');
    }

    // Access Token 발급
    const payload = { email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signOut() {}

  async renewTokens() {}
}
