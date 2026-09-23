import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private configService: ConfigService) {
    const dbUrl = configService.get<string>('DATABASE_URL')!;

    const adapter = new PrismaPg({
      connectionString: dbUrl,
    });

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Prisma v7 connected to database with Driver Adapter');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}