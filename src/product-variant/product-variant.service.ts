import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateVariantDto } from "./dto/create-variant.dto";
import { UpdateVariantDto } from "./dto/update-variant.dto";

/**
 * Stack : service NestJS, seul point d'accès Prisma du module.
 *
 * Métier : une variante est une déclinaison vendable d'un article de stock —
 * même produit physique, prix et suivi de quantité distincts. Deux filières
 * l'utilisent :
 *  - les œufs (Semaine 1) : gros/petit modèle, normal/cassé ;
 *  - les haricots secs (Semaine 3) : blanc et rouge.
 *
 * Le CDC 2.1.6 décrit les haricots comme un article décliné par couleur, et non
 * comme deux articles séparés : c'est le même grenier, la même unité, seule la
 * valorisation change. Une récolte de haricots est donc un mouvement d'entrée
 * portant un variantId, exactement comme pour les œufs — aucun code spécifique
 * aux haricots n'est nécessaire ici.
 */
@Injectable()
export class ProductVariantService {
    constructor(private prisma: PrismaService) {}

    async create(dto: CreateVariantDto, farmId: string)
    {
         // Vérifie que l'article parent existe bien et appartient à la ferme —
        // jamais fait confiance à un UUID reçu sans vérification.
        const item = await this.prisma.stockItem.findFirst({
            where: {id: dto.stockItemId, farmId},
        });

        if (!item)
        {
            throw new NotFoundException('Article de stock introuvable');
        }

        // Deux variantes de même nom sur un même article scinderaient le stock
        // en silence : une partie des entrées irait sur l'une, une partie sur
        // l'autre, et getQuantiteTotale() continuerait d'afficher un total juste
        // tout en rendant chaque ligne fausse. Le schéma ne l'interdit pas
        // (l'unicité y porte sur le sku, qui est facultatif), donc on le
        // vérifie ici. Comparaison insensible à la casse : « Rouge » et
        // « rouge » sont la même couleur de haricot pour le magasinier.
        const doublon = await this.prisma.productVariant.findFirst({
            where: {
                stockItemId: dto.stockItemId,
                name: { equals: dto.name.trim(), mode: 'insensitive' },
            },
        });
        if (doublon)
        {
            throw new ConflictException(`La variante « ${dto.name.trim()} » existe déjà sur cet article`);
        }

        return this.prisma.productVariant.create({
            data: {
                stockItemId: dto.stockItemId,
                name: dto.name.trim(),
                sku: dto.sku,
                unitPrice: dto.unitPrice,
                quantity: dto.quantity ?? 0, //0 par défaut si non précisé
            },
        });
    }

    async findByItem(stockItemId: string, farmId: string)
    {
         // On vérifie d'abord que l'article appartient bien à la ferme,
    // pour ne jamais exposer les variantes d'un article d'une autre ferme.
    const item = await this.prisma.stockItem.findFirst({
        where: {id: stockItemId, farmId},
    });
    if (!item)
    {
        throw new NotFoundException('Article de stock introuvable');
    }

    return this.prisma.productVariant.findMany({
        where: {stockItemId},
        orderBy: {name: 'asc'},
    });
    }

    async findOne(id: string, farmId: string)
    {
    // "findFirst" avec un filtre imbriqué sur la ferme du parent —
    // empêche de récupérer la variante d'un article d'une autre ferme
    // même en devinant son id.
    const variant = await this.prisma.productVariant.findFirst({
        where: {id, stockItem: {farmId}}
    });

    if (!variant)
    {
        throw new NotFoundException('Variante introuvable');
    }
    return variant;
    }

    async update(id:string, dto: UpdateVariantDto, farmId: string)
    {
        await this.findOne(id, farmId);
        return this.prisma.productVariant.update({where: {id}, data:dto})
    }

// Recalcule la quantité totale d'un article à partir de la somme de
  // ses variantes
  // StockItem.quantity ne doit jamais être une valeur maintenue à la
  // main en parallèle des variantes, toujours recalculée à la demande.

   async getQuantiteTotale(stockItemId: string, farmId: string): Promise<number> {
    const variants = await this.findByItem(stockItemId, farmId);

    // Si l'article n'a aucune variante, on ne recalcule rien — dans ce
    // cas StockItem.quantity reste la source de vérité normale.
    if (variants.length === 0) {
      const item = await this.prisma.stockItem.findFirst({ where: { id: stockItemId, farmId } });
      return item?.quantity ?? 0;
    }

    // reduce() additionne les quantités de toutes les variantes en une
    // seule valeur — c'est LE calcul qui remplace StockItem.quantity
    // dès qu'un article a des variantes.
    return variants.reduce((total, v) => total + v.quantity, 0);
  }
}