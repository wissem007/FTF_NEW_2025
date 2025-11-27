package com.football.management.service.validation;

import com.football.management.dto.DemandePlayersDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.Month;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Tests DateValidator - Validation des dates")
class DateValidatorTest {

    private DateValidator dateValidator;

    @BeforeEach
    void setUp() {
        dateValidator = new DateValidator();
    }

    @Test
    @DisplayName("Date consultation valide (aujourd'hui) - DOIT passer")
    void testValidConsultationDate_Today_ShouldPass() {
        // Given
        DemandePlayersDTO demande = new DemandePlayersDTO();
        demande.setDateConsultationDoctor(LocalDate.now());
        
        ValidationResult result = new ValidationResult();
        
        // When
        boolean valid = dateValidator.validate(demande, result);
        
        // Then
        assertTrue(valid);
        assertTrue(result.getErrors().isEmpty());
    }

    @Test
    @DisplayName("Date consultation valide (il y a 15 jours) - DOIT passer")
    void testValidConsultationDate_15DaysAgo_ShouldPass() {
        // Given
        DemandePlayersDTO demande = new DemandePlayersDTO();
        demande.setDateConsultationDoctor(LocalDate.now().minusDays(15));
        
        ValidationResult result = new ValidationResult();
        
        // When
        boolean valid = dateValidator.validate(demande, result);
        
        // Then
        assertTrue(valid);
        assertTrue(result.getErrors().isEmpty());
    }

    @Test
    @DisplayName("Date consultation trop ancienne (2 mois) - DOIT échouer")
    void testInvalidConsultationDate_2MonthsAgo_ShouldFail() {
        // Given
        DemandePlayersDTO demande = new DemandePlayersDTO();
        demande.setDateConsultationDoctor(LocalDate.now().minusMonths(2));
        
        ValidationResult result = new ValidationResult();
        
        // When
        boolean valid = dateValidator.validate(demande, result);
        
        // Then
        assertFalse(valid);
        assertTrue(result.getErrors().get(0).contains("ne doit pas être inférieure"));
    }

    @Test
    @DisplayName("Date consultation dans le futur - DOIT échouer")
    void testInvalidConsultationDate_Future_ShouldFail() {
        // Given
        DemandePlayersDTO demande = new DemandePlayersDTO();
        demande.setDateConsultationDoctor(LocalDate.now().plusDays(1));
        
        ValidationResult result = new ValidationResult();
        
        // When
        boolean valid = dateValidator.validate(demande, result);
        
        // Then
        assertFalse(valid);
        assertTrue(result.getErrors().get(0).contains("ne doit pas être supérieure"));
    }

    @Test
    @DisplayName("Date consultation manquante - DOIT échouer")
    void testMissingConsultationDate_ShouldFail() {
        // Given
        DemandePlayersDTO demande = new DemandePlayersDTO();
        demande.setDateConsultationDoctor(null);
        
        ValidationResult result = new ValidationResult();
        
        // When
        boolean valid = dateValidator.validate(demande, result);
        
        // Then
        assertFalse(valid);
        assertTrue(result.getErrors().get(0).contains("obligatoire"));
    }

    @Test
    @DisplayName("Date fin contrat = 30/06 - DOIT passer")
    void testValidContractEndDate_June30_ShouldPass() {
        // Given
        DemandePlayersDTO demande = new DemandePlayersDTO();
        demande.setDateConsultationDoctor(LocalDate.now());
        demande.setContractDate(LocalDate.of(2025, 1, 1));
        demande.setContractDateFin(LocalDate.of(2025, 6, 30));
        
        ValidationResult result = new ValidationResult();
        
        // When
        boolean valid = dateValidator.validate(demande, result);
        
        // Then
        assertTrue(valid);
        assertTrue(result.getErrors().isEmpty());
    }

    @Test
    @DisplayName("Date fin contrat ≠ 30/06 - DOIT échouer")
    void testInvalidContractEndDate_NotJune30_ShouldFail() {
        // Given
        DemandePlayersDTO demande = new DemandePlayersDTO();
        demande.setDateConsultationDoctor(LocalDate.now());
        demande.setContractDate(LocalDate.of(2025, 1, 1));
        demande.setContractDateFin(LocalDate.of(2025, 12, 31));
        
        ValidationResult result = new ValidationResult();
        
        // When
        boolean valid = dateValidator.validate(demande, result);
        
        // Then
        assertFalse(valid);
        assertTrue(result.getErrors().get(0).contains("30/06"));
    }

    @Test
    @DisplayName("Date début contrat après date fin - DOIT échouer")
    void testInvalidContractDates_StartAfterEnd_ShouldFail() {
        // Given
        DemandePlayersDTO demande = new DemandePlayersDTO();
        demande.setDateConsultationDoctor(LocalDate.now());
        demande.setContractDate(LocalDate.of(2025, 7, 1));
        demande.setContractDateFin(LocalDate.of(2025, 6, 30));
        
        ValidationResult result = new ValidationResult();
        
        // When
        boolean valid = dateValidator.validate(demande, result);
        
        // Then
        assertFalse(valid);
        assertTrue(result.getErrors().get(0).contains("supérieure à la date début"));
    }
}