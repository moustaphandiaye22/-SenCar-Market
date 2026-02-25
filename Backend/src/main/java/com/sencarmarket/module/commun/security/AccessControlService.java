package com.sencarmarket.module.commun.security;

import com.sencarmarket.module.commun.constants.AppMessages;
import com.sencarmarket.module.commun.exception.InvalidOperationException;
import com.sencarmarket.module.commun.exception.UnauthorizedAccessException;
import com.sencarmarket.module.utilisateur.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccessControlService {

    private static final Set<String> ADMIN_ROLES = Set.of(
            "ROLE_ADMIN",
            "ROLE_MODERATEUR",
            "ROLE_SUPER_ADMIN"
    );

    private final UtilisateurRepository utilisateurRepository;

    public UUID getCurrentUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new InvalidOperationException(AppMessages.USER_NOT_AUTHENTICATED);
        }
        return utilisateurRepository.findByEmail(authentication.getName())
                .map(utilisateur -> utilisateur.getId())
                .orElseThrow(() -> new InvalidOperationException(AppMessages.USER_NOT_AVAILABLE));
    }

    public boolean isAdmin(Authentication authentication) {
        return hasAnyRole(authentication, ADMIN_ROLES.toArray(String[]::new));
    }

    public boolean hasAnyRole(Authentication authentication, String... roles) {
        if (authentication == null || authentication.getAuthorities() == null) {
            return false;
        }
        Set<String> allowed = Arrays.stream(roles).collect(Collectors.toSet());
        return authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .anyMatch(allowed::contains);
    }

    public void checkOwnerOrAdmin(Authentication authentication, UUID ownerId, String message) {
        if (isAdmin(authentication)) {
            return;
        }
        UUID currentUserId = getCurrentUserId(authentication);
        if (ownerId == null || !ownerId.equals(currentUserId)) {
            throw new UnauthorizedAccessException(message);
        }
    }
}
