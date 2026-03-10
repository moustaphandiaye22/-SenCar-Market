import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { OpenAPIObject } from '@nestjs/swagger';
import { sign } from 'jsonwebtoken';
import supertest = require('supertest');

import { AppModule } from '../src/app.module';
import { applySwaggerDbExamples, loadSwaggerDbExamples } from '../src/common/swagger/swagger-db-examples';
import { PrismaService } from '../src/prisma/prisma.service';

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const;
const FALLBACK_UUID = '10000000-0000-4000-8000-000000000002';

type CallResult = {
  method: string;
  path: string;
  called: string;
  status: number;
  error?: unknown;
};

type ParamShape = {
  in?: string;
  name?: string;
  schema?: Record<string, unknown>;
  example?: unknown;
  examples?: Record<string, { value?: unknown }>;
};

const extractExample = (schema: unknown, doc: OpenAPIObject): unknown => {
  if (!schema || typeof schema !== 'object') {
    return undefined;
  }
  const typed = schema as Record<string, unknown>;
  if (typed.example !== undefined) {
    return typed.example;
  }
  if (typeof typed.$ref === 'string') {
    const schemaName = typed.$ref.split('/').pop() ?? '';
    return extractExample(doc.components?.schemas?.[schemaName], doc);
  }
  if (Array.isArray(typed.allOf)) {
    const merged: Record<string, unknown> = {};
    for (const item of typed.allOf) {
      const example = extractExample(item, doc);
      if (example && typeof example === 'object' && !Array.isArray(example)) {
        Object.assign(merged, example as Record<string, unknown>);
      }
      const itemObj = item as Record<string, unknown>;
      if (itemObj?.properties && typeof itemObj.properties === 'object') {
        for (const [key, value] of Object.entries(itemObj.properties)) {
          const nested = extractExample(value, doc);
          if (nested !== undefined) {
            merged[key] = nested;
          }
        }
      }
    }
    if (Object.keys(merged).length > 0) {
      return merged;
    }
  }
  if (typed.properties && typeof typed.properties === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(typed.properties)) {
      const nested = extractExample(value, doc);
      if (nested !== undefined) {
        out[key] = nested;
      }
    }
    return out;
  }
  if (typed.type === 'array') {
    const nested = extractExample(typed.items, doc);
    return nested === undefined ? [] : [nested];
  }
  if (Array.isArray(typed.enum) && typed.enum.length > 0) {
    return typed.enum[0];
  }
  if (typed.type === 'string') {
    if (typed.format === 'uuid') {
      return FALLBACK_UUID;
    }
    if (typed.format === 'date-time') {
      return '2026-02-28T10:30:00.000Z';
    }
    return 'test';
  }
  if (typed.type === 'number' || typed.type === 'integer') {
    return 1;
  }
  if (typed.type === 'boolean') {
    return true;
  }
  return undefined;
};

const isProtectedOperation = (operation: Record<string, unknown>): boolean => {
  if (Array.isArray(operation.security) && operation.security.length > 0) {
    return true;
  }
  return false;
};

const toScalarString = (value: unknown): string => {
  if (Array.isArray(value)) {
    return String(value[0] ?? FALLBACK_UUID);
  }
  if (value === undefined || value === null) {
    return FALLBACK_UUID;
  }
  return String(value);
};

const chooseGenericId = (path: string, examples: Record<string, unknown>): string => {
  if (path.includes('/admin/annonces/')) return toScalarString(examples.vehiculeId);
  if (path.includes('/admin/transactions/')) return toScalarString(examples.transactionId);
  if (path.includes('/admin/utilisateurs/')) return toScalarString(examples.utilisateurId);
  if (path.includes('/messages/')) return toScalarString(examples.messageId);
  if (path.includes('/conversations/')) return toScalarString(examples.conversationId);
  if (path.includes('/transactions/')) return toScalarString(examples.transactionId);
  if (path.includes('/paiements/')) return toScalarString(examples.paiementId);
  if (path.includes('/garages/')) return toScalarString(examples.garageId);
  if (path.includes('/assurance/produits/') || path.includes('/assurances/produits/')) return toScalarString(examples.produitId);
  if (path.includes('/assurance/options/') || path.includes('/assurances/options/')) return toScalarString(examples.optionId);
  if (path.includes('/assurance/souscriptions/') || path.includes('/assurances/souscriptions/')) return toScalarString(examples.id);
  if (path.includes('/locations/annonces/')) return toScalarString(examples.annonceId);
  if (path.includes('/locations/reservations/')) return toScalarString(examples.reservationId);
  if (path.includes('/certifications/inspections/')) return toScalarString(examples.inspectionId);
  if (path.includes('/certifications/demandes/')) return toScalarString(examples.demandeId);
  if (path.includes('/tradein/demandes/')) return toScalarString(examples.demandeTradeInId);
  if (path.includes('/vehicules/')) return toScalarString(examples.vehiculeId);
  return toScalarString(examples.id);
};

