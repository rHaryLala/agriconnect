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

    async findAll(farmId: string, department?: string)
    {
        return this.prisma.employee.findMany({
            where: {
                farmId,
                 // "department" filtré seulement s'il est fourni dans la requête 
                department,
            },

            // On inclut le compte de connexion et le profil client liés s'ils
            // existent, pour que le frontend n'ait pas besoin d'appels
            // supplémentaires juste pour savoir "cet employé a-t-il un compte ?"
            include: {
                user: {select: {id: true, email: true, role: true}},
                client: {select: {id: true, name: true}},
            },
            orderBy: [{lastName: 'asc'}, {firstName: 'asc'}],
        });
    }

    async findOne(id: string, farmId: string)
    {
        const employee = await this.prisma.employee.findFirst({
            where: {id, farmId},
            include: {
                user: {select: {id: true, email: true, role:true}},
                client: {select: {id: true, name: true}},
                // Historique des retenues déjà existant au schéma — même si la
                // retenue n'est pas encore "réellement appliquée à la paie"
                // (hors périmètre de cette étape), autant déjà pouvoir les lister.
                salaryDeductions: {orderBy: {createdAt: 'desc'}},
            },
        });
        if (!employee)
        {
            throw new NotFoundException('Employé introuvable');
        }
        return employee;
    }

    async update(id: string, dto: UpdateEmployeeDto, farmId: string)
    {
        await this.findOne(id, farmId) //Vérifie existence + appartenance à une ferme
        
        if (dto.matricule)
        {
            const existing = await this.prisma.employee.findFirst({
                where: {farmId, matricule: dto.matricule, NOT: {id}},
            });
            if (existing)
            {
                throw new ConflictException(
                    `Le matricule "${dto.matricule}" est déjà utilisé par un autre compte`
                );
            }
        }
        return this.prisma.employee.update({where: {id}, data: dto});
    }

    // Rattache un profil Client existant à cette fiche employé
    async linkToClient(employeeId: string, dto: LinkClientDto, farmId: string) {
    const employee = await this.findOne(employeeId, farmId);

    const client = await this.prisma.client.findFirst({
      where: { id: dto.clientId, farmId },
    });
    if (!client) {
      throw new NotFoundException('Client introuvable');
    }

    const dejaLie = await this.prisma.employee.findFirst({
      where: { clientId: dto.clientId, NOT: { id: employeeId } },
    });
    if (dejaLie) {
      throw new BadRequestException(
        `Ce client est déjà rattaché à un autre employé (${dejaLie.firstName} ${dejaLie.lastName})`,
      );
    }

    return this.prisma.employee.update({
      where: { id: employeeId },
      data: { clientId: dto.clientId },
    });
  }

  // Détache le lien client, sans toucher au reste de la fiche employé —
  // symétrique de linkToClient, pour que le retrait soit aussi explicite
  // que le rattachement (jamais un "update" générique qui pourrait
  // effacer ce lien par accident via un champ oublié dans le corps).
  async unlinkClient(employeeId: string, farmId: string) {
    await this.findOne(employeeId, farmId);
    return this.prisma.employee.update({
      where: { id: employeeId },
      data: { clientId: null },
    });
  }
}