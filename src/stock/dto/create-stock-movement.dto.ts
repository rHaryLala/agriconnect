import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { MouvementType, CultureType } from "@prisma/client";

//DTO pour l'enregistrement des entrées, sorties ou ajustement de stock

export class CreateStockMovementDto {
    @IsOptional()
    @IsUUID()
    variantId?: string; // si le mouvement concerne une variante précise (ex: "Oeufs GM Normal")
    
    @IsEnum(MouvementType)
    type: MouvementType;

    @IsNumber()
    @Min(0.01)
    quantity: number;

    //Motif facultatif
    @IsOptional()
    @IsString()
    reason?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    repeseeQuantity?: number;

    // ---- Semaine 3 : attribution du mouvement --------------------------
    //
    // Ces quatre champs répondent au suivi des engrais par culture et à celui
    // du carburant, que le plan demande de traiter comme une extension du
    // mouvement de stock plutôt que comme un module neuf.
    //
    // Rappel : le ValidationPipe global tourne avec forbidNonWhitelisted, donc
    // tant qu'un champ n'est pas déclaré ICI, l'envoyer provoque un 400 — même
    // si la colonne existe en base.

    // Culture bénéficiaire, sur une sortie d'engrais.
    @IsOptional()
    @IsEnum(CultureType)
    cultureType?: CultureType;

    // Parcelle concernée. Texte libre : la ferme nomme ses parcelles elle-même
    // (« P03 »), et figer cette liste côté serveur obligerait à une migration
    // au premier découpage de terrain.
    @IsOptional()
    @IsString()
    parcel?: string;

    // Engin servi, sur une sortie de carburant (tracteur, motoculteur, camion).
    @IsOptional()
    @IsString()
    equipment?: string;

    // Numéro du bon papier, pour rapprocher la saisie du justificatif physique
    // conservé au magasin.
    @IsOptional()
    @IsString()
    voucherNumber?: string;
}
