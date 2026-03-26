/**
 * Script de migration des images locales vers Cloudinary
 *
 * Ce script:
 * 1. Lit les fichiers du dossier uploads
 * 2. Les uploade vers Cloudinary
 * 3. Met a jour la base de donnees avec les nouvelles URLs
 *
 * Usage: cd Backend && npx ts-node scripts/migrate-local-images-to-cloudinary.ts
 */

import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import * as streamifier from "streamifier";
import { randomUUID } from "crypto";

// Configurer cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const prisma = new PrismaClient();
const UPLOADS_DIR = join(process.cwd(), "uploads");

interface MigrationResult {
  success: string[];
  failed: string[];
}

async function uploadToCloudinary(
  filePath: string,
  folder: string,
): Promise<string> {
  const fileBuffer: Buffer = await readFile(filePath);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `sencarmarket/${folder}`,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error("No result from Cloudinary"));
        }
      },
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
}

async function migrateVehicules(): Promise<MigrationResult> {
  const result: MigrationResult = { success: [], failed: [] };
  const vehiculesDir = join(UPLOADS_DIR, "vehicules");

  try {
    const files = await readdir(vehiculesDir);

    for (const file of files) {
      try {
        const filePath = join(vehiculesDir, file);
        const cloudinaryUrl = await uploadToCloudinary(filePath, "vehicules");

        // Chercher l'enregistrement dans la base de donnees par URL locale
        const photo = await prisma.photo_vehicule.findFirst({
          where: {
            url: {
              contains: file,
            },
          },
        });

        if (photo) {
          await prisma.photo_vehicule.update({
            where: { id: photo.id },
            data: { url: cloudinaryUrl },
          });
          result.success.push(`vehicules/${file} -> ${photo.id}`);
        } else {
          // Pas de reference trouvee - juste uploader vers Cloudinary sans creer d'enregistrement DB
          // Ces fichiers sont peut-etre des tests ou non lies a des vehicules
          result.success.push(`vehicules/${file} -> uploaded (no DB record)`);
        }

        console.log(`✓ Migrated: vehicules/${file}`);
      } catch (error) {
        result.failed.push(`vehicules/${file}: ${error}`);
        console.error(`✗ Failed: vehicules/${file}`, error);
      }
    }
  } catch (error) {
    console.error("Error reading vehicules directory:", error);
  }

  return result;
}

async function migrateGarages(): Promise<MigrationResult> {
  const result: MigrationResult = { success: [], failed: [] };
  const garagesDir = join(UPLOADS_DIR, "garages");

  try {
    const files = await readdir(garagesDir);

    for (const file of files) {
      try {
        const filePath = join(garagesDir, file);
        const cloudinaryUrl = await uploadToCloudinary(filePath, "garages");

        // Chercher le garage par logo_url
        const garage = await prisma.garage.findFirst({
          where: {
            logo_url: {
              contains: file,
            },
          },
        });

        if (garage) {
          await prisma.garage.update({
            where: { id: garage.id },
            data: { logo_url: cloudinaryUrl },
          });
          result.success.push(`garages/${file} -> ${garage.id}`);
        }

        console.log(`✓ Migrated: garages/${file}`);
      } catch (error) {
        result.failed.push(`garages/${file}: ${error}`);
        console.error(`✗ Failed: garages/${file}`, error);
      }
    }
  } catch (error) {
    console.error("Error reading garages directory:", error);
  }

  return result;
}

async function main() {
  console.log("=== Migration des images locales vers Cloudinary ===\n");

  console.log("Migration des vehicules...");
  const vehiculeResults = await migrateVehicules();

  console.log("\nMigration des garages...");
  const garageResults = await migrateGarages();

  console.log("\n=== Resultats ===");
  console.log(`Vehicules reussis: ${vehiculeResults.success.length}`);
  console.log(`Vehicules echoues: ${vehiculeResults.failed.length}`);
  console.log(`Garages reussis: ${garageResults.success.length}`);
  console.log(`Garages echoues: ${garageResults.failed.length}`);

  if (vehiculeResults.failed.length > 0 || garageResults.failed.length > 0) {
    console.log("\n=== Echecs ===");
    [...vehiculeResults.failed, ...garageResults.failed].forEach((f) =>
      console.log(f),
    );
  }

  await prisma.$disconnect();
}

main()
  .catch(console.error)
  .finally(() => console.log("\nMigration terminee!"));
