import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { basename, join } from 'path';

import { Injectable } from '@nestjs/common';

import { DomainException } from '../../../common/exceptions/domain.exception';

type UploadedFileLike = { originalname?: string; buffer: Buffer };

@Injectable()
export class CertificationDocumentService {
  assertValidDate(value: Date, code: string): void {
    if (Number.isNaN(value.getTime())) {
      throw new DomainException('Date inspection invalide', 400, code);
    }
  }

  async storePdf(file: UploadedFileLike): Promise<string> {
    const uploadDir = join(process.cwd(), 'uploads', 'certifications');
    await mkdir(uploadDir, { recursive: true });

    if (file.originalname && !file.originalname.toLowerCase().endsWith('.pdf')) {
      throw new DomainException('Fichier PDF requis', 400, 'CERTIFICATION_REPORT_FILE_REQUIRED');
    }
    const safeOriginal = basename(file.originalname || 'rapport.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${randomUUID()}_${safeOriginal}`;
    const filePath = join(uploadDir, filename);

    await writeFile(filePath, file.buffer);
    return filePath;
  }

  generateBadgeUrl(demandeId: string): string {
    return `uploads/certifications/badge_${demandeId}.png`;
  }
}
