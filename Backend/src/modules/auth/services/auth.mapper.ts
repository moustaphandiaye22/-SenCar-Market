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
      photoProfilUrl: user.photo_profil_url ?? null,
      emailVerifie: user.email_verifie ?? false,
      telephoneVerifie: user.telephone_verifie ?? false,
      doubleAuthActive: user.double_auth_active ?? false,
      typeUtilisateur: user.type_utilisateur?.nom ?? null,
      statutVerification: user.statut_verification ?? null,
      createdAt: user.created_at ?? null,
      estActif: !user.deleted_at,
    };
  }
}
