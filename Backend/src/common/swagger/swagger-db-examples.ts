import type { OpenAPIObject } from '@nestjs/swagger';

import type { PrismaService } from '../../prisma/prisma.service';

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const;

type SwaggerDbExampleValue =
  | string
  | number
  | boolean
  | Array<string | number | boolean>;

type SwaggerDbExamples = Record<string, SwaggerDbExampleValue>;

type SwaggerParameter = {
  in?: string;
  name?: string;
  example?: unknown;
};

type SwaggerOperation = {
  parameters?: Array<SwaggerParameter | { $ref: string }>;
};

const toParamObject = (param: SwaggerParameter | { $ref: string }): SwaggerParameter | null => {
  if ('$ref' in param) {
    return null;
  }
  return param;
};

const pickFirstId = async <T extends { id: string }>(
  promise: Promise<T | null>,
): Promise<string | undefined> => {
  const row = await promise;
  return row?.id;
};

export const loadSwaggerDbExamples = async (prisma: PrismaService): Promise<SwaggerDbExamples> => {
  const [
    utilisateurId,
    vehiculeId,
    annonceId,
    reservationId,
    paiementId,
    transactionId,
    conversationId,
    messageId,
    garageId,
    demandeTradeInId,
    demandeId,
    inspectionId,
    produitId,
    optionId,
    inspecteurId,
    utilisateursIdsRaw,
  ] = await Promise.all([
    pickFirstId(prisma.utilisateur.findFirst({ select: { id: true } })),
    pickFirstId(prisma.vehicule.findFirst({ select: { id: true } })),
    pickFirstId(prisma.annonceLocation.findFirst({ select: { id: true } })),
    pickFirstId(prisma.reservationLocation.findFirst({ select: { id: true } })),
    pickFirstId(prisma.paiement.findFirst({ select: { id: true } })),
    pickFirstId(prisma.transactionPortefeuille.findFirst({ select: { id: true } })),
    pickFirstId(prisma.conversation.findFirst({ select: { id: true } })),
    pickFirstId(prisma.message.findFirst({ select: { id: true } })),
    pickFirstId(prisma.garage.findFirst({ select: { id: true } })),
    pickFirstId(prisma.demandeTradeIn.findFirst({ select: { id: true } })),
    pickFirstId(prisma.demandeCertification.findFirst({ select: { id: true } })),
    pickFirstId(prisma.inspection.findFirst({ select: { id: true } })),
    pickFirstId(prisma.produitAssurance.findFirst({ select: { id: true } })),
    pickFirstId(prisma.optionAssurance.findFirst({ select: { id: true } })),
    pickFirstId(
      prisma.utilisateur.findFirst({
        where: { typeUtilisateur: { nom: { in: ['INSPECTEUR', 'ADMIN', 'MODERATEUR', 'SUPER_ADMIN'] } } },
        select: { id: true },
      }),
    ),
    prisma.utilisateur.findMany({ select: { id: true }, take: 3 }),
  ]);

  const fallbackUuid = utilisateurId ?? '10000000-0000-4000-8000-000000000002';

  const utilisateursIds = utilisateursIdsRaw.map((user) => user.id);

  return {
    id: fallbackUuid,
    utilisateurId: utilisateurId ?? fallbackUuid,
    utilisateurIds: utilisateursIds.length > 0 ? utilisateursIds : [fallbackUuid],
    proprietaireId: utilisateurId ?? fallbackUuid,
    annonceId: annonceId ?? fallbackUuid,
    vehiculeId: vehiculeId ?? fallbackUuid,
    reservationId: reservationId ?? fallbackUuid,
    paiementId: paiementId ?? fallbackUuid,
    transactionId: transactionId ?? fallbackUuid,
    conversationId: conversationId ?? fallbackUuid,
    messageId: messageId ?? fallbackUuid,
    garageId: garageId ?? fallbackUuid,
    demandeId: demandeId ?? fallbackUuid,
    demandeTradeInId: demandeTradeInId ?? fallbackUuid,
    inspectionId: inspectionId ?? fallbackUuid,
    produitId: produitId ?? fallbackUuid,
    produitAssuranceId: produitId ?? fallbackUuid,
    optionId: optionId ?? fallbackUuid,
    inspecteurId: inspecteurId ?? fallbackUuid,
    page: 0,
    size: 10,
    statut: 'EN_ATTENTE',
    sortBy: 'createdAt',
    sortDir: 'desc',
    montant: 1000,
    referenceExterne: 'SWAGGER_REF_001',
    query: 'test',
    q: 'test',
    ville: 'Dakar',
    latitude: 14.7167,
    longitude: -17.4677,
    rayonKm: 10,
    titre: 'Notification de test',
    message: 'Message de test Swagger',
    raison: 'Test Swagger',
    isTyping: true,
    type: 'SYSTEM',
    typeAvis: 'ACHETEUR',
    typeEntite: 'AVIS',
    documentType: 'CARTE_GRISE',
    documentUrl: 'https://example.com/document.pdf',
  };
};

