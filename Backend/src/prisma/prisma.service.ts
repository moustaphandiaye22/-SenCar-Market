import { INestApplication, Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  async enableShutdownHooks(app: INestApplication): Promise<void> {
    // Use Node.js EventEmitter's 'beforeExit' event for graceful shutdown
    // Prisma extends EventEmitter but types are restrictive
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).$on?.('beforeExit', async () => {
      await app.close();
    });
  }
}
