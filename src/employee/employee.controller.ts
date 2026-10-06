import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { LinkClientDto } from './dto/link-client.dto';

type AuthUser = { id: string; role: string; farmId: string };


// Nommé explicitement 'employees' — même vigilance que sur
// SupplierController : jamais de @Controller() vide, pour éviter le
// bug de routage déjà rencontré sur ProductVariantController.
@ApiTags('employees')
@ApiBearerAuth()
@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeeController {
  constructor(private service: EmployeeService) {}

  @Post()
  @Roles('ADMIN') // gestion RH = sensible, réservée au Gérant, cohérent avec Users
  create(@Body() dto: CreateEmployeeDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user.farmId);
  }

  @Get()
  @Roles('ADMIN', 'COMPTABLE') // le Comptable a besoin de voir les fiches pour les retenues sur salaire à venir
  findAll(@Query('department') department: string, @CurrentUser() user: AuthUser) {
    return this.service.findAll(user.farmId, department);
  }

  
  @Get(':id')
  @Roles('ADMIN', 'COMPTABLE')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.findOne(id, user.farmId);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto, @CurrentUser() user: AuthUser) {
    return this.service.update(id, dto, user.farmId);
  }

  @Post(':id/link-client')
  @Roles('ADMIN')
  linkToClient(
    @Param('id') id: string,
    @Body() dto: LinkClientDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.linkToClient(id, dto, user.farmId);
  }

  @Delete(':id/link-client')
  @Roles('ADMIN')
  unlinkClient(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.unlinkClient(id, user.farmId);
  }
}