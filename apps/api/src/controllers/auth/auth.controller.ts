
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from '@libs/services/auth';
import { RegisterDto } from '@libs/services/auth/dto/register.dto';
import { VerifyEmailDto } from '@libs/services/auth/dto/verify-email.dto';
import { LoginDto } from '@libs/services/auth/dto/login.dto';
import { OAuthDto } from '@libs/services/auth/dto/oauth.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.email, dto.code);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('oauth')
  @HttpCode(HttpStatus.OK)
  async oauth(@Body() dto: OAuthDto) {
    return this.authService.validateOAuthLogin(dto.email, dto.username, dto.provider);
  }
}