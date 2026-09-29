import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { FilterTransactionDto } from "./dto/filter-transaction.dto";
import { CorrectTransactionDto } from "./dto/correct-transaction.dto";
import { filter } from "rxjs";

@Injectable()
export class FinanceService {
    //Injection de PrismaService
    constructor(private prisma: PrismaService) {}

    async create(dto: CreateTransactionDto, userId: string, farmId: string)
    {
    // Si un invoiceId est fourni, on vérifie qu'elle existe VRAIMENT et
    // qu'elle appartient à la bonne ferme — sinon n'importe qui pourrait
    // lier sa transaction à la facture d'une autre ferme en devinant un UUID.

    if (dto.invoiceId)
    {
        const invoice = await this.prisma.invoice.findFirst({
            where: {id: dto.invoiceId, farmId}
        });

        if (!invoice)
        {
            throw new NotFoundException('Facture introuvable !');
        }
    }


    //Une seule écriture sans $transaction Prisma, car on en a pas besoin (pour l'instant)
    return this.prisma.transaction.create({
        data: {
            type: dto.type,
            amount: dto.amount,
            reference: dto.reference,
            notes: dto.notes,
            invoiceId: dto.invoiceId,
            userId, //Pour Tracabilité, qui a saisi cette transaction
            farmId,
        },
    });

    }

    async findAll (farmId: string, filters: FilterTransactionDto)
    {
        return this.prisma.transaction.findMany({
            where: {
                farmId, //Toujours filtré par ferme, On ne devrais jamais voir les transaction d'une autre ferme
                type: filters.type, //Undefined
                date: {
                    gte: filters.dateDebut ? new Date(filters.dateDebut) : undefined,
                    lte: filters.dateFin ? new Date(filters.dateFin) : undefined,
                },
            },

            orderBy: {date: 'desc'}, //Les plus récentes en premier
        })
    }

    async findOne(id: string, farmId: string)
    {
        const transaction = await this.prisma.transaction.findFirst({
            where: {id, farmId}
        });

        if (!transaction)
        {
            throw new NotFoundException('Transaction introuvable');
        }

        return transaction;
    }

    // "Journal de caisse" du roadmap : la liste chronologique de tout,
  // avec un solde cumulé calculé au fil de l'eau
    async journalDeCaisse(farmId: string)
    {
        const transactions = await this.prisma.transaction.findMany({
            where: {farmId},
            orderBy: {date: 'asc'},
        });

        let solde = 0; // on part de zéro, transaction par transaction

         // .map() transforme chaque transaction en lui ajoutant son solde
        // cumulé au moment où elle a eu lieu
    return transactions.map((t) => {
        solde += t.type === 'RECETTE' ? t.amount: -t.amount;
        return {...t, soldeApres: solde};
    }); 
    }

    // Calcul des bénéfices du roadmap : recettes moins dépenses, sur une
  // période optionnelle.
    async calculerBenefice(farmId: string, filters: FilterTransactionDto)
    {
        const where = {
            farmId,
            date: {
                gte: filters.dateDebut ? new Date(filters.dateDebut): undefined,
                lte: filters.dateFin ? new Date(filters.dateFin): undefined,
            },
        };

        // Deux requêtes séparées plutôt qu'une seule complexe : Prisma sait
    // sommer directement en base de données avec "aggregate"

    const recettes = await this.prisma.transaction.aggregate({
        where: {...where, type: 'RECETTE'},
        _sum: {amount: true},
    });

    const depenses = await this.prisma.transaction.aggregate({
        where: {...where, type: 'DEPENSE'},
        _sum: {amount: true},
    });

    // "?? 0" : si aucune transaction ne correspond, Prisma renvoie "null"
    // plutôt que 0 — on remplace explicitement pour ne jamais calculer
    // "null - null" (ce qui donnerait NaN, pas une vraie erreur visible).
    const totalRecettes = recettes._sum.amount ?? 0;
    const totalDepenses = depenses._sum.amount ?? 0;

    return {
        totalRecettes,
        totalDepenses,
        benefice: totalRecettes - totalDepenses,
    };
    }

    async correct(dto: CorrectTransactionDto, userId: string, farmId: string)
    {
        const original = await this.findOne(dto.originalTransactionId, farmId) //Verifie existence + appartenance à la ferme

    // On crée une nouvelle transaction de type OPPOSÉ, du même montant —
    // ça annule l'effet financier de l'originale sans jamais la supprimer
    // ni la modifier
        return this.prisma.transaction.create({
            data: {
                type: original.type === 'RECETTE' ? 'DEPENSE': 'RECETTE',
                amount: original.amount,
                // Comme il n'existe pas de vrai champ de lien vers l'original,
        // on documente la correction dans "notes" — imparfait, mais
        // c'est la meilleure option disponible avec le schéma actuel.
                notes: `Correction de la transaction ${original.id} - ${dto.reason}`,
                userId,
                farmId,
            },
        }); 
    }
}
