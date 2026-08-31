import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export class JwtStrategy extends PassportStrategy(Strategy)
{
    constructor (){
        super({
            //recherche du token à l'entête du http
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            //Ignorer jeton expiré
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'CHANGE_MOI_EN_PRODUCTION',
        });
    }

    //methode à appeler par Passport après vérification de signature et d'expiration 
    async validate(payload: {sub: string, email: string, role: string, farmId: string})
    {
         return {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
            farmId: payload.farmId,
         };
    }
}