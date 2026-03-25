import { randomUUID } from "crypto";

import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service";

import {
  CreateDemandeInput,
  CreateInspectionInput,
  CreateRapportInput,
  DemandeRecord,
  InspectionRecord,
  RapportRecord,
  UpdateDemandeInput,
  UpdateInspectionInput,
  UpdateRapportInput,
  UserRecord,
  VehiculeMini,
} from "./certification.models";
import { CertificationRepositoryPort } from "./certification.repository.port";

@Injectable()
export class CertificationRepository implements CertificationRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  findUserByEmail(email: string): Promise<UserRecord | null> {
    return this.prisma.utilisateur.findUnique({
      where: { email },
      include: { type_utilisateur: true },
    });
  }

  findUserById(id: string): Promise<UserRecord | null> {
    return this.prisma.utilisateur.findUnique({
      where: { id },
      include: { type_utilisateur: true },
    });
  }

  findVehiculeById(id: string): Promise<VehiculeMini | null> {
    return this.prisma.vehicule.findUnique({
      where: { id },
      include: {
        marque: { select: { nom: true } },
        modele: { select: { nom: true } },
      },
    });
  }

  createDemande(data: CreateDemandeInput): Promise<DemandeRecord> {
    // Transform camelCase to snake_case for Prisma
    const { utilisateur, vehicule, ...rest } = data;
    const prismaData = {
      ...rest,
      utilisateur_demande_certification_utilisateur_idToutilisateur:
        utilisateur,
      vehicule_id: vehicule.connect.id,
    };
    return this.prisma.demande_certification.create({
      data: prismaData as any,
      include: {
        utilisateur_demande_certification_utilisateur_idToutilisateur: {
          select: { id: true, nom: true },
        },
        vehicule: {
          include: {
            marque: { select: { nom: true } },
            modele: { select: { nom: true } },
          },
        },
        utilisateur_demande_certification_inspecteur_idToutilisateur: {
          select: { id: true, nom: true },
        },
      },
    });
  }

  findDemandeById(id: string): Promise<DemandeRecord | null> {
    return this.prisma.demande_certification.findUnique({
      where: { id },
      include: {
        utilisateur_demande_certification_utilisateur_idToutilisateur: {
          select: { id: true, nom: true },
        },
        vehicule: {
          include: {
            marque: { select: { nom: true } },
            modele: { select: { nom: true } },
          },
        },
        utilisateur_demande_certification_inspecteur_idToutilisateur: {
          select: { id: true, nom: true },
        },
      },
    });
  }

  findDemandesByVehiculeId(vehiculeId: string): Promise<DemandeRecord[]> {
    return this.prisma.demande_certification.findMany({
      where: { vehicule_id: vehiculeId },
      include: {
        utilisateur_demande_certification_utilisateur_idToutilisateur: {
          select: { id: true, nom: true },
        },
        vehicule: {
          include: {
            marque: { select: { nom: true } },
            modele: { select: { nom: true } },
          },
        },
        utilisateur_demande_certification_inspecteur_idToutilisateur: {
          select: { id: true, nom: true },
        },
      },
    });
  }

  findDemandesPaged(
    page: number,
    size: number,
  ): Promise<{ items: DemandeRecord[]; total: number }> {
    return Promise.all([
      this.prisma.demande_certification.findMany({
        skip: page * size,
        take: size,
        orderBy: { created_at: "desc" },
        include: {
          utilisateur_demande_certification_utilisateur_idToutilisateur: {
            select: { id: true, nom: true },
          },
          vehicule: {
            include: {
              marque: { select: { nom: true } },
              modele: { select: { nom: true } },
            },
          },
          utilisateur_demande_certification_inspecteur_idToutilisateur: {
            select: { id: true, nom: true },
          },
        },
      }),
      this.prisma.demande_certification.count(),
    ]).then(([items, total]) => ({ items, total }));
  }

  findDemandesByUtilisateurId(utilisateurId: string): Promise<DemandeRecord[]> {
    return this.prisma.demande_certification.findMany({
      where: { utilisateur_id: utilisateurId },
      orderBy: { created_at: "desc" },
      include: {
        utilisateur_demande_certification_utilisateur_idToutilisateur: {
          select: { id: true, nom: true },
        },
        vehicule: {
          include: {
            marque: { select: { nom: true } },
            modele: { select: { nom: true } },
          },
        },
        utilisateur_demande_certification_inspecteur_idToutilisateur: {
          select: { id: true, nom: true },
        },
      },
    });
  }

  updateDemande(id: string, data: UpdateDemandeInput): Promise<DemandeRecord> {
    return this.prisma.demande_certification.update({
      where: { id },
      data: data as unknown as Record<string, unknown>,
      include: {
        utilisateur_demande_certification_utilisateur_idToutilisateur: {
          select: { id: true, nom: true },
        },
        vehicule: {
          include: {
            marque: { select: { nom: true } },
            modele: { select: { nom: true } },
          },
        },
        utilisateur_demande_certification_inspecteur_idToutilisateur: {
          select: { id: true, nom: true },
        },
      },
    }) as unknown as Promise<DemandeRecord>;
  }

  deleteDemande(id: string): Promise<DemandeRecord> {
    return this.prisma.demande_certification.delete({
      where: { id },
      include: {
        utilisateur_demande_certification_utilisateur_idToutilisateur: {
          select: { id: true, nom: true },
        },
        vehicule: {
          include: {
            marque: { select: { nom: true } },
            modele: { select: { nom: true } },
          },
        },
        utilisateur_demande_certification_inspecteur_idToutilisateur: {
          select: { id: true, nom: true },
        },
      },
    });
  }

  createInspection(data: CreateInspectionInput): Promise<InspectionRecord> {
    // Transform camelCase to snake_case for Prisma
    const { demande_certification, utilisateur, ...rest } = data;
    const prismaData = {
      ...rest,
      demande_certification_id: demande_certification.connect.id,
      inspecteur_id: utilisateur.connect.id,
    };
    return this.prisma.inspection.create({
      data: prismaData as any,
      include: {
        demande_certification: { select: { id: true } },
        utilisateur: { select: { id: true, nom: true } },
      },
    });
  }

  findInspectionById(id: string): Promise<InspectionRecord | null> {
    return this.prisma.inspection.findUnique({
      where: { id },
      include: {
        demande_certification: { select: { id: true } },
        utilisateur: { select: { id: true, nom: true } },
      },
    });
  }

  findInspectionsByInspecteurPaged(
    inspecteur_id: string,
    page: number,
    size: number,
  ): Promise<{ items: InspectionRecord[]; total: number }> {
    const where = { inspecteur_id };
    return Promise.all([
      this.prisma.inspection.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { created_at: "desc" },
        include: {
          demande_certification: { select: { id: true } },
          utilisateur: { select: { id: true, nom: true } },
        },
      }),
      this.prisma.inspection.count({ where }),
    ]).then(([items, total]) => ({ items, total }));
  }

  updateInspection(
    id: string,
    data: UpdateInspectionInput,
  ): Promise<InspectionRecord> {
    return this.prisma.inspection.update({
      where: { id },
      data,
      include: {
        demande_certification: { select: { id: true } },
        utilisateur: { select: { id: true, nom: true } },
      },
    });
  }

  deleteInspection(id: string): Promise<InspectionRecord> {
    return this.prisma.inspection.delete({
      where: { id },
      include: {
        demande_certification: { select: { id: true } },
        utilisateur: { select: { id: true, nom: true } },
      },
    });
  }

  findRapportByInspectionId(
    inspectionId: string,
  ): Promise<RapportRecord | null> {
    return this.prisma.rapport_inspection.findUnique({
      where: { inspection_id: inspectionId },
      include: { inspection: { select: { id: true } } },
    });
  }

  createRapport(data: CreateRapportInput): Promise<RapportRecord> {
    // Transform camelCase to snake_case for Prisma
    const { inspection, ...rest } = data;
    const prismaData = {
      ...rest,
      inspection_id: inspection.connect.id,
    };
    return this.prisma.rapport_inspection.create({
      data: prismaData as any,
      include: { inspection: { select: { id: true } } },
    });
  }

  updateRapport(id: string, data: UpdateRapportInput): Promise<RapportRecord> {
    return this.prisma.rapport_inspection.update({
      where: { id },
      data,
      include: { inspection: { select: { id: true } } },
    });
  }

  newId(): string {
    return randomUUID();
  }
}