const buildRequestInput = (
  path: string,
  operation: Record<string, unknown>,
  doc: OpenAPIObject,
  examples: Record<string, unknown>,
): { called: string; query: Record<string, unknown>; headers: Record<string, string>; body: unknown } => {
  let called = path;
  const query: Record<string, unknown> = {};
  const headers: Record<string, string> = {};
  let body: unknown;

  const params = Array.isArray(operation.parameters) ? (operation.parameters as ParamShape[]) : [];
  for (const param of params) {
    if (!param || !param.name) continue;

    let value = param.example;
    if (value === undefined && param.examples) {
      const first = Object.values(param.examples)[0];
      value = first?.value;
    }
    if (value === undefined) {
      value = examples[param.name];
    }
    if (value === undefined) {
      value = extractExample(param.schema, doc);
    }
    if (value === undefined) {
      value = param.name === 'id' ? chooseGenericId(path, examples) : 'test';
    }
    if (param.in === 'path' && (value === undefined || value === 'test')) {
      value = param.name === 'id' ? chooseGenericId(path, examples) : toScalarString(examples[param.name]);
    }

    if (param.in === 'path') {
      called = called.replace(`{${param.name}}`, encodeURIComponent(String(value)));
      continue;
    }
    if (param.in === 'query') {
      query[param.name] = value;
      continue;
    }
    if (param.in === 'header') {
      headers[param.name] = String(value);
    }
  }

  called = called.replace(/\{[^}]+\}/g, chooseGenericId(path, examples));

  const requestBody = operation.requestBody as Record<string, unknown> | undefined;
  const content = (requestBody?.content ?? {}) as Record<string, { schema?: unknown }>;
  const schema =
    content['application/json']?.schema ??
    content['multipart/form-data']?.schema ??
    content['application/x-www-form-urlencoded']?.schema;
  if (schema !== undefined) {
    body = extractExample(schema, doc);
    if (body === undefined) {
      body = {};
    }
  }

  return { called, query, headers, body };
};

async function main(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });
  await app.init();

  const prisma = app.get(PrismaService);
  const swaggerDbExamples = await loadSwaggerDbExamples(prisma);

  const authUser = await prisma.utilisateur.findFirst({
    where: {
      typeUtilisateur: {
        nom: {
          in: ['SUPER_ADMIN', 'ADMIN', 'MODERATEUR', 'PROPRIETAIRE'],
        },
      },
    },
    select: {
      id: true,
      email: true,
      typeUtilisateur: { select: { nom: true } },
    },
  });

  if (!authUser?.email) {
    throw new Error('Aucun utilisateur de test disponible en base pour signer un JWT.');
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET manquant.');
  }

  const accessToken = sign(
    {
      userId: authUser.id,
      typeUtilisateur: authUser.typeUtilisateur?.nom ?? null,
      tokenType: 'access',
    },
    jwtSecret,
    {
      subject: authUser.email,
      expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
    },
  );

  const doc = SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('tmp').setVersion('1').build());
  applySwaggerDbExamples(doc, swaggerDbExamples);
  const server = app.getHttpServer();
  const results: CallResult[] = [];

  for (const [path, pathItem] of Object.entries(doc.paths)) {
    for (const method of HTTP_METHODS) {
      const operation = (pathItem as Record<string, unknown>)[method] as Record<string, unknown> | undefined;
      if (!operation) continue;

      const input = buildRequestInput(path, operation, doc, swaggerDbExamples);
      let req = supertest(server)[method](input.called);
      if (Object.keys(input.query).length > 0) req = req.query(input.query);
      for (const [headerName, headerValue] of Object.entries(input.headers)) {
        req = req.set(headerName, headerValue);
      }
      if (isProtectedOperation(operation)) {
        req = req.set('Authorization', `Bearer ${accessToken}`);
      }
      if (input.body !== undefined && input.body !== null) {
        req = req.send(input.body);
      }

      const res = await req;
      results.push({
        method: method.toUpperCase(),
        path,
        called: input.called,
        status: res.status,
        error: res.status >= 400 ? (res.body?.message ?? res.body ?? res.text ?? null) : undefined,
      });
    }
  }

  const byStatus: Record<string, number> = {};
  for (const result of results) {
    const key = String(result.status);
    byStatus[key] = (byStatus[key] ?? 0) + 1;
  }

  const success = results.filter((result) => result.status >= 200 && result.status < 300);
  const failures = results.filter((result) => result.status >= 400);

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        total: results.length,
        user: {
          id: authUser.id,
          email: authUser.email,
          role: authUser.typeUtilisateur?.nom ?? null,
        },
        byStatus,
        successCount: success.length,
        failureCount: failures.length,
        failuresFirst100: failures.slice(0, 100),
      },
      null,
      2,
    ),
  );

  await app.close();
}

void main();
