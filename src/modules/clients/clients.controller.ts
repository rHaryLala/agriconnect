import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags ('Clients')

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @ApiOperation({ summary: 'Ajouter un nouveau client'})
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  @ApiOperation({ summary: 'La liste des clients (filtrable par farmID)'})
  findAll(@Query('farmId') farmId?: string) {
    return this.clientsService.findAll( farmId )
  }

  @Get(':id')
  @ApiOperation({summary: 'Récupérer un client par son ID'})
  findOne(@Param('id') id:string){
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({summary: 'Mettre a jour les informations d`un client'})
  update(
    @Param('id') id: string, 
    @Body() updateClientDto: UpdateClientDto){
    return this.clientsService.update(id, updateClientDto);
  }

  @Delete(':id')
  @ApiOperation({summary: 'Supprimer un client'})
  remove(@Param('id') id: string) {
    return this.clientsService.remove(id);
  }
}
