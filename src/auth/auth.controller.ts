import { Body, Controller, Post } from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    const newUser = await this.authService.signUp(signUpDto);
    return {
      message: '회원가입을 완료했습니다.',
      data: newUser,
    };
  }

  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto) {
    const tokens = await this.authService.signIn(signInDto);
    return {
      message: '로그인에 성공했습니다.',
      data: tokens,
    };
  }

  @Post('sign-out')
  async signOut() {
    await this.authService.signOut();
  }

  @Post('renew-tokens')
  async renewTokens() {
    await this.authService.renewTokens();
  }
}
