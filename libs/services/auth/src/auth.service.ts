import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MailerService } from '@libs/integrations/mailer';
import { KafkaProducerService } from '@libs/integrations/kafka';
import { PrismaService } from '@libs/infrastructure/db';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mailer: MailerService,
    private kafka: KafkaProducerService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    });
    if (existingUser) throw new ConflictException('Email или Username уже заняты');

    const hash = await bcrypt.hash(dto.password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 цифр
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 минут

    // 3. Создание юзера (со статусом isEmailVerified: false)
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        password: hash,
        provider: 'local',
        isEmailVerified: false,
        verificationCode,
        verificationCodeExpiresAt: expiresAt,
      },
    });

    // 4. Асинхронная отправка события в Kafka (MailerService подпишется на это и отправит письмо)
    await this.kafka.emit('user.registered', {
      email: user.email,
      username: user.username,
      code: verificationCode,
    });

    // 5. Возвращаем сообщение, а НЕ токен
    return { message: 'Код подтверждения отправлен на вашу почту' };
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('Пользователь не найден');
    if (user.isEmailVerified) throw new BadRequestException('Почта уже подтверждена');

    if (user.verificationCode !== code || !user.verificationCodeExpiresAt || user.verificationCodeExpiresAt < new Date()) {
      throw new BadRequestException('Неверный или просроченный код');
    }

    // Обновляем статус и очищаем код
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verificationCode: null,
        verificationCodeExpiresAt: null
      },
    });

    return this.generateToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.password) throw new UnauthorizedException('Неверные данные');

    // Запрещаем вход, если почта не подтверждена
    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Сначала подтвердите email');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Неверные данные');

    return this.generateToken(user);
  }

  async validateOAuthLogin(email: string, username: string, provider: string) {
    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          username: `${username}_${Date.now()}`,
          provider,
          isEmailVerified: true,
        },
      });

      await this.kafka.emit('user.registered', { email, username: user.username, code: 'WELCOME' });
    } else if (user.provider !== provider) {
      throw new ConflictException('Этот email уже зарегистрирован другим способом');
    }

    return this.generateToken(user);
  }

  private generateToken(user: any) {
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwt.sign(payload),
      user: { id: user.id, email: user.email, username: user.username, avatar: user.avatar },
    };
  }
}