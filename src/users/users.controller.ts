import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LinkEmployeeDto } from './dto/link-employee.dto';
import { AuthUser } from '../auth/decorators/current-user.decorator';
@ApiTags('users')
@ApiBearerAuth() // affiche le cadenas dans Swagger pour tout ce contrôleur
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) // appliqué à TOUTES les routes ci-dessous
@Roles('ADMIN') // tout le module Utilisateurs est réservé au Gérant
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto, @CurrentUser() currentUser: { farmId: string }) {
    return this.usersService.create(dto, currentUser.farmId);
  }

  @Get()
  findAll(@CurrentUser() currentUser: { farmId: string }) {
    return this.usersService.findAll(currentUser.farmId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: { farmId: string }) {
    return this.usersService.findOne(id, currentUser.farmId);
  }

  // L'identifiant de l'appelant est transmis au service en plus de sa ferme :
  // il lui faut savoir si un Gerant tente de se retrograder lui-meme.
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() currentUser: { id: string; farmId: string },
  ) {
    return this.usersService.update(id, dto, currentUser.farmId, currentUser.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() currentUser: { id: string; farmId: string }) {
    return this.usersService.remove(id, currentUser.farmId, currentUser.id);
  }

  
@Post(':id/link-employee')
@Roles('ADMIN')
linkToEmployee(
  @Param('id') id: string,
  @Body() dto: LinkEmployeeDto,
  @CurrentUser() user: AuthUser,
) {
  return this.usersService.linkToEmployee(id, dto, user.farmId);
}

@Delete(':id/link-employee')
@Roles('ADMIN')
unlinkEmployee(@Param('id') id: string, @CurrentUser() user: AuthUser) {
  return this.usersService.unlinkEmployee(id, user.farmId);
}
}