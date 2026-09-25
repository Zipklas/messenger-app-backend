import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClsModule } from 'nestjs-cls';
import { PrismaModule } from '@libs/infrastructure/db';
import { AuthModule } from '@libs/services/auth';
import { AuthController } from '@apps/api/controllers/auth/auth.controller';
import { KafkaModule } from '@libs/integrations/kafka';
import { MailerModule } from '@libs/integrations/mailer';
import { EmailConsumerModule } from '../../../libs/integrations/email-consumer/src/email-consumer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: () => crypto.randomUUID(),
      },
    }),
    PrismaModule,
    AuthModule,
    KafkaModule,
    MailerModule,
    EmailConsumerModule
  ],
  controllers:[AuthController]
})
export class AppModule {}