package com.sencarmarket.module.certification.service;

import com.sencarmarket.module.certification.dto.*;
import com.sencarmarket.module.certification.entity.DemandeCertification;
import com.sencarmarket.module.certification.entity.Inspection;
import com.sencarmarket.module.certification.entity.RapportInspection;
import com.sencarmarket.module.certification.repository.DemandeCertificationRepository;
import com.sencarmarket.module.certification.repository.InspectionRepository;
import com.sencarmarket.module.certification.repository.RapportInspectionRepository;
import com.sencarmarket.module.commun.constants.AppMessages;
import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.commun.exception.InvalidOperationException;
import com.sencarmarket.module.commun.exception.ResourceNotFoundException;
import com.sencarmarket.module.commun.service.PaginationService;
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

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CertificationServiceImpl implements CertificationService {
    private static final String RESOURCE_UTILISATEUR = "Utilisateur";
    private static final String RESOURCE_VEHICULE = "Véhicule";
    private static final String RESOURCE_DEMANDE_CERTIFICATION = "Demande de certification";
    private static final String RESOURCE_INSPECTEUR = "Inspecteur";
    private static final String RESOURCE_INSPECTION = "Inspection";
    private static final String FIELD_ID = "id";

    private final DemandeCertificationRepository demandeCertificationRepository;
    private final InspectionRepository inspectionRepository;
    private final RapportInspectionRepository rapportInspectionRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final VehiculeRepository vehiculeRepository;
    private final CertificationStatusTransitionService certificationStatusTransitionService;
    private final CertificationStorageService certificationStorageService;
    private final CertificationResponseMapper certificationResponseMapper;
    private final PaginationService paginationService;

    private static final double MONTANT_INSPECTION = 50000.0; // 50,000 XOF

    @Override
    @Transactional
    public DemandeCertificationResponse createDemandeCertification(CreateDemandeCertificationRequest request, UUID utilisateurId) {
        log.info("Creating certification request for vehicle {} by user {}", request.getVehiculeId(), utilisateurId);
        
        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_UTILISATEUR, FIELD_ID, utilisateurId));

        Vehicule vehicule = vehiculeRepository.findById(request.getVehiculeId())
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_VEHICULE, FIELD_ID, request.getVehiculeId()));

        // Vérifier si une demande de certification existe déjà pour ce véhicule
        List<DemandeCertification> existingDemandes = demandeCertificationRepository.findByVehiculeId(vehicule.getId());
        boolean hasActiveDemande = existingDemandes.stream()
                .anyMatch(d -> d.getStatut() != DemandeCertification.StatutDemande.CERTIFIEE 
                            && d.getStatut() != DemandeCertification.StatutDemande.REJETEE);
        
        if (hasActiveDemande) {
            log.warn("Active certification request already exists for vehicle {}", request.getVehiculeId());
            throw new InvalidOperationException(AppMessages.CERTIFICATION_REQUEST_ALREADY_ACTIVE);
        }

        DemandeCertification demande = DemandeCertification.builder()
                .utilisateur(utilisateur)
                .vehicule(vehicule)
                .statut(DemandeCertification.StatutDemande.EN_ATTENTE)
                .montantPaiement(MONTANT_INSPECTION)
                .build();

        demande = demandeCertificationRepository.save(demande);
        log.info("Certification request created with ID: {}", demande.getId());
        return certificationResponseMapper.toDemandeResponse(demande);
    }

    @Override
    @Transactional
    public DemandeCertificationResponse processPayment(UUID demandeId, UUID paiementId) {
        log.info("Processing payment for certification request {}", demandeId);
        
        DemandeCertification demande = demandeCertificationRepository.findById(demandeId)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_DEMANDE_CERTIFICATION, FIELD_ID, demandeId));

        if (demande.getStatut() != DemandeCertification.StatutDemande.EN_ATTENTE) {
            log.warn("Invalid status transition for request {}: {}", demandeId, demande.getStatut());
            throw new InvalidOperationException(AppMessages.CERTIFICATION_PAYMENT_INVALID_STATE);
        }

        demande.setPaiementId(paiementId);
        demande.setStatut(DemandeCertification.StatutDemande.PAYEE);
        demande.setDateTraitement(java.time.LocalDateTime.now());

        demande = demandeCertificationRepository.save(demande);
        log.info("Payment processed successfully for request {}", demandeId);
        return certificationResponseMapper.toDemandeResponse(demande);
    }

    @Override
    @Transactional
    public DemandeCertificationResponse assignInspector(UUID demandeId, UUID inspecteurId) {
        log.info("Assigning inspector {} to certification request {}", inspecteurId, demandeId);
        
        DemandeCertification demande = demandeCertificationRepository.findById(demandeId)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_DEMANDE_CERTIFICATION, FIELD_ID, demandeId));

        if (demande.getStatut() != DemandeCertification.StatutDemande.PAYEE) {
            log.warn("Cannot assign inspector - invalid status: {}", demande.getStatut());
            throw new InvalidOperationException(AppMessages.CERTIFICATION_ASSIGN_INSPECTOR_REQUIRES_PAID);
        }

        Utilisateur inspecteur = utilisateurRepository.findById(inspecteurId)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_INSPECTEUR, FIELD_ID, inspecteurId));
        
        demande.setInspecteur(inspecteur);
        demande.setStatut(DemandeCertification.StatutDemande.INSPECTION_PROGRAMMEE);

        demande = demandeCertificationRepository.save(demande);
        log.info("Inspector assigned successfully to request {}", demandeId);
        return certificationResponseMapper.toDemandeResponse(demande);
    }

    @Override
    @Transactional
    public DemandeCertificationResponse updateStatut(UUID demandeId, DemandeCertification.StatutDemande nouveauStatut) {
        log.info("Updating status of certification request {} to {}", demandeId, nouveauStatut);
        
        DemandeCertification demande = demandeCertificationRepository.findById(demandeId)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_DEMANDE_CERTIFICATION, FIELD_ID, demandeId));

        // Validation des transitions de statut
        certificationStatusTransitionService.validateTransition(demande.getStatut(), nouveauStatut);

        demande.setStatut(nouveauStatut);
        
        if (nouveauStatut == DemandeCertification.StatutDemande.REJETEE) {
            demande.setDateTraitement(java.time.LocalDateTime.now());
        }

        demande = demandeCertificationRepository.save(demande);
        log.info("Status updated successfully for request {}", demandeId);
        return certificationResponseMapper.toDemandeResponse(demande);
    }

    @Override
    @Transactional
    public DemandeCertificationResponse updateDemandeCertification(UUID id, CreateDemandeCertificationRequest request) {
        log.info("Updating certification request {}", id);
        
        DemandeCertification demande = demandeCertificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_DEMANDE_CERTIFICATION, FIELD_ID, id));

        if (demande.getStatut() != DemandeCertification.StatutDemande.EN_ATTENTE) {
            throw new InvalidOperationException(AppMessages.CERTIFICATION_ONLY_PENDING_UPDATE);
        }

        demande = demandeCertificationRepository.save(demande);
        log.info("Certification request {} updated", id);
        return certificationResponseMapper.toDemandeResponse(demande);
    }

    @Override
    @Transactional
    public void deleteDemandeCertification(UUID id) {
        log.info("Deleting certification request {}", id);
        
        DemandeCertification demande = demandeCertificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_DEMANDE_CERTIFICATION, FIELD_ID, id));

        if (demande.getStatut() == DemandeCertification.StatutDemande.CERTIFIEE) {
            throw new InvalidOperationException(AppMessages.CERTIFICATION_CANNOT_DELETE_CERTIFIED);
        }

        demandeCertificationRepository.delete(demande);
        log.info("Certification request {} deleted", id);
    }

    @Override
    @Transactional
    public InspectionResponse createInspection(CreateInspectionRequest request, UUID demandeId) {
        log.info("Creating inspection for certification request {}", demandeId);
        
        DemandeCertification demande = demandeCertificationRepository.findById(demandeId)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_DEMANDE_CERTIFICATION, FIELD_ID, demandeId));

        if (demande.getStatut() != DemandeCertification.StatutDemande.INSPECTION_PROGRAMMEE) {
            log.warn("Cannot create inspection - invalid status: {}", demande.getStatut());
            throw new InvalidOperationException(AppMessages.CERTIFICATION_REQUIRES_SCHEDULED_INSPECTION);
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
        return certificationResponseMapper.toInspectionResponse(inspection);
    }

    @Override
    @Transactional
    public InspectionResponse updateInspection(UUID id, CreateInspectionRequest request) {
        log.info("Updating inspection {}", id);
        
        Inspection inspection = inspectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_INSPECTION, FIELD_ID, id));

        if (inspection.getResultat() == Inspection.ResultatInspection.REUSSI || 
            inspection.getResultat() == Inspection.ResultatInspection.ECHEC) {
            throw new InvalidOperationException(AppMessages.CERTIFICATION_CANNOT_UPDATE_FINISHED_INSPECTION);
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
        return certificationResponseMapper.toInspectionResponse(inspection);
    }

    @Override
    @Transactional
    public void deleteInspection(UUID id) {
        log.info("Deleting inspection {}", id);
        
        Inspection inspection = inspectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_INSPECTION, FIELD_ID, id));

        inspectionRepository.delete(inspection);
        log.info("Inspection {} deleted", id);
    }

    @Override
    @Transactional
    public RapportInspectionResponse uploadRapportPdf(UUID inspectionId, MultipartFile file) {
        log.info("Uploading PDF rapport for inspection {}", inspectionId);
        
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_INSPECTION, FIELD_ID, inspectionId));

        String storedPath = certificationStorageService.storePdf(file);
        RapportInspection rapport = rapportInspectionRepository.findByInspectionId(inspectionId)
                .orElse(RapportInspection.builder()
                        .inspection(inspection)
                        .build());

        rapport.setUrlRapportPdf(storedPath);
        rapport.setDateGeneration(java.time.LocalDateTime.now());

        rapport = rapportInspectionRepository.save(rapport);
        log.info("PDF rapport uploaded successfully for inspection {}", inspectionId);
        return certificationResponseMapper.toRapportResponse(rapport);
    }

    @Override
    @Transactional
    public InspectionResponse saveRapportResult(UUID inspectionId, CreateRapportInspectionRequest request) {
        log.info("Saving inspection result for inspection {}", inspectionId);
        
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_INSPECTION, FIELD_ID, inspectionId));

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

        return certificationResponseMapper.toInspectionResponse(inspection);
    }

    @Override
    @Transactional
    public DemandeCertificationResponse generateBadge(UUID demandeId) {
        log.info("Generating badge for certification request {}", demandeId);
        
        DemandeCertification demande = demandeCertificationRepository.findById(demandeId)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_DEMANDE_CERTIFICATION, FIELD_ID, demandeId));

        if (demande.getStatut() != DemandeCertification.StatutDemande.CERTIFIEE) {
            log.warn("Cannot generate badge - invalid status: {}", demande.getStatut());
            throw new InvalidOperationException(AppMessages.CERTIFICATION_REQUIRES_CERTIFIED);
        }

        // Générer une URL de badge (ici juste un exemple - à implémenter selon vos besoins)
        String badgeUrl = certificationStorageService.generateBadgeUrl(demande.getId());
        
        demande.setBadgeCertifieUrl(badgeUrl);
        demande = demandeCertificationRepository.save(demande);

        // Mettre à jour le véhicule pour indiquer qu'il est certifié
        Vehicule vehicule = demande.getVehicule();
        vehiculeRepository.save(vehicule);

        log.info("Badge generated successfully for request {}", demandeId);
        return certificationResponseMapper.toDemandeResponse(demande);
    }

    @Override
    public DemandeCertificationResponse getDemandeById(UUID demandeId) {
        log.debug("Fetching certification request by ID: {}", demandeId);
        DemandeCertification demande = demandeCertificationRepository.findById(demandeId)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_DEMANDE_CERTIFICATION, FIELD_ID, demandeId));
        return certificationResponseMapper.toDemandeResponse(demande);
    }

    @Override
    public PaginatedResponse<DemandeCertificationResponse> getAllDemandes(int page, int size) {
        log.debug("Fetching all certification requests - page: {}, size: {}", page, size);
        
        Page<DemandeCertification> demandePage = demandeCertificationRepository.findAll(PageRequest.of(page, size));
        
        List<DemandeCertificationResponse> content = demandePage.getContent().stream()
                .map(certificationResponseMapper::toDemandeResponse)
                .collect(Collectors.toList());
        
        return paginationService.build(demandePage, content);
    }

    @Override
    public List<DemandeCertificationResponse> getDemandesByUtilisateur(UUID utilisateurId) {
        log.debug("Fetching certification requests for user: {}", utilisateurId);
        return demandeCertificationRepository.findByUtilisateurId(utilisateurId).stream()
                .map(certificationResponseMapper::toDemandeResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PaginatedResponse<InspectionResponse> getInspectionsByInspecteur(UUID inspecteurId, int page, int size) {
        log.debug("Fetching inspections for inspector: {} - page: {}, size: {}", inspecteurId, page, size);
        
        Page<Inspection> inspectionPage = inspectionRepository.findByInspecteurId(inspecteurId, PageRequest.of(page, size));
        
        List<InspectionResponse> content = inspectionPage.getContent().stream()
                .map(certificationResponseMapper::toInspectionResponse)
                .collect(Collectors.toList());
        
        return paginationService.build(inspectionPage, content);
    }

    @Override
    public InspectionResponse getInspectionById(UUID inspectionId) {
        log.debug("Fetching inspection by ID: {}", inspectionId);
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_INSPECTION, FIELD_ID, inspectionId));
        return certificationResponseMapper.toInspectionResponse(inspection);
    }

    // ========== METHODES PRIVEES ==========

}
