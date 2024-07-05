import { Body, Controller, Post } from '@nestjs/common';
import { SignInDto } from 'src/user/dto/sign-in.dto';
import { SignUpDto } from 'src/user/dto/sign-up.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    return await this.authService.signUp(signUpDto);
  }

  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto) {
    return await this.authService.signIn(signInDto);
  }

  @Post('sign-out')
  async signOut() {
    await this.authService.signOut();
  }
}
