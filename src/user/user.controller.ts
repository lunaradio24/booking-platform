import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(AccessTokenGuard)
  getMyProfile(@Request() req) {
    return req.user;
  }
}
