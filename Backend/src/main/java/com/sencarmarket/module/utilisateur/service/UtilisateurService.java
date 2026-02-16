package com.sencarmarket.module.utilisateur.service;

import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import com.sencarmarket.module.utilisateur.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UtilisateurService implements IUtilisateurService {

    private final UtilisateurRepository utilisateurRepository;

    public List<Utilisateur> findAll() {
        return utilisateurRepository.findAll();
    }

    public Optional<Utilisateur> findById(UUID id) {
        return utilisateurRepository.findById(id);
    }

    public Optional<Utilisateur> findByEmail(String email) {
        return utilisateurRepository.findByEmail(email);
    }

    public Optional<Utilisateur> findByTelephone(String telephone) {
        return utilisateurRepository.findByTelephone(telephone);
    }

    public Utilisateur save(Utilisateur utilisateur) {
        return utilisateurRepository.save(utilisateur);
    }

    public void deleteById(UUID id) {
        utilisateurRepository.deleteById(id);
    }

    public boolean existsByEmail(String email) {
        return utilisateurRepository.existsByEmail(email);
    }

    public boolean existsByTelephone(String telephone) {
        return utilisateurRepository.existsByTelephone(telephone);
    }
}
