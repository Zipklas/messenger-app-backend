
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.yandex.ru',
      port: 465,
      secure: true,
      auth: {
        user: this.configService.get<string>('YANDEX_EMAIL'),
        pass: this.configService.get<string>('YANDEX_APP_PASSWORD'),
      },
    });
  }

  async sendVerificationCode(email: string, username: string, code: string) {
    const mailOptions = {
      from: `"Messenger App" <${this.configService.get<string>('YANDEX_EMAIL')}>`,
      to: email,
      subject: 'Подтверждение регистрации в Messenger',
      html: `
        <h2>Привет, ${username}! 👋</h2>
        <p>Спасибо за регистрацию. Твой код подтверждения:</p>
        <h1 style="color: #007bff; letter-spacing: 5px; font-size: 32px;">${code}</h1>
        <p>Код действителен в течение 15 минут.</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(` Код подтверждения отправлен на ${email}`);
    } catch (error) {
      this.logger.error(` Ошибка отправки письма на ${email}:`, error);

    }
  }
}