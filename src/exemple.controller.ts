import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { RolesGuard } from "./auth/guards/roles.guard";
import { Roles } from "./auth/decorators/roles.decorator";

@Controller('example')
export class ExempleController
{
    @Get('reserve-admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    routeReserveeAuGerant()
    {
        return {message: 'Vous êtes bien le gérant !'};
    }
}