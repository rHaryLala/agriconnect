import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateStockDto } from "./dto/create-stock.dto";
import { UpdateStockDto } from "./dto/update-stock.dto";
import { CreateStockMovementDto } from "./dto/create-stock-movement.dto";

@Injectable()
export class StockService {
    
}

