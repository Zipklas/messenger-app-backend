import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class KafkaProducerService implements OnModuleInit {
  private readonly logger = new Logger(KafkaProducerService.name);

  constructor(
    @Inject('KAFKA_PRODUCER') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
    this.logger.log('Kafka Producer connected');
  }

  async emit(event: string, data: any) {
    this.logger.log(`Отправка события '${event}':`, JSON.stringify(data));
    try {
      this.kafkaClient.emit(event, data);
      this.logger.log(`Событие '${event}' отправлено в Kafka`);
    } catch (error) {
      this.logger.error(`Ошибка отправки события '${event}':`, error);
    }
  }
}