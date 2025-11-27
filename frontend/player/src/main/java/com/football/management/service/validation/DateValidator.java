package com.football.management.service.validation;

import com.football.management.dto.DemandePlayersDTO;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.Month;

/**
 * Validation de toutes les dates (consultation médecin, contrat, cohérence)
 */
@Component
public class DateValidator {
    
    /**
     * Valide toutes les dates de la demande
     */
    public boolean validate(
        DemandePlayersDTO demande,
        ValidationResult result
    ) {
        boolean valid = true;
        
        valid &= validateMedicalConsultationDate(demande, result);
        valid &= validateContractDates(demande, result);
        
        return valid;
    }
    
    private boolean validateMedicalConsultationDate(
        DemandePlayersDTO demande,
        ValidationResult result
    ) {
        if (demande.getDateConsultationDoctor() == null) {
            result.addError("Date de consultation médicale obligatoire");
            return false;
        }
        
        LocalDate today = LocalDate.now();
        LocalDate consultationDate = demande.getDateConsultationDoctor();
        
        // Ne doit pas être antérieure à 1 mois
        if (consultationDate.isBefore(today.minusMonths(1))) {
            result.addError(
                "Date de consultation ne doit pas être inférieure à la date d'envoi -1 mois"
            );
            return false;
        }
        
        // Ne doit pas être dans le futur
        if (consultationDate.isAfter(today)) {
            result.addError(
                "Date de consultation ne doit pas être supérieure à la date d'envoi"
            );
            return false;
        }
        
        return true;
    }
    
    private boolean validateContractDates(
        DemandePlayersDTO demande,
        ValidationResult result
    ) {
        if (demande.getContractDate() == null || demande.getContractDateFin() == null) {
            return true; // Pas de contrat à valider
        }
        
        LocalDate today = LocalDate.now();
        LocalDate startDate = demande.getContractDate();
        LocalDate endDate = demande.getContractDateFin();
        
        // Date début ne doit pas être dans le futur
        if (startDate.isAfter(today)) {
            result.addError(
                "Date de contrat ne doit pas être supérieure à la date d'envoi"
            );
            return false;
        }
        
        // Date fin doit être supérieure à date début
        if (!startDate.isBefore(endDate)) {
            result.addError(
                "Date fin de contrat doit être supérieure à la date début de contrat"
            );
            return false;
        }
        
        // Date fin doit être 30/06
        if (endDate.getDayOfMonth() != 30 || endDate.getMonth() != Month.JUNE) {
            result.addError(
                "Date fin contrat doit être égale à la date de clôture de saison (30/06)"
            );
            return false;
        }
        
        return true;
    }
}