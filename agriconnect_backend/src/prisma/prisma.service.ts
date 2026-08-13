import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';

// PrismaService hérite de PrismaClient : il EST le client, en plus d'être injectable
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    // ouvre la connexion à la base dès que le module démarre
    await this.$connect();
  }
}
