import { Injectable } from "@nestjs/common";

import { DomainException } from "../../../common/exceptions/domain.exception";
import { CloudinaryService } from "../../cloudinary/cloudinary.service";

type UploadedFileLike = { originalname?: string; buffer: Buffer };

@Injectable()
export class CertificationDocumentService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}
  assertValidDate(value: Date, code: string): void {
    if (Number.isNaN(value.getTime())) {
      throw new DomainException("Date inspection invalide", 400, code);
    }
  }

  async storePdf(file: UploadedFileLike): Promise<string> {
    if (
      file.originalname &&
      !file.originalname.toLowerCase().endsWith(".pdf")
    ) {
      throw new DomainException(
        "Fichier PDF requis",
        400,
        "CERTIFICATION_REPORT_FILE_REQUIRED",
      );
    }

    try {
      const result = await this.cloudinaryService.uploadImage(
        { buffer: file.buffer },
        "certifications",
      );
      return result.secure_url;
    } catch {
      throw new DomainException(
        "Erreur lors de l'upload du document",
        500,
        "CERTIFICATION_DOC_UPLOAD_ERROR",
      );
    }
  }

  generateBadgeUrl(demandeId: string): string {
    return `uploads/certifications/badge_${demandeId}.png`;
  }
}
