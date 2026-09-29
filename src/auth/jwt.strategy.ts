import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Stack : stratégie Passport (`@nestjs/passport` + `passport-jwt`), enregistrée
 * comme provider dans AuthModule. Elle s'exécute derrière JwtAuthGuard : le
 * garde valide la signature et l'expiration du jeton, puis appelle `validate()`
 * ci-dessous, dont la valeur de retour devient `request.user`. C'est donc cet
 * objet que @CurrentUser lit, et sur lequel RolesGuard fonde sa décision.
 *
 * PrismaService est injectable ici sans import : PrismaModule est @Global.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    // On calcule le secret AVANT d'appeler super(), puisque super()
    // doit recevoir la valeur finale directement — pas de repli caché
    // dedans, juste une vérification explicite juste avant.
    const secret = process.env.JWT_SECRET;

    // Si la variable n'existe pas, on arrête tout de suite plutôt que
    // de continuer avec un secret prévisible. Cette erreur est levée
    // pendant la construction du module NestJS, donc AU DÉMARRAGE du
    // serveur — jamais au moment d'une requête.
    if (!secret) {
      throw new Error(
        'JWT_SECRET manquant dans les variables d\'environnement — ' +
        'le serveur ne peut pas démarrer sans un secret défini explicitement.',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret, // plus aucun repli ici
    });
  }

  /**
   * Métier : le rôle et la ferme sont relus en base, PAS repris du jeton.
   *
   * C'est le point central de la gestion des rôles. Le jeton est signé pour 7
   * jours (voir auth.module.ts) et transporte un `role` figé à l'instant du
   * login. Tant qu'on se contentait de le recopier, rétrograder un Gérant via
   * PATCH /users/:id ne changeait rien : il gardait ses droits d'administration
   * pendant une semaine, sans que rien ne le laisse deviner. Un retrait de
   * droits doit prendre effet à la requête suivante, sinon ce n'est pas une
   * gestion des rôles.
   *
   * Le coût est d'une requête indexée sur la clé primaire par appel
   * authentifié. C'est le prix d'un rôle qui dit la vérité ; on ne met pas en
   * cache sans mesure préalable, sous peine de réintroduire exactement le
   * décalage qu'on vient de supprimer.
   *
   * Le payload ne sert donc plus qu'à identifier QUI parle (`sub`). Tout le
   * reste vient de la base.
   */
  async validate(payload: { sub: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, farmId: true },
    });

    // Le compte a été supprimé depuis l'émission du jeton, dont la signature
    // reste pourtant valide. Sans ce contrôle, un utilisateur supprimé
    // continuerait d'accéder à l'API jusqu'à expiration.
    if (!user) {
      throw new UnauthorizedException('Ce compte n\'existe plus');
    }

    // TODO (bloqué, en attente du DBA) — refuser ici les comptes suspendus,
    // quand User.status existera. Le front gère déjà UserStatus
    // (actif / inactif / suspendu) mais le schéma final n'a pas le champ :
    // aucune suspension n'est donc applicable aujourd'hui. On ne la simule ni
    // par un rôle détourné ni par une convention sur un champ existant.

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      farmId: user.farmId,
    };
  }
}
