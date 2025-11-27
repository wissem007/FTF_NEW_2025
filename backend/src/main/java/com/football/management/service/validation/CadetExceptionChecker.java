package com.football.management.service.validation;

import com.football.management.dto.DemandePlayersDTO;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.Month;

/**
 * Vérifie si un joueur bénéficie de l'exception Cadet
 * (né entre 01/09/2010 et 31/12/2010)
 */
@Component  // ✅ VÉRIFIEZ QUE CETTE ANNOTATION EST PRÉSENTE
public class CadetExceptionChecker {
    
    private static final LocalDate EXCEPTION_START = LocalDate.of(2010, Month.SEPTEMBER, 1);
    private static final LocalDate EXCEPTION_END = LocalDate.of(2010, Month.DECEMBER, 31);
    
    /**
     * Vérifie si le joueur bénéficie de l'exception Cadet
     */
    public boolean isCadetException(DemandePlayersDTO demande) {
        if (demande.getDateOfBirth() == null) {
            return false;
        }
        
        LocalDate birthDate = demande.getDateOfBirth();
        
        return !birthDate.isBefore(EXCEPTION_START) && 
               !birthDate.isAfter(EXCEPTION_END);
    }
    
    /**
     * Ajoute un avertissement si le joueur est en exception Cadet
     */
    public void checkAndAddWarning(
        DemandePlayersDTO demande,
        ValidationResult result
    ) {
        if (isCadetException(demande)) {
            result.addWarning(
                "Joueur bénéficie de l'exception Cadet (né entre 01/09/2010 et 31/12/2010)"
            );
        }
    }
}