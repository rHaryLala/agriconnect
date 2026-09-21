import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

// Contrairement à jwt.strategy.ts (où la vérification se fait DANS un
// constructeur), ici on est dans le corps du fichier, exécuté au chargement
// du module — donc on calcule et vérifie AVANT le décorateur @Module,
// puisqu'on ne peut pas mettre de logique à l'intérieur de l'objet
// passé à @Module() lui-même.
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  // Même principe que jwt.strategy.ts(voir le code dans le fichier concerné) : on arrête le démarrage plutôt
  // que de continuer avec un secret prévisible.
  throw new Error(
    'JWT_SECRET manquant dans les variables d\'environnement — ' +
    'le serveur ne peut pas démarrer sans un secret défini explicitement.',
  );
}

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtSecret, // la variable déjà validée ci-dessus, plus aucun repli
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}