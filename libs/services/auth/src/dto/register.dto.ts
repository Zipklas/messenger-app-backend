import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @Matches(/^[a-zA-Z0-9_]{3,20}$/, { message: 'Username: 3-20 символов, только латиница, цифры и _' })
  username: string;
}