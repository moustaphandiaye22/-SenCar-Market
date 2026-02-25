package com.sencarmarket.module.utilisateur.service;

import com.sencarmarket.module.utilisateur.entity.OtpCode;
import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import com.sencarmarket.module.utilisateur.repository.OtpCodeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class OtpServiceTest {

    private OtpCodeRepository otpCodeRepository;
    private JavaMailSender mailSender;
    private OtpService otpService;

    @BeforeEach
    void setUp() {
        otpCodeRepository = mock(OtpCodeRepository.class);
        mailSender = mock(JavaMailSender.class);
        otpService = new OtpService(otpCodeRepository, mailSender);

        ReflectionTestUtils.setField(otpService, "expirationMinutes", 10);
        ReflectionTestUtils.setField(otpService, "maxTentatives", 5);
        ReflectionTestUtils.setField(otpService, "otpEmailEnabled", true);
        ReflectionTestUtils.setField(otpService, "otpEmailFrom", "no-reply@test.com");
    }

    @Test
    void generateOtp_shouldPersistAndSendEmailWhenEnabled() {
        Utilisateur utilisateur = Utilisateur.builder()
                .id(UUID.randomUUID())
                .email("user@test.com")
                .build();

        when(otpCodeRepository.findByUtilisateurAndTypeAndUtiliseFalse(utilisateur, OtpCode.OtpType.VERIFICATION_EMAIL))
                .thenReturn(Collections.emptyList());
        when(otpCodeRepository.save(any(OtpCode.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OtpCode otpCode = otpService.generateOtp(utilisateur, OtpCode.OtpType.VERIFICATION_EMAIL);

        assertNotNull(otpCode.getCode());
        assertEquals(6, otpCode.getCode().length());

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());
        assertEquals("no-reply@test.com", captor.getValue().getFrom());
        assertEquals("user@test.com", captor.getValue().getTo()[0]);
    }
}
