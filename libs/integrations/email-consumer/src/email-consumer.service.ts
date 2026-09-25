import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { MailerService } from '@libs/integrations/mailer/mailer.service';
import { Consumer, Kafka } from 'kafkajs';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class EmailConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EmailConsumerService.name);
  private kafka: Kafka;
  private consumer: Consumer;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.kafka = new Kafka({
      clientId: 'messenger-email-consumer',
      brokers: [this.configService.get<string>('KAFKA_BROKER', 'kafka:29092')],
    });
    this.consumer = this.kafka.consumer({ groupId: 'messenger-email-consumerv4' });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'user.registered', fromBeginning: true });
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const raw = message.value?.toString();
        this.logger.log(`Получено сообщение: ${raw}`);
        try {
          const data = JSON.parse(raw || '{}');
          if (!data?.email || !data?.code) {
            this.logger.error('Неверный формат данных', data);
            return;
          }
          await this.mailerService.sendVerificationCode(data.email, data.username, data.code);
          this.logger.log(`Письмо отправлено на ${data.email}`);
        } catch (error) {
          this.logger.error('Ошибка обработки', error);
        }
      },
    });
    this.logger.log('Email Consumer запущен');
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}