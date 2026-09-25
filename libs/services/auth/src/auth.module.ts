import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaModule } from '@libs/infrastructure/db';
import { MailerModule } from '@libs/integrations/mailer';
import { KafkaModule } from '@libs/integrations/kafka';
import { AuthController } from '@apps/api/controllers/auth/auth.controller';

@Module({
  imports: [
    PrismaModule,
    MailerModule,
    KafkaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: config.getOrThrow<string>('JWT_ACCESS_EXPIRATION') as any,
        },
      }),
    }),
  ],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}