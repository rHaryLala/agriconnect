import { IsUUID } from 'class-validator';

// Rattache cette fiche employé à un profil Client existant
// depuis sa fiche RH.
export class LinkClientDto {
  @IsUUID()
  clientId: string;
}