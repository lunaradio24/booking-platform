import { Body, Controller, Post } from '@nestjs/common';
import { SignInDto } from 'src/user/dto/sign-in.dto';
import { SignUpDto } from 'src/user/dto/sign-up.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  async register(@Body() signUpDto: SignUpDto) {
    return await this.authService.signUp(signUpDto.email, signUpDto.password);
  }

  @Post('sign-in')
  async login(@Body() signInDto: SignInDto) {
    return await this.authService.signIn(signInDto.email, signInDto.password);
  }
}
