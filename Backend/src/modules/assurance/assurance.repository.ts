import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import {
  CreateOptionInput,
  CreateProduitInput,
  CreateSouscriptionInput,
  OptionRecord,
  ProduitRecord,
  SouscriptionRecord,
  UpdateOptionInput,
  UpdateProduitInput,
  UpdateSouscriptionInput,
  UserRecord,
  VehiculeSummaryRecord,
} from './assurance.models';
import { AssuranceRepositoryPort } from './assurance.repository.port';

@Injectable()
export class AssuranceRepository implements AssuranceRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  findUserByEmail(email: string): Promise<UserRecord | null> {
    return this.prisma.utilisateur.findUnique({
      where: { email },
      include: { typeUtilisateur: true },
    });
  }

  findUserById(id: string): Promise<UserRecord | null> {
    return this.prisma.utilisateur.findUnique({
      where: { id },
      include: { typeUtilisateur: true },
    });
  }

  findVehiculeById(id: string): Promise<VehiculeSummaryRecord | null> {
    return this.prisma.vehicule.findUnique({
      where: { id },
      include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } },
    });
  }

  createProduit(data: CreateProduitInput): Promise<ProduitRecord> {
    return this.prisma.produitAssurance.create({
      data,
      include: { options: true },
    });
  }

  findProduitById(id: string): Promise<ProduitRecord | null> {
    return this.prisma.produitAssurance.findUnique({
      where: { id },
      include: { options: true },
    });
  }

  updateProduit(id: string, data: UpdateProduitInput): Promise<ProduitRecord> {
    return this.prisma.produitAssurance.update({
      where: { id },
      data,
      include: { options: true },
    });
  }

  findProduitsPaged(page: number, size: number): Promise<{ items: ProduitRecord[]; total: number }> {
    return Promise.all([
      this.prisma.produitAssurance.findMany({
        skip: page * size,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: { options: true },
      }),
      this.prisma.produitAssurance.count(),
    ]).then(([items, total]) => ({ items, total }));
  }

  findProduitsActifs(): Promise<ProduitRecord[]> {
    return this.prisma.produitAssurance.findMany({
      where: { estActif: true },
      orderBy: { createdAt: 'desc' },
      include: { options: true },
    });
  }

  createOption(data: CreateOptionInput): Promise<OptionRecord> {
    return this.prisma.optionAssurance.create({ data });
  }

  findOptionById(id: string): Promise<OptionRecord | null> {
    return this.prisma.optionAssurance.findUnique({ where: { id } });
  }

  updateOption(id: string, data: UpdateOptionInput): Promise<OptionRecord> {
    return this.prisma.optionAssurance.update({ where: { id }, data });
  }

  findOptionsByProduitId(produitAssuranceId: string): Promise<OptionRecord[]> {
    return this.prisma.optionAssurance.findMany({
      where: { produitAssuranceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOptionsByIds(ids: string[]): Promise<OptionRecord[]> {
    if (ids.length === 0) {
      return Promise.resolve([]);
    }

    return this.prisma.optionAssurance.findMany({
      where: { id: { in: ids } },
    });
  }

  createSouscription(data: CreateSouscriptionInput): Promise<SouscriptionRecord> {
    return this.prisma.souscriptionAssurance.create({
      data,
      include: {
        utilisateur: { select: { id: true, nom: true } },
        produitAssurance: { select: { id: true, nom: true } },
        vehicule: { include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } } },
        optionsSelectionnees: { include: { option: true } },
      },
    });
  }

  findSouscriptionById(id: string): Promise<SouscriptionRecord | null> {
    return this.prisma.souscriptionAssurance.findUnique({
      where: { id },
      include: {
        utilisateur: { select: { id: true, nom: true } },
        produitAssurance: { select: { id: true, nom: true } },
        vehicule: { include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } } },
        optionsSelectionnees: { include: { option: true } },
      },
    });
  }

  findSouscriptionsByUtilisateurId(utilisateurId: string): Promise<SouscriptionRecord[]> {
    return this.prisma.souscriptionAssurance.findMany({
      where: { utilisateurId },
      orderBy: { createdAt: 'desc' },
      include: {
        utilisateur: { select: { id: true, nom: true } },
        produitAssurance: { select: { id: true, nom: true } },
        vehicule: { include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } } },
        optionsSelectionnees: { include: { option: true } },
      },
    });
  }

  updateSouscription(id: string, data: UpdateSouscriptionInput): Promise<SouscriptionRecord> {
    return this.prisma.souscriptionAssurance.update({
      where: { id },
      data,
      include: {
        utilisateur: { select: { id: true, nom: true } },
        produitAssurance: { select: { id: true, nom: true } },
        vehicule: { include: { marque: { select: { nom: true } }, modele: { select: { nom: true } } } },
        optionsSelectionnees: { include: { option: true } },
      },
    });
  }

  newId(): string {
    return randomUUID();
  }
}
