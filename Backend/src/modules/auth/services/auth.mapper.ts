import { Injectable } from '@nestjs/common';

import { AuthUserWithTypeRecord } from '../auth.models';
import { UtilisateurResponseDto } from '../dto/utilisateur-response.dto';

@Injectable()
export class AuthMapper {
  toUtilisateurResponse(user: AuthUserWithTypeRecord): UtilisateurResponseDto {
    return {
      id: user.id,
      email: user.email,
      telephone: user.telephone,
      prenom: user.prenom,
      nom: user.nom,
      photoProfilUrl: user.photoProfilUrl,
      emailVerifie: user.emailVerifie,
      telephoneVerifie: user.telephoneVerifie,
      doubleAuthActive: user.doubleAuthActive,
      typeUtilisateur: user.typeUtilisateur?.nom ?? null,
      statutVerification: user.statutVerification,
      createdAt: user.createdAt,
    };
  }
}
