package com.sencarmarket.module.certification.service;

import com.sencarmarket.module.certification.dto.*;
import com.sencarmarket.module.certification.entity.DemandeCertification;
import com.sencarmarket.module.certification.entity.Inspection;
import com.sencarmarket.module.certification.entity.RapportInspection;
import com.sencarmarket.module.certification.repository.DemandeCertificationRepository;
import com.sencarmarket.module.certification.repository.InspectionRepository;
import com.sencarmarket.module.certification.repository.RapportInspectionRepository;
import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.commun.exception.InvalidOperationException;
import com.sencarmarket.module.commun.exception.ResourceNotFoundException;
import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import com.sencarmarket.module.utilisateur.repository.UtilisateurRepository;
import com.sencarmarket.module.vehicule.entity.Vehicule;
import com.sencarmarket.module.vehicule.repository.VehiculeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CertificationServiceImpl implements CertificationService {

    private final DemandeCertificationRepository demandeCertificationRepository;
    private final InspectionRepository inspectionRepository;
    private final RapportInspectionRepository rapportInspectionRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final VehiculeRepository vehiculeRepository;

    private static final String UPLOAD_DIR = "uploads/certifications/";
    private static final double MONTANT_INSPECTION = 50000.0; // 50,000 XOF

    @Override
    @Transactional
    public DemandeCertificationResponse createDemandeCertification(CreateDemandeCertificationRequest request, UUID utilisateurId) {
        log.info("Creating certification request for vehicle {} by user {}", request.getVehiculeId(), utilisateurId);
        
        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'ID: " + utilisateurId));

        Vehicule vehicule = vehiculeRepository.findById(request.getVehiculeId())
                .orElseThrow(() -> new ResourceNotFoundException("Véhicule non trouvé avec l'ID: " + request.getVehiculeId()));

        // Vérifier si une demande de certification existe déjà pour ce véhicule
        List<DemandeCertification> existingDemandes = demandeCertificationRepository.findByVehiculeId(vehicule.getId());
        boolean hasActiveDemande = existingDemandes.stream()
                .anyMatch(d -> d.getStatut() != DemandeCertification.StatutDemande.CERTIFIEE 
                            && d.getStatut() != DemandeCertification.StatutDemande.REJETEE);
        
        if (hasActiveDemande) {
            log.warn("Active certification request already exists for vehicle {}", request.getVehiculeId());
            throw new InvalidOperationException("Une demande de certification est déjà en cours pour ce véhicule");
        }

        DemandeCertification demande = DemandeCertification.builder()
                .utilisateur(utilisateur)
                .vehicule(vehicule)
                .statut(DemandeCertification.StatutDemande.EN_ATTENTE)
                .montantPaiement(MONTANT_INSPECTION)
                .build();

        demande = demandeCertificationRepository.save(demande);
        log.info("Certification request created with ID: {}", demande.getId());
        return mapToDemandeResponse(demande);
    }

    @Override
    @Transactional
    public DemandeCertificationResponse processPayment(UUID demandeId, UUID paiementId) {
        log.info("Processing payment for certification request {}", demandeId);
        
        DemandeCertification demande = demandeCertificationRepository.findById(demandeId)
                .orElseThrow(() -> new ResourceNotFoundException("Demande de certification non trouvée avec l'ID: " + demandeId));

        if (demande.getStatut() != DemandeCertification.StatutDemande.EN_ATTENTE) {
            log.warn("Invalid status transition for request {}: {}", demandeId, demande.getStatut());
            throw new InvalidOperationException("La demande n'est pas dans un état permettant le paiement");
        }

        demande.setPaiementId(paiementId);
        demande.setStatut(DemandeCertification.StatutDemande.PAYEE);
        demande.setDateTraitement(java.time.LocalDateTime.now());

        demande = demandeCertificationRepository.save(demande);
        log.info("Payment processed successfully for request {}", demandeId);
        return mapToDemandeResponse(demande);
    }

    @Override
    @Transactional
    public DemandeCertificationResponse assignInspector(UUID demandeId, UUID inspecteurId) {
        log.info("Assigning inspector {} to certification request {}", inspecteurId, demandeId);
        
        DemandeCertification demande = demandeCertificationRepository.findById(demandeId)
                .orElseThrow(() -> new ResourceNotFoundException("Demande de certification non trouvée avec l'ID: " + demandeId));

        if (demande.getStatut() != DemandeCertification.StatutDemande.PAYEE) {
            log.warn("Cannot assign inspector - invalid status: {}", demande.getStatut());
            throw new InvalidOperationException("La demande doit être payée avant d'assigner un inspecteur");
        }

        Utilisateur inspecteur = utilisateurRepository.findById(inspecteurId)
                .orElseThrow(() -> new ResourceNotFoundException("Inspecteur non trouvé avec l'ID: " + inspecteurId));
        
        demande.setInspecteur(inspecteur);
        demande.setStatut(DemandeCertification.StatutDemande.INSPECTION_PROGRAMMEE);

        demande = demandeCertificationRepository.save(demande);
        log.info("Inspector assigned successfully to request {}", demandeId);
        return mapToDemandeResponse(demande);
    }

    @Override
    @Transactional
    public DemandeCertificationResponse updateStatut(UUID demandeId, DemandeCertification.StatutDemande nouveauStatut) {
        log.info("Updating status of certification request {} to {}", demandeId, nouveauStatut);
        
        DemandeCertification demande = demandeCertificationRepository.findById(demandeId)
                .orElseThrow(() -> new ResourceNotFoundException("Demande de certification non trouvée avec l'ID: " + demandeId));

        // Validation des transitions de statut
        validateStatutTransition(demande.getStatut(), nouveauStatut);

        demande.setStatut(nouveauStatut);
        
        if (nouveauStatut == DemandeCertification.StatutDemande.REJETEE) {
            demande.setDateTraitement(java.time.LocalDateTime.now());
        }

        demande = demandeCertificationRepository.save(demande);
        log.info("Status updated successfully for request {}", demandeId);
        return mapToDemandeResponse(demande);
    }

    @Override
    @Transactional
    public DemandeCertificationResponse updateDemandeCertification(UUID id, CreateDemandeCertificationRequest request) {
        log.info("Updating certification request {}", id);
        
        DemandeCertification demande = demandeCertificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demande de certification non trouvée avec l'ID: " + id));

        if (demande.getStatut() != DemandeCertification.StatutDemande.EN_ATTENTE) {
            throw new InvalidOperationException("Seules les demandes en attente peuvent être modifiées");
        }

        demande = demandeCertificationRepository.save(demande);
        log.info("Certification request {} updated", id);
        return mapToDemandeResponse(demande);
    }

    @Override
    @Transactional
    public void deleteDemandeCertification(UUID id) {
        log.info("Deleting certification request {}", id);
        
        DemandeCertification demande = demandeCertificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demande de certification non trouvée avec l'ID: " + id));

        if (demande.getStatut() == DemandeCertification.StatutDemande.CERTIFIEE) {
            throw new InvalidOperationException("Impossible de supprimer une demande certifiée");
        }

        demandeCertificationRepository.delete(demande);
        log.info("Certification request {} deleted", id);
    }

    @Override
    @Transactional
    public InspectionResponse createInspection(CreateInspectionRequest request, UUID demandeId) {
        log.info("Creating inspection for certification request {}", demandeId);
        
        DemandeCertification demande = demandeCertificationRepository.findById(demandeId)
                .orElseThrow(() -> new ResourceNotFoundException("Demande de certification non trouvée avec l'ID: " + demandeId));

        if (demande.getStatut() != DemandeCertification.StatutDemande.INSPECTION_PROGRAMMEE) {
            log.warn("Cannot create inspection - invalid status: {}", demande.getStatut());
            throw new InvalidOperationException("La demande doit être programmée pour l'inspection");
        }

        Inspection inspection = Inspection.builder()
                .demandeCertification(demande)
                .inspecteur(demande.getInspecteur())
                .dateInspection(request.getDateInspection())
                .resultat(Inspection.ResultatInspection.EN_COURS)
                .kilometrage(request.getKilometrage())
                .etatMoteur(request.getEtatMoteur())
                .etatGenerateur(request.getEtatGenerateur())
                .etatFreinage(request.getEtatFreinage())
                .etatSuspension(request.getEtatSuspension())
                .etatTransmission(request.getEtatTransmission())
                .etatPneus(request.getEtatPneus())
                .etatCarrosserie(request.getEtatCarrosserie())
                .etatInterieur(request.getEtatInterieur())
                .build();

        inspection = inspectionRepository.save(inspection);

        // Mettre à jour le statut de la demande
        demande.setStatut(DemandeCertification.StatutDemande.INSPECTE);
        demande.setDateInspection(request.getDateInspection());
        demandeCertificationRepository.save(demande);

        log.info("Inspection created with ID: {}", inspection.getId());
        return mapToInspectionResponse(inspection);
    }

    @Override
    @Transactional
    public InspectionResponse updateInspection(UUID id, CreateInspectionRequest request) {
        log.info("Updating inspection {}", id);
        
        Inspection inspection = inspectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inspection non trouvée avec l'ID: " + id));

        if (inspection.getResultat() == Inspection.ResultatInspection.REUSSI || 
            inspection.getResultat() == Inspection.ResultatInspection.ECHEC) {
            throw new InvalidOperationException("Impossible de modifier une inspection terminée");
        }

        inspection.setDateInspection(request.getDateInspection());
        inspection.setKilometrage(request.getKilometrage());
        inspection.setEtatMoteur(request.getEtatMoteur());
        inspection.setEtatGenerateur(request.getEtatGenerateur());
        inspection.setEtatFreinage(request.getEtatFreinage());
        inspection.setEtatSuspension(request.getEtatSuspension());
        inspection.setEtatTransmission(request.getEtatTransmission());
        inspection.setEtatPneus(request.getEtatPneus());
        inspection.setEtatCarrosserie(request.getEtatCarrosserie());
        inspection.setEtatInterieur(request.getEtatInterieur());

        inspection = inspectionRepository.save(inspection);
        log.info("Inspection {} updated", id);
        return mapToInspectionResponse(inspection);
    }

    @Override
    @Transactional
    public void deleteInspection(UUID id) {
        log.info("Deleting inspection {}", id);
        
        Inspection inspection = inspectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inspection non trouvée avec l'ID: " + id));

        inspectionRepository.delete(inspection);
        log.info("Inspection {} deleted", id);
    }

    @Override
    @Transactional
    public RapportInspectionResponse uploadRapportPdf(UUID inspectionId, MultipartFile file) {
        log.info("Uploading PDF rapport for inspection {}", inspectionId);
        
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Inspection non trouvée avec l'ID: " + inspectionId));

        try {
            // Créer le répertoire de téléchargement s'il n'existe pas
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Générer un nom de fichier unique
            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);

            // Créer ou mettre à jour le rapport d'inspection
            RapportInspection rapport = rapportInspectionRepository.findByInspectionId(inspectionId)
                    .orElse(RapportInspection.builder()
                            .inspection(inspection)
                            .build());

            rapport.setUrlRapportPdf(filePath.toString());
            rapport.setDateGeneration(java.time.LocalDateTime.now());

            rapport = rapportInspectionRepository.save(rapport);
            log.info("PDF rapport uploaded successfully for inspection {}", inspectionId);
            return mapToRapportResponse(rapport);

        } catch (IOException e) {
            log.error("Error uploading PDF rapport: {}", e.getMessage());
            throw new InvalidOperationException("Erreur lors de l'upload du fichier: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public InspectionResponse saveRapportResult(UUID inspectionId, CreateRapportInspectionRequest request) {
        log.info("Saving inspection result for inspection {}", inspectionId);
        
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Inspection non trouvée avec l'ID: " + inspectionId));

        // Créer ou mettre à jour le rapport
        RapportInspection rapport = rapportInspectionRepository.findByInspectionId(inspectionId)
                .orElse(RapportInspection.builder()
                        .inspection(inspection)
                        .build());

        rapport.setScoreGlobale(request.getScoreGlobale());
        rapport.setRecommendations(request.getRecommendations());
        rapport.setConclusion(request.getConclusion());
        rapport.setEstApprouve(request.getEstApprouve());
        rapport.setDateGeneration(java.time.LocalDateTime.now());

        rapportInspectionRepository.save(rapport);

        // Mettre à jour le résultat de l'inspection
        inspection.setResultat(request.getResultat());
        inspection.setCommentaire(request.getConclusion());
        inspection.setScoreTotal(request.getScoreGlobale());

        inspection = inspectionRepository.save(inspection);

        // Mettre à jour le statut de la demande
        DemandeCertification demande = inspection.getDemandeCertification();
        if (request.getResultat() == Inspection.ResultatInspection.REUSSI) {
            demande.setStatut(DemandeCertification.StatutDemande.CERTIFIEE);
            log.info("Certification request {} CERTIFIED", demande.getId());
        } else if (request.getResultat() == Inspection.ResultatInspection.ECHEC) {
            demande.setStatut(DemandeCertification.StatutDemande.REJETEE);
            demande.setMotifRejet(request.getConclusion());
            log.info("Certification request {} REJECTED", demande.getId());
        } else {
            demande.setStatut(DemandeCertification.StatutDemande.INSPECTE);
        }
        
        demande.setDateTraitement(java.time.LocalDateTime.now());
        demandeCertificationRepository.save(demande);

        return mapToInspectionResponse(inspection);
    }

    @Override
    @Transactional
    public DemandeCertificationResponse generateBadge(UUID demandeId) {
        log.info("Generating badge for certification request {}", demandeId);
        
        DemandeCertification demande = demandeCertificationRepository.findById(demandeId)
                .orElseThrow(() -> new ResourceNotFoundException("Demande de certification non trouvée avec l'ID: " + demandeId));

        if (demande.getStatut() != DemandeCertification.StatutDemande.CERTIFIEE) {
            log.warn("Cannot generate badge - invalid status: {}", demande.getStatut());
            throw new InvalidOperationException("La demande doit être certifiée pour générer un badge");
        }

        // Générer une URL de badge (ici juste un exemple - à implémenter selon vos besoins)
        String badgeUrl = UPLOAD_DIR + "badge_" + demande.getId() + ".png";
        
        demande.setBadgeCertifieUrl(badgeUrl);
        demande = demandeCertificationRepository.save(demande);

        // Mettre à jour le véhicule pour indiquer qu'il est certifié
        Vehicule vehicule = demande.getVehicule();
        vehiculeRepository.save(vehicule);

        log.info("Badge generated successfully for request {}", demandeId);
        return mapToDemandeResponse(demande);
    }

    @Override
    public DemandeCertificationResponse getDemandeById(UUID demandeId) {
        log.debug("Fetching certification request by ID: {}", demandeId);
        DemandeCertification demande = demandeCertificationRepository.findById(demandeId)
                .orElseThrow(() -> new ResourceNotFoundException("Demande de certification non trouvée avec l'ID: " + demandeId));
        return mapToDemandeResponse(demande);
    }

    @Override
    public PaginatedResponse<DemandeCertificationResponse> getAllDemandes(int page, int size) {
        log.debug("Fetching all certification requests - page: {}, size: {}", page, size);
        
        Page<DemandeCertification> demandePage = demandeCertificationRepository.findAll(PageRequest.of(page, size));
        
        List<DemandeCertificationResponse> content = demandePage.getContent().stream()
                .map(this::mapToDemandeResponse)
                .collect(Collectors.toList());
        
        return buildPaginatedResponse(demandePage, content);
    }

    @Override
    public List<DemandeCertificationResponse> getDemandesByUtilisateur(UUID utilisateurId) {
        log.debug("Fetching certification requests for user: {}", utilisateurId);
        return demandeCertificationRepository.findByUtilisateurId(utilisateurId).stream()
                .map(this::mapToDemandeResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PaginatedResponse<InspectionResponse> getInspectionsByInspecteur(UUID inspecteurId, int page, int size) {
        log.debug("Fetching inspections for inspector: {} - page: {}, size: {}", inspecteurId, page, size);
        
        Page<Inspection> inspectionPage = inspectionRepository.findByInspecteurId(inspecteurId, PageRequest.of(page, size));
        
        List<InspectionResponse> content = inspectionPage.getContent().stream()
                .map(this::mapToInspectionResponse)
                .collect(Collectors.toList());
        
        return buildPaginatedResponse(inspectionPage, content);
    }

    @Override
    public InspectionResponse getInspectionById(UUID inspectionId) {
        log.debug("Fetching inspection by ID: {}", inspectionId);
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Inspection non trouvée avec l'ID: " + inspectionId));
        return mapToInspectionResponse(inspection);
    }

    // ========== METHODES PRIVEES ==========

    /**
     * Méthode helper pour construire une réponse paginée
     */
    private <T> PaginatedResponse<T> buildPaginatedResponse(Page<?> page, List<T> content) {
        return PaginatedResponse.<T>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .first(page.isFirst())
                .build();
    }
    private DemandeCertificationResponse mapToDemandeResponse(DemandeCertification demande) {
        return DemandeCertificationResponse.builder()
                .id(demande.getId())
                .utilisateurId(demande.getUtilisateur() != null ? demande.getUtilisateur().getId() : null)
                .utilisateurNom(demande.getUtilisateur() != null ? demande.getUtilisateur().getNom() : null)
                .vehiculeId(demande.getVehicule() != null ? demande.getVehicule().getId() : null)
                .vehiculeDescription(demande.getVehicule() != null ? 
                        demande.getVehicule().getMarque() + " " + demande.getVehicule().getModele() : null)
                .statut(demande.getStatut())
                .montantPaiement(demande.getMontantPaiement())
                .paiementId(demande.getPaiementId())
                .inspecteurId(demande.getInspecteur() != null ? demande.getInspecteur().getId() : null)
                .inspecteurNom(demande.getInspecteur() != null ? demande.getInspecteur().getNom() : null)
                .dateSoumission(demande.getDateSoumission())
                .dateTraitement(demande.getDateTraitement())
                .dateInspection(demande.getDateInspection())
                .motifRejet(demande.getMotifRejet())
                .badgeCertifieUrl(demande.getBadgeCertifieUrl())
                .createdAt(demande.getCreatedAt())
                .updatedAt(demande.getUpdatedAt())
                .build();
    }

    private InspectionResponse mapToInspectionResponse(Inspection inspection) {
        return InspectionResponse.builder()
                .id(inspection.getId())
                .demandeCertificationId(inspection.getDemandeCertification() != null ? 
                        inspection.getDemandeCertification().getId() : null)
                .inspecteurId(inspection.getInspecteur() != null ? inspection.getInspecteur().getId() : null)
                .inspecteurNom(inspection.getInspecteur() != null ? inspection.getInspecteur().getNom() : null)
                .dateInspection(inspection.getDateInspection())
                .resultat(inspection.getResultat())
                .commentaire(inspection.getCommentaire())
                .kilometrage(inspection.getKilometrage())
                .etatMoteur(inspection.getEtatMoteur())
                .etatGenerateur(inspection.getEtatGenerateur())
                .etatFreinage(inspection.getEtatFreinage())
                .etatSuspension(inspection.getEtatSuspension())
                .etatTransmission(inspection.getEtatTransmission())
                .etatPneus(inspection.getEtatPneus())
                .etatCarrosserie(inspection.getEtatCarrosserie())
                .etatInterieur(inspection.getEtatInterieur())
                .scoreTotal(inspection.getScoreTotal())
                .createdAt(inspection.getCreatedAt())
                .updatedAt(inspection.getUpdatedAt())
                .build();
    }

    private RapportInspectionResponse mapToRapportResponse(RapportInspection rapport) {
        return RapportInspectionResponse.builder()
                .id(rapport.getId())
                .inspectionId(rapport.getInspection() != null ? rapport.getInspection().getId() : null)
                .urlRapportPdf(rapport.getUrlRapportPdf())
                .dateGeneration(rapport.getDateGeneration())
                .scoreGlobale(rapport.getScoreGlobale())
                .recommendations(rapport.getRecommendations())
                .conclusion(rapport.getConclusion())
                .estApprouve(rapport.getEstApprouve())
                .createdAt(rapport.getCreatedAt())
                .updatedAt(rapport.getUpdatedAt())
                .build();
    }

    private void validateStatutTransition(DemandeCertification.StatutDemande currentStatut, 
                                          DemandeCertification.StatutDemande newStatut) {
        switch (currentStatut) {
            case EN_ATTENTE:
                if (newStatut != DemandeCertification.StatutDemande.PAYEE 
                    && newStatut != DemandeCertification.StatutDemande.REJETEE) {
                    throw new InvalidOperationException("Transition de statut invalide: " + currentStatut + " -> " + newStatut);
                }
                break;
            case PAYEE:
                if (newStatut != DemandeCertification.StatutDemande.INSPECTION_PROGRAMMEE 
                    && newStatut != DemandeCertification.StatutDemande.REJETEE) {
                    throw new InvalidOperationException("Transition de statut invalide: " + currentStatut + " -> " + newStatut);
                }
                break;
            case INSPECTION_PROGRAMMEE:
                if (newStatut != DemandeCertification.StatutDemande.INSPECTE 
                    && newStatut != DemandeCertification.StatutDemande.REJETEE) {
                    throw new InvalidOperationException("Transition de statut invalide: " + currentStatut + " -> " + newStatut);
                }
                break;
            case INSPECTE:
                if (newStatut != DemandeCertification.StatutDemande.CERTIFIEE 
                    && newStatut != DemandeCertification.StatutDemande.REJETEE) {
                    throw new InvalidOperationException("Transition de statut invalide: " + currentStatut + " -> " + newStatut);
                }
                break;
            case CERTIFIEE:
            case REJETEE:
                throw new InvalidOperationException("Impossible de modifier le statut d'une demande certifiée ou rejetée");
        }
    }
}
