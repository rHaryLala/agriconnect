import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, BadRequestException } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { StockService } from "./stock.service";
import { CreateStockDto } from "./dto/create-stock.dto";
import { UpdateStockDto } from "./dto/update-stock.dto";
import { CreateStockMovementDto } from "./dto/create-stock-movement.dto";
import { CorrectMovementDto } from "./dto/correct-movement.dto";
import { FilterHistoriqueDto } from "./dto/filter-historique.dto";

export class StockController {}