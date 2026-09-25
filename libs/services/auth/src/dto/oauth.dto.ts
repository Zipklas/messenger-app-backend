import { IsEmail, IsString, IsIn } from 'class-validator';

export class OAuthDto {
  @IsEmail()
  email: string;

  @IsString()
  username: string;

  @IsIn(['google', 'yandex', 'telegram'])
  provider: string;
}