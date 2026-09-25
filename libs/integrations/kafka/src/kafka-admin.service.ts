import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka } from 'kafkajs';

@Injectable()
export class KafkaAdminService implements OnModuleInit {
  private readonly logger = new Logger(KafkaAdminService.name);
  private kafka: Kafka;

  constructor(private configService: ConfigService) {
    this.kafka = new Kafka({
      clientId: 'messenger-admin',
      brokers: [this.configService.get<string>('KAFKA_BROKER', 'localhost:9092')],
    });
  }

  async onModuleInit() {
    const admin = this.kafka.admin();
    try {
      await admin.connect();
      this.logger.log('Kafka Admin connected, ensuring topics exist...');

      const topics = [
        { topic: 'user.registered', numPartitions: 3, replicationFactor: 1 },
      ];

      await admin.createTopics({
        topics: topics,
        waitForLeaders: true,
      });

      this.logger.log(' All Kafka topics are ready!');
    } catch (error) {
      this.logger.warn('Topics already exist or error occurred', error.message);
    } finally {
      await admin.disconnect();
    }
  }
}