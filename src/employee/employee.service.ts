import { Injectable, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { LinkClientDto } from "./dto/link-client.dto";

@Injectable()
export class EmployeeService {
    constructor(private prisma: PrismaService) {}

    async create(dto: CreateEmployeeDto, farmId: string)
    {
    // Vérifie l'unicité du matricule AVANT la tentative de création,
    // pour renvoyer un message clair plutôt que de laisser remonter
    // l'erreur brute de contrainte PostgreSQL

    if (dto.matricule)
    {
        const existing = await this.prisma.employee.findFirst({
            where: {farmId, matricule: dto.matricule},
        });
        if (existing)
        {
            throw new ConflictException(
                `Le matricule "${dto.matricule}" est déjà utilisé par un autre employé de cette ferme`
            );
        }
    }

    return this.prisma.employee.create({
        data: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            matricule: dto.matricule,
            department: dto.department,
            position: dto.position,
            phone: dto.phone,
            farmId,
        },
    });
    }

    
}