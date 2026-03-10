import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

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
} from './certification.models';
import { CertificationRepositoryPort } from './certification.repository.port';

@Injectable()
export class CertificationRepository implements CertificationRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  findUserByEmail(email: string): Promise<UserRecord | null> {
    return this.prisma.utilisateur.findUnique({ where: { email }, include: { typeUtilisateur: true } });
  }

  findUserById(id: string): Promise<UserRecord | null> {
    return this.prisma.utilisateur.findUnique({ where: { id }, include: { typeUtilisateur: true } });
  }

  findVehiculeById(id: string): Promise<VehiculeMini | null> {
    return this.prisma.vehicule.findUnique({
      where: { id },
      include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } },
    });
  }

  createDemande(data: CreateDemandeInput): Promise<DemandeRecord> {
    return this.prisma.demandeCertification.create({
      data,
      include: {
        utilisateur: { select: { id: true, nom: true } },
        vehicule: { include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } } },
        inspecteur: { select: { id: true, nom: true } },
      },
    });
  }

  findDemandeById(id: string): Promise<DemandeRecord | null> {
    return this.prisma.demandeCertification.findUnique({
      where: { id },
      include: {
        utilisateur: { select: { id: true, nom: true } },
        vehicule: { include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } } },
        inspecteur: { select: { id: true, nom: true } },
      },
    });
  }

  findDemandesByVehiculeId(vehiculeId: string): Promise<DemandeRecord[]> {
    return this.prisma.demandeCertification.findMany({
      where: { vehiculeId },
      include: {
        utilisateur: { select: { id: true, nom: true } },
        vehicule: { include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } } },
        inspecteur: { select: { id: true, nom: true } },
      },
    });
  }

  findDemandesPaged(page: number, size: number): Promise<{ items: DemandeRecord[]; total: number }> {
    return Promise.all([
      this.prisma.demandeCertification.findMany({
        skip: page * size,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: {
          utilisateur: { select: { id: true, nom: true } },
          vehicule: { include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } } },
          inspecteur: { select: { id: true, nom: true } },
        },
      }),
      this.prisma.demandeCertification.count(),
    ]).then(([items, total]) => ({ items, total }));
  }

  findDemandesByUtilisateurId(utilisateurId: string): Promise<DemandeRecord[]> {
    return this.prisma.demandeCertification.findMany({
      where: { utilisateurId },
      orderBy: { createdAt: 'desc' },
      include: {
        utilisateur: { select: { id: true, nom: true } },
        vehicule: { include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } } },
        inspecteur: { select: { id: true, nom: true } },
      },
    });
  }

  updateDemande(id: string, data: UpdateDemandeInput): Promise<DemandeRecord> {
    return this.prisma.demandeCertification.update({
      where: { id },
      data: data as unknown as Record<string, unknown>,
      include: {
        utilisateur: { select: { id: true, nom: true } },
        vehicule: { include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } } },
        inspecteur: { select: { id: true, nom: true } },
      },
    }) as unknown as Promise<DemandeRecord>;
  }

  deleteDemande(id: string): Promise<DemandeRecord> {
    return this.prisma.demandeCertification.delete({
      where: { id },
      include: {
        utilisateur: { select: { id: true, nom: true } },
        vehicule: { include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } } },
        inspecteur: { select: { id: true, nom: true } },
      },
    });
  }

  createInspection(data: CreateInspectionInput): Promise<InspectionRecord> {
    return this.prisma.inspection.create({
      data,
      include: {
        demandeCertification: { select: { id: true } },
        inspecteur: { select: { id: true, nom: true } },
      },
    });
  }

  findInspectionById(id: string): Promise<InspectionRecord | null> {
    return this.prisma.inspection.findUnique({
      where: { id },
      include: {
        demandeCertification: { select: { id: true } },
        inspecteur: { select: { id: true, nom: true } },
      },
    });
  }

  findInspectionsByInspecteurPaged(inspecteurId: string, page: number, size: number): Promise<{ items: InspectionRecord[]; total: number }> {
    const where = { inspecteurId };
    return Promise.all([
      this.prisma.inspection.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: {
          demandeCertification: { select: { id: true } },
          inspecteur: { select: { id: true, nom: true } },
        },
      }),
      this.prisma.inspection.count({ where }),
    ]).then(([items, total]) => ({ items, total }));
  }

  updateInspection(id: string, data: UpdateInspectionInput): Promise<InspectionRecord> {
    return this.prisma.inspection.update({
      where: { id },
      data,
      include: {
        demandeCertification: { select: { id: true } },
        inspecteur: { select: { id: true, nom: true } },
      },
    });
  }

  deleteInspection(id: string): Promise<InspectionRecord> {
    return this.prisma.inspection.delete({
      where: { id },
      include: {
        demandeCertification: { select: { id: true } },
        inspecteur: { select: { id: true, nom: true } },
      },
    });
  }

  findRapportByInspectionId(inspectionId: string): Promise<RapportRecord | null> {
    return this.prisma.rapportInspection.findUnique({
      where: { inspectionId },
      include: { inspection: { select: { id: true } } },
    });
  }

  createRapport(data: CreateRapportInput): Promise<RapportRecord> {
    return this.prisma.rapportInspection.create({
      data,
      include: { inspection: { select: { id: true } } },
    });
  }

  updateRapport(id: string, data: UpdateRapportInput): Promise<RapportRecord> {
    return this.prisma.rapportInspection.update({
      where: { id },
      data,
      include: { inspection: { select: { id: true } } },
    });
  }

  newId(): string {
    return randomUUID();
  }
}