const resolveIdForGenericParam = (
  path: string,
  examples: SwaggerDbExamples,
): SwaggerDbExampleValue | undefined => {
  if (path.includes('/admin/annonces/')) return examples.vehiculeId;
  if (path.includes('/admin/transactions/')) return examples.transactionId;
  if (path.includes('/admin/utilisateurs/')) return examples.utilisateurId;
  if (path.includes('/messages/')) return examples.messageId;
  if (path.includes('/conversations/')) return examples.conversationId;
  if (path.includes('/transactions/')) return examples.transactionId;
  if (path.includes('/paiements/')) return examples.paiementId;
  if (path.includes('/garages/')) return examples.garageId;
  if (path.includes('/assurance/produits/') || path.includes('/assurances/produits/')) return examples.produitId;
  if (path.includes('/assurance/options/') || path.includes('/assurances/options/')) return examples.optionId;
  if (path.includes('/assurance/souscriptions/') || path.includes('/assurances/souscriptions/')) return examples.id;
  if (path.includes('/avis/')) return examples.id;
  if (path.includes('/locations/annonces/')) return examples.annonceId;
  if (path.includes('/locations/reservations/')) return examples.reservationId;
  if (path.includes('/certifications/inspections/')) return examples.inspectionId;
  if (path.includes('/certifications/demandes/')) return examples.demandeId;
  if (path.includes('/tradein/demandes/')) return examples.demandeTradeInId;
  if (path.includes('/vehicules/')) return examples.vehiculeId;
  return examples.id;
};

const applyOperationExamples = (
  operation: SwaggerOperation,
  path: string,
  examples: SwaggerDbExamples,
): void => {
  for (const raw of operation.parameters ?? []) {
    const param = toParamObject(raw);
    if (!param || param.example !== undefined) {
      continue;
    }

    if (!param.name) {
      continue;
    }

    if (param.name === 'id') {
      const resolved = resolveIdForGenericParam(path, examples);
      if (resolved !== undefined) {
        param.example = resolved;
      }
      continue;
    }

    const direct = examples[param.name];
    if (direct !== undefined) {
      param.example = direct;
    }
  }
};

export const applySwaggerDbExamples = (
  document: OpenAPIObject,
  examples: SwaggerDbExamples,
): void => {
  for (const [path, item] of Object.entries(document.paths)) {
    for (const method of HTTP_METHODS) {
      const operation = item[method] as SwaggerOperation | undefined;
      if (!operation) {
        continue;
      }
      applyOperationExamples(operation, path, examples);
    }
  }

  const sorted = Object.entries(examples)
    .filter(([key]) => key.endsWith('Id') || ['montant', 'page', 'size', 'statut'].includes(key))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `- \`${key}\`: \`${value}\``)
    .join('\n');

  if (sorted.length > 0) {
    document.info.description = `${document.info.description ?? ''}\n\n### Donnees de test (base reelle)\n${sorted}`;
  }
};
