import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
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

  async validate(payload: { sub: string; email: string; role: string; farmId: string }) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      farmId: payload.farmId,
    };
  }
}
