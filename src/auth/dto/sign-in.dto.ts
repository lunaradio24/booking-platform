import { OmitType } from '@nestjs/mapped-types';
import { SignUpDto } from './sign-up.dto';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto extends OmitType(SignUpDto, ['passwordConfirm']) {
  @IsEmail()
  @IsNotEmpty({ message: '이메일을 입력해주세요.' })
  readonly email: string;

  @IsString()
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  readonly password: string;
}
