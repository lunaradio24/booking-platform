import _ from 'lodash';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { SignInDto } from '../dto/sign-in.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(signInDto: SignInDto): Promise<any> {
    const user = await this.authService.validateUser(signInDto);
    if (_.isNil(user)) {
      throw new UnauthorizedException('로그인에 실패했습니다.');
    }
    return user;
  }
}
