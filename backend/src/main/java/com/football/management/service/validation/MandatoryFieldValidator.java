package com.football.management.service.validation;

import com.football.management.dto.DemandePlayersDTO;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

/**
 * Validation des champs obligatoires (maillot, photo, poste, médecin)
 */
@Component
public class MandatoryFieldValidator {
    
    private static final Long TUNISIE = 193L;
    private static final Long LIGUE_I = 1L;
    private static final Long LIGUE_II = 2L;
    private static final Long AMATEUR = 1L;
    
    public boolean validate(
        DemandePlayersDTO demande,
        ValidationResult result,
        Long categoryId,
        Long divisionId
    ) {
        boolean valid = true;
        
        valid &= validateBasicFields(demande, result);
        valid &= validateMedicalFields(demande, result);
        valid &= validateTshirtNumber(demande, result, divisionId);
        
        return valid;
    }
    
    private boolean validateBasicFields(
        DemandePlayersDTO demande,
        ValidationResult result
    ) {
        if (demande.getName() == null || demande.getName().trim().isEmpty()) {
            result.addError("Le nom est obligatoire");
            return false;
        }
        
        if (demande.getLastName() == null || demande.getLastName().trim().isEmpty()) {
            result.addError("Le prénom est obligatoire");
            return false;
        }
        
        if (demande.getDateOfBirth() == null) {
            result.addError("La date de naissance est obligatoire");
            return false;
        }
        
        if (demande.getPaysId() == null) {
            result.addError("La nationalité est obligatoire");
            return false;
        }
        
        if (demande.getTeamId() == null) {
            result.addError("L'équipe est obligatoire");
            return false;
        }
        
        if (demande.getSeasonId() == null) {
            result.addError("La saison est obligatoire");
            return false;
        }
        
        if (demande.getRegimeId() == null) {
            result.addError("Le régime est obligatoire");
            return false;
        }
        
        if (demande.getTypeLicenceId() == null) {
            result.addError("Le type de licence est obligatoire");
            return false;
        }
        
        return true;
    }
    
    private boolean validateMedicalFields(
        DemandePlayersDTO demande,
        ValidationResult result
    ) {
        if (demande.getNameDoctor() == null || demande.getNameDoctor().trim().isEmpty()) {
            result.addError("Nom du médecin obligatoire");
            return false;
        }
        
        if (demande.getLastNameDoctor() == null || demande.getLastNameDoctor().trim().isEmpty()) {
            result.addError("Prénom du médecin obligatoire");
            return false;
        }
        
        return true;
    }
    
    private boolean validateTshirtNumber(
        DemandePlayersDTO demande,
        ValidationResult result,
        Long divisionId
    ) {
        // Numéro de maillot obligatoire pour professionnels en Ligue I & II
        if (demande.getRegimeId() != null && 
            !demande.getRegimeId().equals(BigDecimal.valueOf(AMATEUR))) {
            
            if (isProfessionalDivision(divisionId) && demande.getTshirtNum() == null) {
                result.addError(
                    "Numéro de maillot obligatoire pour les joueurs professionnels (Ligue I & Ligue II)"
                );
                return false;
            }
        }
        
        return true;
    }
    
    private boolean isProfessionalDivision(Long divisionId) {
        return divisionId != null && 
               (divisionId.equals(LIGUE_I) || divisionId.equals(LIGUE_II));
    }
}