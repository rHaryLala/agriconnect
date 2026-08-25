import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaClient } from '../../generated/prisma/client';
import { CreateStockDto } from "./dto/create-stock.dto";
import { UpdateStockDto } from "./dto/update-stock.dto";
import { CreateStockMovementDto } from "./dto/create-stock-movement.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class StockService {
      // ---------- StockItem (le "catalogue" des articles) ----------
    constructor(private prisma: PrismaService) {}
  
      async createItem(dto: CreateStockDto, farmId: string) {
    return this.prisma.stockItem.create({
      data: { ...dto, farmId },
    });
  }

}

