package com.football.management.service.validation;

import com.football.management.dto.DemandePlayersDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests CinPassportValidator - Validation CIN et Passeport")
class CinPassportValidatorTest {

    @Mock
    private CadetExceptionChecker cadetExceptionChecker;

    @InjectMocks
    private CinPassportValidator cinPassportValidator;

    private static final Long TUNISIE = 193L;
    private static final Long FRANCE = 75L;
    private static final Long CADETS = 4L;
    private static final Long BENJAMINS = 1L;

    @Test
    @DisplayName("CIN valide (8 chiffres) - Joueur tunisien Cadet SANS exception")
    void testValidCin_TunisianCadet_ShouldPass() {
        // Given
        DemandePlayersDTO demande = new DemandePlayersDTO();
        demande.setPaysId(BigDecimal.valueOf(TUNISIE));
        demande.setCinNumber("12345678");
        demande.setDateOfBirth(LocalDate.of(2010, 5, 15));
        
        ValidationResult result = new ValidationResult();
        
        when(cadetExceptionChecker.isCadetException(any())).thenReturn(false);
        
        // When
        boolean valid = cinPassportValidator.validate(demande, result, CADETS);
        
        // Then
        assertTrue(valid);
        assertTrue(result.getErrors().isEmpty());
    }

    @Test
    @DisplayName("CIN manquant - Joueur tunisien Cadet SANS exception - DOIT échouer")
    void testMissingCin_TunisianCadet_ShouldFail() {
        // Given
        DemandePlayersDTO demande = new DemandePlayersDTO();
        demande.setPaysId(BigDecimal.valueOf(TUNISIE));
        demande.setCinNumber(null);
        demande.setDateOfBirth(LocalDate.of(2010, 5, 15));
        
        ValidationResult result = new ValidationResult();
        
        when(cadetExceptionChecker.isCadetException(any())).thenReturn(false);
        
        // When
        boolean valid = cinPassportValidator.validate(demande, result, CADETS);
        
        // Then
        assertFalse(valid);
        assertFalse(result.getErrors().isEmpty());
        assertTrue(result.getErrors().get(0).contains("CIN obligatoire"));
    }

    @Test
    @DisplayName("CIN manquant - Joueur tunisien Cadet AVEC exception - DOIT passer")
    void testMissingCin_TunisianCadet_WithException_ShouldPass() {
        // Given
        DemandePlayersDTO demande = new DemandePlayersDTO();
        demande.setPaysId(BigDecimal.valueOf(TUNISIE));
        demande.setCinNumber(null);
        demande.setDateOfBirth(LocalDate.of(2010, 10, 10));
        
        ValidationResult result = new ValidationResult();
        
        when(cadetExceptionChecker.isCadetException(any())).thenReturn(true);
        
        // When
        boolean valid = cinPassportValidator.validate(demande, result, CADETS);
        
        // Then
        assertTrue(valid);
        assertTrue(result.getErrors().isEmpty());
    }

    @Test
    @DisplayName("CIN invalide (3 chiffres) - DOIT échouer")
    void testInvalidCin_Only3Digits_ShouldFail() {
        // Given
        DemandePlayersDTO demande = new DemandePlayersDTO();
        demande.setPaysId(BigDecimal.valueOf(TUNISIE));
        demande.setCinNumber("123");
        demande.setDateOfBirth(LocalDate.of(2010, 5, 15));
        
        ValidationResult result = new ValidationResult();
        
        when(cadetExceptionChecker.isCadetException(any())).thenReturn(false);
        
        // When
        boolean valid = cinPassportValidator.validate(demande, result, CADETS);
        
        // Then
        assertFalse(valid);
        assertTrue(result.getErrors().get(0).contains("8 chiffres"));
    }

    @Test
    @DisplayName("CIN avec lettres - DOIT échouer")
    void testInvalidCin_WithLetters_ShouldFail() {
        // Given
        DemandePlayersDTO demande = new DemandePlayersDTO();
        demande.setPaysId(BigDecimal.valueOf(TUNISIE));
        demande.setCinNumber("1234567A");
        demande.setDateOfBirth(LocalDate.of(2010, 5, 15));
        
        ValidationResult result = new ValidationResult();
        
        when(cadetExceptionChecker.isCadetException(any())).thenReturn(false);
        
        // When
        boolean valid = cinPassportValidator.validate(demande, result, CADETS);
        
        // Then
        assertFalse(valid);
        assertTrue(result.getErrors().get(0).contains("8 chiffres"));
    }

    @Test
    @DisplayName("Passeport valide - Joueur étranger Cadet")
    void testValidPassport_ForeignCadet_ShouldPass() {
        // Given
        DemandePlayersDTO demande = new DemandePlayersDTO();
        demande.setPaysId(BigDecimal.valueOf(FRANCE));
        demande.setPassportNum("FR123456");
        demande.setDateOfBirth(LocalDate.of(2010, 5, 15));
        
        ValidationResult result = new ValidationResult();
        
        when(cadetExceptionChecker.isCadetException(any())).thenReturn(false);
        
        // When
        boolean valid = cinPassportValidator.validate(demande, result, CADETS);
        
        // Then
        assertTrue(valid);
        assertTrue(result.getErrors().isEmpty());
    }

    @Test
    @DisplayName("Passeport manquant - Joueur étranger Cadet SANS exception - DOIT échouer")
    void testMissingPassport_ForeignCadet_ShouldFail() {
        // Given
        DemandePlayersDTO demande = new DemandePlayersDTO();
        demande.setPaysId(BigDecimal.valueOf(FRANCE));
        demande.setPassportNum(null);
        demande.setDateOfBirth(LocalDate.of(2010, 5, 15));
        
        ValidationResult result = new ValidationResult();
        
        when(cadetExceptionChecker.isCadetException(any())).thenReturn(false);
        
        // When
        boolean valid = cinPassportValidator.validate(demande, result, CADETS);
        
        // Then
        assertFalse(valid);
        assertTrue(result.getErrors().get(0).contains("Passport obligatoire"));
    }

    @Test
    @DisplayName("CIN non requis - Joueur Benjamin (catégorie inférieure)")
    void testNoCinRequired_Benjamin_ShouldPass() {
        // Given
        DemandePlayersDTO demande = new DemandePlayersDTO();
        demande.setPaysId(BigDecimal.valueOf(TUNISIE));
        demande.setCinNumber(null);
        demande.setDateOfBirth(LocalDate.of(2015, 5, 15));
        
        ValidationResult result = new ValidationResult();
        
        when(cadetExceptionChecker.isCadetException(any())).thenReturn(false);
        
        // When
        boolean valid = cinPassportValidator.validate(demande, result, BENJAMINS);
        
        // Then
        assertTrue(valid);
        assertTrue(result.getErrors().isEmpty());
    }
}