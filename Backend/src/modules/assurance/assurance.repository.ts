import { randomUUID } from "crypto";

import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service";

import {
  CreateOptionInput,
  CreateProduitInput,
  CreateSouscriptionInput,
  OptionRecord,
  PaiementRecord,
  ProduitRecord,
  SouscriptionRecord,
  UpdateOptionInput,
  UpdateProduitInput,
  UpdateSouscriptionInput,
  UserRecord,
  VehiculeSummaryRecord,
} from "./assurance.models";
import { AssuranceRepositoryPort } from "./assurance.repository.port";

@Injectable()
export class AssuranceRepository implements AssuranceRepositoryPort {
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

  findVehiculeById(id: string): Promise<VehiculeSummaryRecord | null> {
    return this.prisma.vehicule.findUnique({
      where: { id },
      include: {
        marque: { select: { nom: true } },
        modele: { select: { nom: true } },
      },
    });
  }

  findPaiementById(id: string): Promise<PaiementRecord | null> {
    return this.prisma.paiement.findUnique({
      where: { id },
    });
  }

  createProduit(data: CreateProduitInput): Promise<ProduitRecord> {
    return this.prisma.produit_assurance.create({
      data,
      include: { option_assurance: true },
    });
  }

  findProduitById(id: string): Promise<ProduitRecord | null> {
    return this.prisma.produit_assurance.findUnique({
      where: { id },
      include: { option_assurance: true },
    });
  }

  updateProduit(id: string, data: UpdateProduitInput): Promise<ProduitRecord> {
    return this.prisma.produit_assurance.update({
      where: { id },
      data,
      include: { option_assurance: true },
    });
  }

  findProduitsPaged(
    page: number,
    size: number,
  ): Promise<{ items: ProduitRecord[]; total: number }> {
    return Promise.all([
      this.prisma.produit_assurance.findMany({
        skip: page * size,
        take: size,
        orderBy: { created_at: "desc" },
        include: { option_assurance: true },
      }),
      this.prisma.produit_assurance.count(),
    ]).then(([items, total]) => ({ items, total }));
  }

  findProduitsActifs(): Promise<ProduitRecord[]> {
    return this.prisma.produit_assurance.findMany({
      where: { est_actif: true },
      orderBy: { created_at: "desc" },
      include: { option_assurance: true },
    });
  }

  createOption(data: CreateOptionInput): Promise<OptionRecord> {
    return this.prisma.option_assurance.create({ data });
  }

  findOptionById(id: string): Promise<OptionRecord | null> {
    return this.prisma.option_assurance.findUnique({ where: { id } });
  }

  updateOption(id: string, data: UpdateOptionInput): Promise<OptionRecord> {
    return this.prisma.option_assurance.update({ where: { id }, data });
  }

  findOptionsByProduitId(produit_assuranceId: string): Promise<OptionRecord[]> {
    return this.prisma.option_assurance.findMany({
      where: { produit_assurance_id: produit_assuranceId },
      orderBy: { created_at: "desc" },
    });
  }

  findOptionsByIds(ids: string[]): Promise<OptionRecord[]> {
    if (ids.length === 0) {
      return Promise.resolve([]);
    }

    return this.prisma.option_assurance.findMany({
      where: { id: { in: ids } },
    });
  }

  createSouscription(
    data: CreateSouscriptionInput,
  ): Promise<SouscriptionRecord> {
    const prismaData: any = {
      ...data,
      souscription_options: data.optionsSelectionnees,
    };
    delete prismaData.optionsSelectionnees;
    return this.prisma.souscription_assurance.create({
      data: prismaData,
      include: {
        utilisateur: { select: { id: true, nom: true } },
        produit_assurance: { select: { id: true, nom: true } },
        vehicule: {
          include: {
            marque: { select: { nom: true } },
            modele: { select: { nom: true } },
          },
        },
        souscription_options: { include: { option_assurance: true } },
      },
    });
  }

  findSouscriptionById(id: string): Promise<SouscriptionRecord | null> {
    return this.prisma.souscription_assurance.findUnique({
      where: { id },
      include: {
        utilisateur: { select: { id: true, nom: true } },
        produit_assurance: { select: { id: true, nom: true } },
        vehicule: {
          include: {
            marque: { select: { nom: true } },
            modele: { select: { nom: true } },
          },
        },
        souscription_options: { include: { option_assurance: true } },
      },
    });
  }

  findSouscriptionsByUtilisateurId(
    utilisateurId: string,
  ): Promise<SouscriptionRecord[]> {
    return this.prisma.souscription_assurance.findMany({
      where: { utilisateur_id: utilisateurId },
      orderBy: { created_at: "desc" },
      include: {
        utilisateur: { select: { id: true, nom: true } },
        produit_assurance: { select: { id: true, nom: true } },
        vehicule: {
          include: {
            marque: { select: { nom: true } },
            modele: { select: { nom: true } },
          },
        },
        souscription_options: { include: { option_assurance: true } },
      },
    });
  }

  updateSouscription(
    id: string,
    data: UpdateSouscriptionInput,
  ): Promise<SouscriptionRecord> {
    return this.prisma.souscription_assurance.update({
      where: { id },
      data,
      include: {
        utilisateur: { select: { id: true, nom: true } },
        produit_assurance: { select: { id: true, nom: true } },
        vehicule: {
          include: {
            marque: { select: { nom: true } },
            modele: { select: { nom: true } },
          },
        },
        souscription_options: { include: { option_assurance: true } },
      },
    });
  }

  newId(): string {
    return randomUUID();
  }
}
