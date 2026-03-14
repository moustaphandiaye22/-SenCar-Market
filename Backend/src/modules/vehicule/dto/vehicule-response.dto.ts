import { ApiProperty } from '@nestjs/swagger';

export class VehiculeResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  marque!: string | null;

  @ApiProperty()
  marqueId!: string | null;

  @ApiProperty()
  modele!: string | null;

  @ApiProperty()
  modeleId!: string | null;

  @ApiProperty()
  anneeFabrication!: number | null;

  @ApiProperty()
  kilometrage!: number | null;

  @ApiProperty()
  carburant!: string | null;

  @ApiProperty()
  carburantId!: string | null;

  @ApiProperty()
  boiteVitesse!: string | null;

  @ApiProperty()
  boiteVitesseId!: string | null;

  @ApiProperty()
  couleur!: string | null;

  @ApiProperty()
  prixVente!: string | null;

  @ApiProperty()
  description!: string | null;

  @ApiProperty()
  numeroVin!: string | null;

  @ApiProperty()
  immatriculation!: string | null;

  @ApiProperty()
  statut!: string;

  @ApiProperty()
  prixNegociable!: boolean | null;

  @ApiProperty()
  certifie!: boolean | null;
  @ApiProperty()
  titre!: string | null;

  @ApiProperty()
  nombrePortes!: number | null;

  @ApiProperty()
  nombrePlaces!: number | null;

  @ApiProperty()
  cylindree!: string | null;

  @ApiProperty()
  puissanceFiscale!: string | null;

  @ApiProperty()
  estGarantie!: boolean | null;

  @ApiProperty()
  garantieMois!: number | null;
  @ApiProperty({ type: [String] })
  photosUrls!: string[];

  @ApiProperty()
  estBoost!: boolean | null;

  @ApiProperty()
  boostDebut!: Date | null;

  @ApiProperty()
  boostFin!: Date | null;

  @ApiProperty()
  vues!: number | null;

  @ApiProperty()
  nombreFavoris!: number | null;

  @ApiProperty()
  estFavori!: boolean;

  @ApiProperty()
  proprietaireNom!: string | null;

  @ApiProperty()
  proprietaireId!: string;

  @ApiProperty()
  createdAt!: Date | null;
}
