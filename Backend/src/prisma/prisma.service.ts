import {
  INestApplication,
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log("Database connected successfully");
    } catch (error) {
      this.logger.error("Failed to connect to database", error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  async enableShutdownHooks(app: INestApplication): Promise<void> {
    // Use Node.js EventEmitter's 'beforeExit' event for graceful shutdown
    // Prisma extends EventEmitter but types are restrictive
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).$on?.("beforeExit", async () => {
      await app.close();
    });
  }

  // Override query methods to add logging
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async $onerror(event: string, instance: any): Promise<void> {
    this.logger.error(`Prisma event ${event} error`, instance);
  }
}
