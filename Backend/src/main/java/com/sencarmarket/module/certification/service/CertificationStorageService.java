package com.sencarmarket.module.certification.service;

import com.sencarmarket.module.commun.constants.AppMessages;
import com.sencarmarket.module.commun.exception.InvalidOperationException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class CertificationStorageService {

    private static final String UPLOAD_DIR = "uploads/certifications/";

    public String storePdf(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalName = file.getOriginalFilename() == null ? "rapport.pdf" : file.getOriginalFilename();
            String filename = UUID.randomUUID() + "_" + originalName;
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);
            return filePath.toString();
        } catch (IOException e) {
            throw new InvalidOperationException(
                    AppMessages.concat(AppMessages.PAYMENT_FILE_UPLOAD_ERROR_PREFIX, e.getMessage()));
        }
    }

    public String generateBadgeUrl(UUID demandeId) {
        return UPLOAD_DIR + "badge_" + demandeId + ".png";
    }
}
