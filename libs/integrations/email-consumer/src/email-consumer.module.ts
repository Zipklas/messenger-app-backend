import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailConsumerService } from './email-consumer.service';
import { MailerModule } from '@libs/integrations/mailer';

@Module({
  imports: [ConfigModule, MailerModule],
  providers: [EmailConsumerService],
})
export class EmailConsumerModule {}