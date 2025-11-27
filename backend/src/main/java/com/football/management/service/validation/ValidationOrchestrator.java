package com.football.management.service.validation;

import com.football.management.dto.DemandePlayersDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Orchestrateur central qui coordonne tous les validateurs
 */
@Component
public class ValidationOrchestrator {
    
    @Autowired
    private CadetExceptionChecker cadetExceptionChecker;
    
    @Autowired
    private CinPassportValidator cinPassportValidator;
    
    @Autowired
    private DateValidator dateValidator;
    
    @Autowired
    private MandatoryFieldValidator mandatoryFieldValidator;
    
    @Autowired
    private PlayerQuotaValidator playerQuotaValidator;
    
    @Autowired
    private DuplicateDemandeValidator duplicateDemandeValidator;
    
    @Autowired
    private BusinessRulesValidator businessRulesValidator;

    @Autowired
    private RenewalValidator renewalValidator;

    @Autowired
    private NouvelleLicenceValidator nouvelleLicenceValidator;

    @Autowired
    private RenewalAfterLoanValidator renewalAfterLoanValidator;

    @Autowired
    private ReturnFromMutationValidator returnFromMutationValidator;

    @Autowired
    private PretValidator pretValidator;

    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    /**
     * VALIDATION COMPLÈTE - Point d'entrée principal
     */
    public ValidationResult validateDemandeComplete(DemandePlayersDTO demande) {
        ValidationResult result = new ValidationResult();
        
        try {
            // Calculer les infos de base
            Integer age = calculateAge(demande.getDateOfBirth());
            Long categoryId = calculatePlayerCategory(demande.getDateOfBirth());
            Long divisionId = getTeamDivision(demande.getTeamId());
            
            result.setAge(age);
            result.setCategoryId(categoryId);
            result.setDivisionId(divisionId);
            result.setPlayerCategory(getCategoryLabel(categoryId));
            result.setRegime(getRegimeLabel(demande.getRegimeId()));
            
            // 1. Vérifier exception Cadet
            cadetExceptionChecker.checkAndAddWarning(demande, result);
            
            // 2. Valider CIN/Passeport
            if (!cinPassportValidator.validate(demande, result, categoryId)) {
                return result;
            }
            
            // 3. Valider les dates
            if (!dateValidator.validate(demande, result)) {
                return result;
            }
            
            // 4. Valider les champs obligatoires
            if (!mandatoryFieldValidator.validate(demande, result, categoryId, divisionId)) {
                return result;
            }
            
            // 5. Valider les quotas
            playerQuotaValidator.validate(demande, result, categoryId, divisionId);
            
            // 6. Valider les doublons
            duplicateDemandeValidator.validate(demande, result, categoryId);

            // 7. ✅ Valider NOUVELLE LICENCE (Type 1)
            ValidationResult nouvelleLicenceResult = nouvelleLicenceValidator.validateNouvelleLicence(demande);
            if (!nouvelleLicenceResult.isValid()) {
                for (String error : nouvelleLicenceResult.getErrors()) {
                    result.addError(error);
                }
                return result;  // Bloquer si nouvelle licence invalide
            }

            // 8. ✅ Valider RENOUVELLEMENT (Type 2)
            ValidationResult renewalResult = renewalValidator.validateRenewal(demande);
            if (!renewalResult.isValid()) {
                for (String error : renewalResult.getErrors()) {
                    result.addError(error);
                }
                return result;  // Bloquer si renouvellement invalide
            }

            // 9. ✅ Valider RETOUR PRET (Type 3)
            ValidationResult renewalAfterLoanResult = renewalAfterLoanValidator.validateRenewalAfterLoan(demande);
            if (!renewalAfterLoanResult.isValid()) {
                for (String error : renewalAfterLoanResult.getErrors()) {
                    result.addError(error);
                }
                return result;  // Bloquer si retour prêt invalide
            }

            // 10. ✅ Valider RETOUR MUTATION (Type 9)
            ValidationResult returnFromMutationResult = returnFromMutationValidator.validateReturnFromMutation(demande);
            if (!returnFromMutationResult.isValid()) {
                for (String error : returnFromMutationResult.getErrors()) {
                    result.addError(error);
                }
                return result;  // Bloquer si retour mutation invalide
            }

            // 11. ✅ Valider PRÊT (Type 5)
            ValidationResult pretResult = pretValidator.validatePret(demande, categoryId, divisionId);
            if (!pretResult.isValid()) {
                for (String error : pretResult.getErrors()) {
                    result.addError(error);
                }
                return result;  // Bloquer si prêt invalide
            }

            // 12. Valider les règles métier
            businessRulesValidator.validate(demande, result, categoryId, divisionId);
            
        } catch (Exception e) {
            result.addError("Erreur lors de la validation: " + e.getMessage());
        }
        
        return result;
    }
    
