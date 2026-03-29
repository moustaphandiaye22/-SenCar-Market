import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding reference data...');

  // 1. Carburants
  const essence = await prisma.carburant.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: { id: '00000000-0000-0000-0000-000000000001', nom: 'ESSENCE' }
  });
  const diesel = await prisma.carburant.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: { id: '00000000-0000-0000-0000-000000000002', nom: 'DIESEL' }
  });

  // 2. Boites
  const manuelle = await prisma.boite_vitesse.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: { id: '00000000-0000-0000-0000-000000000001', nom: 'MANUELLE' }
  });
  const automatique = await prisma.boite_vitesse.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: { id: '00000000-0000-0000-0000-000000000002', nom: 'AUTOMATIQUE' }
  });

  // 3. Marques
  const toyota = await prisma.marque.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: { id: '00000000-0000-0000-0000-000000000001', nom: 'Toyota' }
  });
  const mercedes = await prisma.marque.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: { id: '00000000-0000-0000-0000-000000000002', nom: 'Mercedes-Benz' }
  });

  // 4. Modeles
  await prisma.modele.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: { id: '00000000-0000-0000-0000-000000000001', nom: 'Camry', marque_id: toyota.id }
  });
  await prisma.modele.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: { id: '00000000-0000-0000-0000-000000000002', nom: 'Corolla', marque_id: toyota.id }
  });
  await prisma.modele.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: { id: '00000000-0000-0000-0000-000000000003', nom: 'Class C', marque_id: mercedes.id }
  });

  console.log('Seeding successful!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
