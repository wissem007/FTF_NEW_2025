package com.football.management.service.validation;

import com.football.management.dto.DemandePlayersDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;

/**
 * Validation des règles métier complexes 
 * (prêts, transferts, contrats, périodes autorisées)
 */
@Component
public class BusinessRulesValidator {
    
    private static final Long AMATEUR = 1L;
    private static final Long REGIME_CP = 5L;
    private static final Long TRANSFERT = 3L;
    private static final Long TRANSFERT_LIBRE = 4L;
    private static final Long PRET = 5L;
    private static final Long LIGUE_I = 1L;
    private static final Long LIGUE_II = 2L;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public boolean validate(
        DemandePlayersDTO demande,
        ValidationResult result,
        Long categoryId,
        Long divisionId
    ) {
        boolean valid = true;
        
        valid &= validateAuthorizedPeriods(demande, result);
        valid &= validateContractRules(demande, result, divisionId);
        valid &= validateTransferRules(demande, result, categoryId, divisionId);
        valid &= validateLoanRules(demande, result, divisionId);
        
        return valid;
    }
    
    private boolean validateAuthorizedPeriods(
        DemandePlayersDTO demande,
        ValidationResult result
    ) {
        LocalDate today = LocalDate.now();
        Month currentMonth = today.getMonth();
        
        // Période de vacances
        if (currentMonth == Month.JULY || currentMonth == Month.AUGUST) {
            result.addWarning(
                "Période de vacances - vérifiez les autorisations spéciales"
            );
        }
        
        // Périodes spéciales pour transferts
        if (isTransferType(demande.getTypeLicenceId())) {
            boolean summerPeriod = (currentMonth.getValue() >= 6 && currentMonth.getValue() <= 9);
            boolean winterPeriod = (currentMonth == Month.JANUARY);
            
            if (!summerPeriod && !winterPeriod) {
                result.addWarning(
                    "Période de transfert inhabituelle - vérification des autorisations requise"
                );
            }
        }
        
        return true;
    }
    
    private boolean validateContractRules(
        DemandePlayersDTO demande,
        ValidationResult result,
        Long divisionId
    ) {
        if (demande.getContractDate() == null || demande.getContractDateFin() == null) {
            return true;
        }
        
        // Calcul durée contrat
        long contractMonths = java.time.temporal.ChronoUnit.MONTHS.between(
            demande.getContractDate(), 
            demande.getContractDateFin()
        );
        
        // Validation durée selon division
        if (isProfessionalDivision(divisionId)) {
            if (contractMonths < 12) {
                result.addError(
                    "Durée de contrat trop courte pour cette division (minimum 1 an)"
                );
                return false;
            }
            
            if (contractMonths > 60) {
                result.addError(
                    "Durée de contrat trop longue (maximum 5 ans)"
                );
                return false;
            }
        }
        
        return true;
    }
    
    private boolean validateTransferRules(
        DemandePlayersDTO demande,
        ValidationResult result,
        Long categoryId,
        Long divisionId
    ) {
        if (!isTransferType(demande.getTypeLicenceId())) {
            return true;
        }
        
        // Numéro de licence obligatoire
        if (demande.getLicenceNum() == null || demande.getLicenceNum().trim().isEmpty()) {
            result.addError("Numéro de licence obligatoire pour un transfert");
            return false;
        }
        
        // Contrat obligatoire pour professionnels
        if (!demande.getRegimeId().equals(BigDecimal.valueOf(AMATEUR))) {
            if (demande.getContractDate() == null) {
                result.addError(
                    "Date de contrat obligatoire pour un transfert professionnel"
                );
                return false;
            }
        }
        
        return true;
    }
    
    private boolean validateLoanRules(
        DemandePlayersDTO demande,
        ValidationResult result,
        Long divisionId
    ) {
        if (demande.getTypeLicenceId() == null || 
            demande.getTypeLicenceId().longValue() != PRET) {
            return true;
        }
        
        // Durée de prêt obligatoire
        if (demande.getDureePret() == null) {
            result.addError("Durée de prêt obligatoire");
            return false;
        }
        
        int duree = demande.getDureePret().intValue();
        if (duree < 1 || duree > 2) {
            result.addError(
                "Durée de prêt invalide (entre 1 et 2 ans autorisée)"
            );
            return false;
        }
        
        return true;
    }
    
    // Méthodes utilitaires
    private boolean isTransferType(BigDecimal typeId) {
        return typeId != null && (
            typeId.longValue() == TRANSFERT || 
            typeId.longValue() == TRANSFERT_LIBRE
        );
    }
    
    private boolean isProfessionalDivision(Long divisionId) {
        return divisionId != null && 
               (divisionId.equals(LIGUE_I) || divisionId.equals(LIGUE_II));
    }
}