    // MÉTHODES UTILITAIRES
    
    private Integer calculateAge(LocalDate birthDate) {
        if (birthDate == null) return null;
        return LocalDate.now().getYear() - birthDate.getYear();
    }
    
    private Long calculatePlayerCategory(LocalDate birthDate) {
        if (birthDate == null) return 7L; // SENIOR par défaut
        
        if (birthDate.isAfter(LocalDate.of(2017, 1, 1)) && 
            birthDate.isBefore(LocalDate.of(2019, 1, 1))) {
            return 9L; // U7
        }
        if (birthDate.isAfter(LocalDate.of(2015, 1, 1)) && 
            birthDate.isBefore(LocalDate.of(2017, 1, 1))) {
            return 1L; // U9
        }
        if (birthDate.isAfter(LocalDate.of(2013, 1, 1)) && 
            birthDate.isBefore(LocalDate.of(2015, 1, 1))) {
            return 2L; // U11
        }
        if (birthDate.isAfter(LocalDate.of(2011, 1, 1)) && 
            birthDate.isBefore(LocalDate.of(2013, 1, 1))) {
            return 3L; // U13
        }
        if (birthDate.isAfter(LocalDate.of(2009, 1, 1)) && 
            birthDate.isBefore(LocalDate.of(2011, 1, 1))) {
            return 4L; // U15
        }
        if (birthDate.isAfter(LocalDate.of(2007, 1, 1)) && 
            birthDate.isBefore(LocalDate.of(2009, 1, 1))) {
            return 5L; // U17
        }
        if (birthDate.isAfter(LocalDate.of(2005, 1, 1)) && 
            birthDate.isBefore(LocalDate.of(2007, 1, 1))) {
            return 6L; // U19
        }
        
        return 7L; // SENIOR
    }
    
    private String getCategoryLabel(Long categoryId) {
        if (categoryId == null) return "Non définie";
        switch (categoryId.intValue()) {
            case 1: return "U9";
            case 2: return "U11";
            case 3: return "U13";
            case 4: return "U15";
            case 5: return "U17";
            case 6: return "U19";
            case 7: return "Senior";
            case 9: return "U7";
            default: return "Catégorie " + categoryId;
        }
    }
    
    private String getRegimeLabel(BigDecimal regimeId) {
        if (regimeId == null) return "Non défini";
        switch (regimeId.intValue()) {
            case 1: return "Amateur";
            case 2: return "Professionnel";
            case 3: return "Semi-Professionnel";
            case 4: return "Stagiaire";
            case 5: return "CP";
            default: return "Régime " + regimeId;
        }
    }
    
    private Long getTeamDivision(BigDecimal teamId) {
        try {
            String sql = """
                SELECT td.ct_division_id 
                FROM ct_team_divisions td 
                WHERE td.ct_team_id = ? 
                ORDER BY td.ct_season_id DESC 
                LIMIT 1
                """;
            
            List<Long> results = jdbcTemplate.queryForList(sql, Long.class, teamId);
            return results.isEmpty() ? 10L : results.get(0); // 10L = LIGUE_REG par défaut
        } catch (Exception e) {
            return 10L; // Division par défaut
        }
    }
}