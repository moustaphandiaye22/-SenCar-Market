import { PrismaClient } from '@prisma/client';

declare const process: any;

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const servicesSenegal = [
    {
      id: '41000000-0000-4000-8000-000000000001',
      nom: 'Vidange Complète',
      description: 'Changement d\'huile moteur, filtre à huile, filtre à air et points de contrôle.',
      prix: '25000',
      duree_estimee: 45,
      categorie: 'ENTRETIEN',
      actif: true,
    },
    {
      id: '41000000-0000-4000-8000-000000000002',
      nom: 'Diagnostic Électronique',
      description: 'Scan complet des calculateurs et lecture des codes défauts (Check Engine).',
      prix: '15000',
      duree_estimee: 30,
      categorie: 'DIAGNOSTIC',
      actif: true,
    },
    {
      id: '41000000-0000-4000-8000-000000000003',
      nom: 'Recharge & Réparation Clim',
      description: 'Recharge en gaz R134a, détection de fuites et nettoyage circuit.',
      prix: '35000',
      duree_estimee: 60,
      categorie: 'REPARATION',
      actif: true,
    },
    {
      id: '41000000-0000-4000-8000-000000000004',
      nom: 'Parallélisme & Équilibrage',
      description: 'Réglage de la géométrie du train avant et équilibrage des roues.',
      prix: '20000',
      duree_estimee: 45,
      categorie: 'ENTRETIEN',
      actif: true,
    },
    {
      id: '41000000-0000-4000-8000-000000000005',
      nom: 'Système de Freinage',
      description: 'Remplacement des plaquettes ou disques de frein et purge du liquide.',
      prix: '12000',
      duree_estimee: 60,
      categorie: 'REPARATION',
      actif: true,
    },
    {
      id: '41000000-0000-4000-8000-000000000006',
      nom: 'Peinture & Tôlerie',
      description: 'Réparation de carrosserie et mise en peinture au four.',
      prix: '50000',
      duree_estimee: 1440,
      categorie: 'CARROSSERIE',
      actif: true,
    },
    {
      id: '41000000-0000-4000-8000-000000000007',
      nom: 'Lavage Lustrage Premium',
      description: 'Lavage complet intérieur/extérieur et polissage de la carrosserie.',
      prix: '10000',
      duree_estimee: 120,
      categorie: 'ENTRETIEN',
      actif: true,
    },
    {
      id: '41000000-0000-4000-8000-000000000008',
      nom: 'Test & Remplacement Batterie',
      description: 'Test du circuit de charge, alternateur et changement de batterie.',
      prix: '5000',
      duree_estimee: 20,
      categorie: 'ENTRETIEN',
      actif: true,
    },
    {
      id: '41000000-0000-4000-8000-000000000009',
      nom: 'Kit de Distribution',
      description: 'Changement de la courroie de distribution et pompe à eau.',
      prix: '45000',
      duree_estimee: 240,
      categorie: 'REPARATION',
      actif: true,
    },
    {
      id: '41000000-0000-4000-8000-000000000010',
      nom: 'Suspension & Amortisseurs',
      description: 'Remplacement des amortisseurs, silentblocs et bras de suspension.',
      prix: '25000',
      duree_estimee: 90,
      categorie: 'REPARATION',
      actif: true,
    },
    {
      id: '41000000-0000-4000-8000-000000000011',
      nom: 'Rénovation Phares',
      description: 'Polissage des phares ternis et remplacement d\'ampoules.',
      prix: '8000',
      duree_estimee: 40,
      categorie: 'ENTRETIEN',
      actif: true,
    },
    {
      id: '41000000-0000-4000-8000-000000000012',
      nom: 'Kit d\'Embrayage',
      description: 'Remplacement complet du disque, mécanisme et butée d\'embrayage.',
      prix: '40000',
      duree_estimee: 180,
      categorie: 'REPARATION',
      actif: true,
    },
    {
      id: '41000000-0000-4000-8000-000000000013',
      nom: 'Nettoyage des Injecteurs',
      description: 'Nettoyage haute pression du système d\'injection pour réduire la consommation.',
      prix: '25000',
      duree_estimee: 120,
      categorie: 'DIAGNOSTIC',
      actif: true,
    },
    {
      id: '41000000-0000-4000-8000-000000000014',
      nom: 'Vérification Pré-Achat',
      description: 'Inspection complète mécanique et électrique avant d\'acheter un véhicule.',
      prix: '15000',
      duree_estimee: 60,
      categorie: 'DIAGNOSTIC',
      actif: true,
    },
    {
      id: '41000000-0000-4000-8000-000000000015',
      nom: 'Réglage de Phares',
      description: 'Ajustement du faisceau lumineux pour une meilleure visibilité nocturne.',
      prix: '5000',
      duree_estimee: 20,
      categorie: 'ENTRETIEN',
      actif: true,
    },
    {
      id: '41000000-0000-4000-8000-000000000016',
      nom: 'Entretien du Système EGR/FAP',
      description: 'Décalaminage et nettoyage de la vanne EGR et du filtre à particules.',
      prix: '45000',
      duree_estimee: 150,
      categorie: 'REPARATION',
      actif: true,
    },
  ];

  console.log('Début du seeding des services de garage...');

  for (const service of servicesSenegal) {
    await prisma.service_garage.upsert({
      where: { id: service.id },
      update: service as any,
      create: service as any,
    });
  }

  console.log('Seeding des services de garage terminé avec succès.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
