package com.football.management.service.validation;

import com.football.management.dto.DemandePlayersDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

/**
 * Validation CIN (joueur tunisien) ou Passeport (joueur étranger)
 */
@Component
public class CinPassportValidator {
    
    private static final Long TUNISIE = 193L;
    private static final Long CADETS = 4L;
    private static final String CIN_REGEX = "\\d{8}";
    private static final int MAX_PASSPORT_LENGTH = 20;
    
    private final CadetExceptionChecker cadetExceptionChecker;
    
    // ✅ INJECTION VIA CONSTRUCTEUR
    @Autowired
    public CinPassportValidator(CadetExceptionChecker cadetExceptionChecker) {
        this.cadetExceptionChecker = cadetExceptionChecker;
    }
    
    /**
     * Valide le CIN ou le passeport selon la nationalité
     */
    public boolean validate(
        DemandePlayersDTO demande, 
        ValidationResult result,
        Long categoryId
    ) {
        if (demande.getPaysId() == null || categoryId == null) {
            return true;
        }
        
        // ✅ VÉRIFIER L'EXCEPTION CADET EN PREMIER
        boolean isCadetException = cadetExceptionChecker.isCadetException(demande);       
        
        // Joueur tunisien
        if (demande.getPaysId().compareTo(BigDecimal.valueOf(TUNISIE)) == 0) {
            return validateTunisianCIN(demande, result, categoryId, isCadetException);
        } 
        // Joueur étranger
        else {
            return validateForeignPassport(demande, result, categoryId, isCadetException);
        }
    }
    
    private boolean validateTunisianCIN(
        DemandePlayersDTO demande,
        ValidationResult result,
        Long categoryId,
        boolean isCadetException
    ) {
        // CIN obligatoire à partir de la catégorie cadets
        if (categoryId >= CADETS) {
            
            // ✅ SI EXCEPTION CADET : CIN NON OBLIGATOIRE
            if (isCadetException) {
                // Si le joueur a quand même fourni un CIN, on le valide
                if (demande.getCinNumber() != null && !demande.getCinNumber().trim().isEmpty()) {
                    if (!demande.getCinNumber().matches(CIN_REGEX)) {
                        result.addError(
                            "N° CIN tunisien invalide, il doit être composé de 8 chiffres"
                        );
                        return false;
                    }
                }
                // Pas de CIN fourni, c'est OK grâce à l'exception
                return true;
            }
            
            // ❌ PAS D'EXCEPTION : CIN OBLIGATOIRE
            if (demande.getCinNumber() == null || demande.getCinNumber().trim().isEmpty()) {
                result.addError(
                    "N° CIN obligatoire à partir de la catégorie cadets pour les joueurs tunisiens"
                );
                return false;
            }
            
            // Validation format CIN tunisien (8 chiffres)
            if (!demande.getCinNumber().matches(CIN_REGEX)) {
                result.addError(
                    "N° CIN tunisien invalide, il doit être composé de 8 chiffres"
                );
                return false;
            }
        }
        
        return true;
    }
    
    private boolean validateForeignPassport(
        DemandePlayersDTO demande,
        ValidationResult result,
        Long categoryId,
        boolean isCadetException
    ) {
        // Passport obligatoire à partir de cadets pour étrangers
        if (categoryId >= CADETS) {
            
            // ✅ SI EXCEPTION CADET : PASSEPORT NON OBLIGATOIRE
            if (isCadetException) {
                // Si le joueur a quand même fourni un passeport, on le valide
                if (demande.getPassportNum() != null && !demande.getPassportNum().trim().isEmpty()) {
                    if (demande.getPassportNum().length() > MAX_PASSPORT_LENGTH) {
                        result.addError(
                            "N° Passport invalide, maximum " + MAX_PASSPORT_LENGTH + " caractères autorisés"
                        );
                        return false;
                    }
                }
                // Pas de passeport fourni, c'est OK grâce à l'exception
                return true;
            }
            
            // ❌ PAS D'EXCEPTION : PASSEPORT OBLIGATOIRE
            if (demande.getPassportNum() == null || demande.getPassportNum().trim().isEmpty()) {
                result.addError(
                    "N° Passport obligatoire pour les joueurs étrangers à partir de la catégorie cadets"
                );
                return false;
            }
            
            // Validation longueur passport
            if (demande.getPassportNum().length() > MAX_PASSPORT_LENGTH) {
                result.addError(
                    "N° Passport invalide, maximum " + MAX_PASSPORT_LENGTH + " caractères autorisés"
                );
                return false;
            }
        }
        
        return true;
    }
}