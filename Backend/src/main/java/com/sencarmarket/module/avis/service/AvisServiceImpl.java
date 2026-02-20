package com.sencarmarket.module.avis.service;

import com.sencarmarket.module.avis.dto.AvisResponse;
import com.sencarmarket.module.avis.dto.CreateAvisRequest;
import com.sencarmarket.module.avis.entity.Avis;
import com.sencarmarket.module.avis.repository.AvisRepository;
import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.commun.exception.InvalidOperationException;
import com.sencarmarket.module.commun.exception.ResourceNotFoundException;
import com.sencarmarket.module.garage.entity.Garage;
import com.sencarmarket.module.garage.repository.GarageRepository;
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

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implémentation du service avis
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AvisServiceImpl implements AvisService {

    private final AvisRepository avisRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final VehiculeRepository vehiculeRepository;
    private final GarageRepository garageRepository;

    @Override
    @Transactional
    public AvisResponse createAvis(CreateAvisRequest request, UUID auteurId) {
        log.info("Creating avis by user {} for transaction {}", auteurId, request.getTransactionId());

        // Vérifier le type d'avis valide
        Avis.TypeAvis typeAvis;
        try {
            typeAvis = Avis.TypeAvis.valueOf(request.getTypeAvis());
        } catch (IllegalArgumentException e) {
            throw new InvalidOperationException("Type d'avis invalide. Types valides: " + 
                String.join(", ", java.util.Arrays.stream(Avis.TypeAvis.values()).map(Enum::name).toList()));
        }

        // Vérifier la transaction valide
        if (!isTransactionValide(request.getTransactionId(), typeAvis.name())) {
            throw new InvalidOperationException("Transaction invalide ou expirée");
        }

        // Vérifier qu'un avis n'existe pas déjà pour cette transaction
        if (avisRepository.existsByTransactionIdAndAuteurId(request.getTransactionId(), auteurId)) {
            throw new InvalidOperationException("Vous avez déjà laissé un avis pour cette transaction");
        }

        // Vérifier qu'une cible est spécifiée
        int cibleCount = 0;
        if (request.getCibleUtilisateurId() != null) cibleCount++;
        if (request.getVehiculeId() != null) cibleCount++;
        if (request.getGarageId() != null) cibleCount++;

        if (cibleCount == 0) {
            throw new InvalidOperationException("Veuillez spécifier une cible (utilisateur, véhicule ou garage)");
        }

        if (cibleCount > 1) {
            throw new InvalidOperationException("Veuillez spécifier une seule cible");
        }

        // Récupérer l'auteur
        Utilisateur auteur = utilisateurRepository.findById(auteurId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        // Vérifier que l'auteur peut noter cette cible (logique métier)
        // Par exemple, on ne peut pas noter un véhicule qu'on n'a pas acheté/loué
        if (request.getVehiculeId() != null) {
            // Validation supplémentaire pourrait être ajoutée ici
            // en vérifiant que l'utilisateur a bien fait une transaction sur ce véhicule
        }

        // Construire l'avis
        Avis.AvisBuilder avisBuilder = Avis.builder()
                .auteur(auteur)
                .typeAvis(typeAvis)
                .transactionId(request.getTransactionId())
                .note(request.getNote())
                .commentaire(request.getCommentaire())
                .statut(Avis.StatutAvis.PUBLIE);

        // Ajouter la cible
        if (request.getCibleUtilisateurId() != null) {
            Utilisateur cible = utilisateurRepository.findById(request.getCibleUtilisateurId())
                    .orElseThrow(() -> new ResourceNotFoundException("Utilisateur cible non trouvé"));
            // Ne pas permettre de s'auto-noter
            if (cible.getId().equals(auteurId)) {
                throw new InvalidOperationException("Vous ne pouvez pas noter votre propre profil");
            }
            avisBuilder.cibleUtilisateur(cible);
        }

        if (request.getVehiculeId() != null) {
            Vehicule vehicule = vehiculeRepository.findById(request.getVehiculeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Véhicule non trouvé"));
            avisBuilder.vehicule(vehicule);
        }

        if (request.getGarageId() != null) {
            Garage garage = garageRepository.findById(request.getGarageId())
                    .orElseThrow(() -> new ResourceNotFoundException("Garage non trouvé"));
            avisBuilder.garage(garage);
        }

        Avis avis = avisRepository.save(avisBuilder.build());
        log.info("Avis created with ID: {}", avis.getId());

        return AvisResponse.fromEntity(avis);
    }

    @Override
    public AvisResponse getAvisById(UUID avisId) {
        Avis avis = avisRepository.findById(avisId)
                .orElseThrow(() -> new ResourceNotFoundException("Avis non trouvé"));
        return AvisResponse.fromEntity(avis);
    }

    @Override
    public PaginatedResponse<AvisResponse> getAvisByUtilisateur(UUID utilisateurId, int page, int size) {
        Page<Avis> avisPage = avisRepository.findByCibleUtilisateurIdAndStatut(
                utilisateurId, Avis.StatutAvis.PUBLIE, PageRequest.of(page, size));
        return buildPaginatedResponse(avisPage);
    }

    @Override
    public PaginatedResponse<AvisResponse> getAvisByVehicule(UUID vehiculeId, int page, int size) {
        Page<Avis> avisPage = avisRepository.findByVehiculeIdAndStatut(
                vehiculeId, Avis.StatutAvis.PUBLIE, PageRequest.of(page, size));
        return buildPaginatedResponse(avisPage);
    }

    @Override
    public PaginatedResponse<AvisResponse> getAvisByGarage(UUID garageId, int page, int size) {
        Page<Avis> avisPage = avisRepository.findByGarageIdAndStatut(
                garageId, Avis.StatutAvis.PUBLIE, PageRequest.of(page, size));
        return buildPaginatedResponse(avisPage);
    }

    /**
     * Méthode helper pour construire la réponse paginée
     */
    private PaginatedResponse<AvisResponse> buildPaginatedResponse(Page<Avis> avisPage) {
        List<AvisResponse> content = avisPage.getContent().stream()
                .map(AvisResponse::fromEntity)
                .collect(Collectors.toList());

        return PaginatedResponse.<AvisResponse>builder()
                .content(content)
                .page(avisPage.getNumber())
                .size(avisPage.getSize())
                .totalElements(avisPage.getTotalElements())
                .totalPages(avisPage.getTotalPages())
                .last(avisPage.isLast())
                .first(avisPage.isFirst())
                .build();
    }

    @Override
    public Double getNoteMoyenneUtilisateur(UUID utilisateurId) {
        Double moyenne = avisRepository.getNoteMoyenneUtilisateur(utilisateurId);
        return moyenne != null ? Math.round(moyenne * 10.0) / 10.0 : 0.0;
    }

    @Override
    public Double getNoteMoyenneVehicule(UUID vehiculeId) {
        Double moyenne = avisRepository.getNoteMoyenneVehicule(vehiculeId);
        return moyenne != null ? Math.round(moyenne * 10.0) / 10.0 : 0.0;
    }

    @Override
    public Double getNoteMoyenneGarage(UUID garageId) {
        Double moyenne = avisRepository.getNoteMoyenneGarage(garageId);
        return moyenne != null ? Math.round(moyenne * 10.0) / 10.0 : 0.0;
    }

    @Override
    public boolean isTransactionValide(UUID transactionId, String typeAvis) {
        // Vérifier si la transaction existe dans le système
        // Cette méthode devrait vérifier auprès des modules concernés:
        // - Paiement (ACHAT_VEHICULE, LOCATION_VEHICULE)
        // - Garage (SERVICE_GARAGE)
        // - TradeIn (pour VENDEUR, ACHETEUR)
        
        // Pour l'instant, on vérifie seulement qu'un avis n'existe pas déjà
        // En production, on vérifierait auprès des autres modules
        List<Avis> avisExistants = avisRepository.findByTransactionId(transactionId);
        
        // La transaction est valide si:
        // 1. Aucun avis n'existe pour cette transaction (nouveau avis)
        // 2. OU si on veut modifier un avis existant
        
        // Dans une implémentation complète, on vérifierait auprès des autres modules
        // si la transaction est complète et validée
        return avisExistants.isEmpty() || avisExistants.size() < 2;
    }

    @Override
    @Transactional
    public void signalerAvis(UUID avisId, UUID utilisateurId) {
        Avis avis = avisRepository.findById(avisId)
                .orElseThrow(() -> new ResourceNotFoundException("Avis non trouvé"));

        // Vérifier que l'utilisateur n'est pas l'auteur
        if (avis.getAuteur().getId().equals(utilisateurId)) {
            throw new InvalidOperationException("Vous ne pouvez pas signaler votre propre avis");
        }

        avis.setStatut(Avis.StatutAvis.SIGNALEE);
        avisRepository.save(avis);
        log.info("Avis {} signalé par user {}", avisId, utilisateurId);
    }

    @Override
    @Transactional
    public void deleteAvis(UUID avisId, UUID utilisateurId) {
        Avis avis = avisRepository.findById(avisId)
                .orElseThrow(() -> new ResourceNotFoundException("Avis non trouvé"));

        // Vérifier que l'utilisateur est l'auteur ou un admin
        // Pour l'instant, seul l'auteur peut supprimer
        if (!avis.getAuteur().getId().equals(utilisateurId)) {
            throw new InvalidOperationException("Vous ne pouvez pas supprimer cet avis");
        }

        avis.setStatut(Avis.StatutAvis.SUPPRIMEE);
        avisRepository.save(avis);
        log.info("Avis {} supprimé par user {}", avisId, utilisateurId);
    }
}
