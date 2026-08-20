import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

//Integration d'un adapter
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

@Injectable()

export class PrismaService extends PrismaClient implements OnModuleInit{
    
    constructor()
    {
        super({adapter}); //Prisma 7 exige cet adapter
    }
    
    async onModuleInit()
    {
        await this.$connect();
    }
}
