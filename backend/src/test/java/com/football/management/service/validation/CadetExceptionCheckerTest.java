package com.football.management.service.validation;

import com.football.management.dto.DemandePlayersDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Tests CadetExceptionChecker - Vérification exception Cadet")
class CadetExceptionCheckerTest {

    private CadetExceptionChecker cadetExceptionChecker;

    @BeforeEach
    void setUp() {
        cadetExceptionChecker = new CadetExceptionChecker();
    }

    @Test
    @DisplayName("Joueur né le 01/09/2010 - DOIT bénéficier de l'exception")
    void testCadetException_FirstDayOfPeriod_ShouldBeTrue() {
        // Given
        DemandePlayersDTO demande = new DemandePlayersDTO();
        demande.setDateOfBirth(LocalDate.of(2010, 9, 1));
        
        // When
        boolean result = cadetExceptionChecker.isCadetException(demande);
        
        // Then
        assertTrue(result, "Un joueur né le 01/09/2010 doit bénéficier de l'exception Cadet");
    }

    @Test
    @DisplayName("Joueur né le 10/10/2010 - DOIT bénéficier de l'exception")
    void testCadetException_MiddleOfPeriod_ShouldBeTrue() {
        // Given
        DemandePlayersDTO demande = new DemandePlayersDTO();
        demande.setDateOfBirth(LocalDate.of(2010, 10, 10));
        
        // When
        boolean result = cadetExceptionChecker.isCadetException(demande);
        
        // Then
        assertTrue(result, "Un joueur né le 10/10/2010 doit bénéficier de l'exception Cadet");
    }

    @Test
    @DisplayName("Joueur né le 31/12/2010 - DOIT bénéficier de l'exception")
    void testCadetException_LastDayOfPeriod_ShouldBeTrue() {
        // Given
        DemandePlayersDTO demande = new DemandePlayersDTO();
        demande.setDateOfBirth(LocalDate.of(2010, 12, 31));
        
        // When
        boolean result = cadetExceptionChecker.isCadetException(demande);
        
        // Then
        assertTrue(result, "Un joueur né le 31/12/2010 doit bénéficier de l'exception Cadet");
    }

    @Test
    @DisplayName("Joueur né le 31/08/2010 - NE DOIT PAS bénéficier de l'exception")
    void testCadetException_BeforePeriod_ShouldBeFalse() {
        // Given
        DemandePlayersDTO demande = new DemandePlayersDTO();
        demande.setDateOfBirth(LocalDate.of(2010, 8, 31));
        
        // When
        boolean result = cadetExceptionChecker.isCadetException(demande);
        
        // Then
        assertFalse(result, "Un joueur né le 31/08/2010 ne doit PAS bénéficier de l'exception Cadet");
    }

    @Test
    @DisplayName("Joueur né le 01/01/2011 - NE DOIT PAS bénéficier de l'exception")
    void testCadetException_AfterPeriod_ShouldBeFalse() {
        // Given
        DemandePlayersDTO demande = new DemandePlayersDTO();
        demande.setDateOfBirth(LocalDate.of(2011, 1, 1));
        
        // When
        boolean result = cadetExceptionChecker.isCadetException(demande);
        
        // Then
        assertFalse(result, "Un joueur né le 01/01/2011 ne doit PAS bénéficier de l'exception Cadet");
    }

    @Test
    @DisplayName("Date de naissance nulle - NE DOIT PAS bénéficier de l'exception")
    void testCadetException_NullBirthDate_ShouldBeFalse() {
        // Given
        DemandePlayersDTO demande = new DemandePlayersDTO();
        demande.setDateOfBirth(null);
        
        // When
        boolean result = cadetExceptionChecker.isCadetException(demande);
        
        // Then
        assertFalse(result, "Une date de naissance nulle ne doit pas déclencher l'exception");
    }

    @ParameterizedTest
    @ValueSource(ints = {9, 10, 11, 12}) // Mois de septembre à décembre
    @DisplayName("Tous les mois de sept-déc 2010 - DOIVENT bénéficier de l'exception")
    void testCadetException_AllMonthsInPeriod_ShouldBeTrue(int month) {
        // Given
        DemandePlayersDTO demande = new DemandePlayersDTO();
        demande.setDateOfBirth(LocalDate.of(2010, month, 15));
        
        // When
        boolean result = cadetExceptionChecker.isCadetException(demande);
        
        // Then
        assertTrue(result, "Tous les joueurs nés entre 09/2010 et 12/2010 doivent bénéficier de l'exception");
    }

    @Test
    @DisplayName("Ajouter warning dans ValidationResult")
    void testCheckAndAddWarning_WithCadetException_ShouldAddWarning() {
        // Given
        DemandePlayersDTO demande = new DemandePlayersDTO();
        demande.setDateOfBirth(LocalDate.of(2010, 10, 10));
        ValidationResult result = new ValidationResult();
        
        // When
        cadetExceptionChecker.checkAndAddWarning(demande, result);
        
        // Then
        assertFalse(result.getWarnings().isEmpty(), "Un warning doit être ajouté");
        assertTrue(result.getWarnings().get(0).contains("exception Cadet"), 
                   "Le warning doit mentionner l'exception Cadet");
    }

    @Test
    @DisplayName("Pas de warning si pas d'exception Cadet")
    void testCheckAndAddWarning_WithoutCadetException_ShouldNotAddWarning() {
        // Given
        DemandePlayersDTO demande = new DemandePlayersDTO();
        demande.setDateOfBirth(LocalDate.of(2010, 8, 15));
        ValidationResult result = new ValidationResult();
        
        // When
        cadetExceptionChecker.checkAndAddWarning(demande, result);
        
        // Then
        assertTrue(result.getWarnings().isEmpty(), "Aucun warning ne doit être ajouté");
    }
}