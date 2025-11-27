package com.football.management.service.validation;

import com.football.management.dto.DemandePlayersDTO;
import com.football.management.repository.DemandePlayersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

/**
 * Validation de tous les quotas (nombre max de joueurs par équipe, régime, catégorie)
 */
@Component
public class PlayerQuotaValidator {
    
    private static final Long TUNISIE = 193L;
    private static final Long LIGUE_I = 1L;
    private static final Long LIGUE_II = 2L;
    private static final Long PROFESSIONNEL = 2L;
    private static final Long SEMI_PROFESSIONNEL = 3L;
    private static final Long STAGIAIRE = 4L;
    private static final Long JOUEUR_TYPE = 1L;
    
    // Statuts actifs
    private static final List<BigDecimal> ACTIVE_STATUSES = Arrays.asList(
        BigDecimal.valueOf(1L),  // INITIAL
        BigDecimal.valueOf(8L),  // VALIDÉE
        BigDecimal.valueOf(9L)   // À IMPRIMER
    );
    
    @Autowired
    private DemandePlayersRepository demandeRepository;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public boolean validate(
        DemandePlayersDTO demande,
        ValidationResult result,
        Long categoryId,
        Long divisionId
    ) {
        if (demande.getTeamId() == null || demande.getSeasonId() == null) {
            return true;
        }
        
        boolean valid = true;
        
        try {
            valid &= validateTotalPlayersQuota(demande, result);
            valid &= validateProfessionalQuota(demande, result);
            valid &= validateForeignPlayersQuota(demande, result, categoryId, divisionId);
            
        } catch (Exception e) {
            result.addWarning("Impossible de vérifier certains quotas: " + e.getMessage());
        }
        
        return valid;
    }
    
    /**
     * ✅ CORRIGÉ : Récupère le quota depuis la VRAIE colonne
     */
    private Integer getMaxPlayersQuota() {
        try {
            String sql = "SELECT nbr_joueurs_max FROM ct_param_demandes LIMIT 1";
            return jdbcTemplate.queryForObject(sql, Integer.class);
        } catch (Exception e) {
            return 80; // Valeur par défaut
        }
    }
    
    /**
     * Récupère le quota de joueurs professionnels
     */
    private Integer getMaxProPlayersQuota() {
        try {
            String sql = """
                SELECT nbr_licences 
                FROM ct_param_category 
                WHERE ct_player_category_id = 7 
                AND ct_regime_id = 2 
                LIMIT 1
                """;
            return jdbcTemplate.queryForObject(sql, Integer.class);
        } catch (Exception e) {
            return 25; // Valeur par défaut
        }
    }
    
    /**
     * ✅ CORRIGÉ : Récupère le quota d'étrangers selon la division
     */
    private Integer getMaxForeignPlayersQuota(Long divisionId) {
        try {
            if (divisionId == null) {
                return 5;
            }
            
            // Utiliser les colonnes nbr_etr_senior_1 ou nbr_etr_senior_2
            String columnName = divisionId.equals(LIGUE_I) ? "nbr_etr_senior_1" : "nbr_etr_senior_2";
            
            String sql = "SELECT " + columnName + " FROM ct_param_demandes LIMIT 1";
            Integer quota = jdbcTemplate.queryForObject(sql, Integer.class);
            return quota != null ? quota : (divisionId.equals(LIGUE_I) ? 4 : 3);
        } catch (Exception e) {
            // Valeur par défaut selon division
            return divisionId.equals(LIGUE_I) ? 4 : 3;
        }
    }
    
    private boolean validateTotalPlayersQuota(
        DemandePlayersDTO demande,
        ValidationResult result
    ) {
        try {
            Integer maxPlayers = getMaxPlayersQuota();
            
            Long totalPlayers = demandeRepository.countByTeamAndSeasonAndStatusAndType(
                demande.getTeamId(),
                demande.getSeasonId(),
                ACTIVE_STATUSES,
                BigDecimal.valueOf(JOUEUR_TYPE)
            );
            
            if (totalPlayers >= maxPlayers) {
                result.addError(
                    "Nombre maximum de joueurs atteint pour cette équipe (" + maxPlayers + ")"
                );
                return false;
            }
            
            if (totalPlayers >= maxPlayers - 5) {
                result.addWarning(
                    "Attention: proche du quota maximum (" + totalPlayers + "/" + maxPlayers + ")"
                );
            }
            
        } catch (Exception e) {
            result.addWarning("Impossible de vérifier le quota total de joueurs");
        }
        
        return true;
    }
    
    private boolean validateProfessionalQuota(
        DemandePlayersDTO demande,
        ValidationResult result
    ) {
        if (demande.getRegimeId() == null) {
            return true;
        }
        
        Long regimeId = demande.getRegimeId().longValue();
        
        // Vérifier si c'est un régime professionnel
        if (!regimeId.equals(PROFESSIONNEL) && 
            !regimeId.equals(SEMI_PROFESSIONNEL) && 
            !regimeId.equals(STAGIAIRE)) {
            return true;
        }
        
        try {
            Integer maxProPlayers = getMaxProPlayersQuota();
            
            List<BigDecimal> proRegimes = Arrays.asList(
                BigDecimal.valueOf(PROFESSIONNEL),
                BigDecimal.valueOf(SEMI_PROFESSIONNEL),
                BigDecimal.valueOf(STAGIAIRE)
            );
            
            Long proCount = demandeRepository.countByTeamAndSeasonAndRegimesAndStatus(
                demande.getTeamId(),
                demande.getSeasonId(),
                proRegimes,
                ACTIVE_STATUSES,
                BigDecimal.valueOf(JOUEUR_TYPE)
            );
            
            if (proCount >= maxProPlayers) {
                result.addError(
                    "Nombre maximum de joueurs professionnels atteint (" + maxProPlayers + ")"
                );
                return false;
            }
            
        } catch (Exception e) {
            result.addWarning("Impossible de vérifier le quota de joueurs professionnels");
        }
        
        return true;
    }
    
    private boolean validateForeignPlayersQuota(
        DemandePlayersDTO demande,
        ValidationResult result,
        Long categoryId,
        Long divisionId
    ) {
        // Seulement pour les joueurs étrangers
        if (demande.getPaysId() == null || 
            demande.getPaysId().equals(BigDecimal.valueOf(TUNISIE))) {
            return true;
        }
        
        // Seulement pour les divisions professionnelles
        if (!isProfessionalDivision(divisionId)) {
            return true;
        }
        
        try {
            Integer maxForeign = getMaxForeignPlayersQuota(divisionId);
            
            Long foreignCount = demandeRepository.countByTeamAndSeasonAndPaysNotAndStatus(
                demande.getTeamId(),
                demande.getSeasonId(),
                BigDecimal.valueOf(TUNISIE),
                ACTIVE_STATUSES,
                BigDecimal.valueOf(JOUEUR_TYPE)
            );
            
            if (foreignCount >= maxForeign) {
                result.addError(
                    "Nombre maximum de joueurs étrangers atteint (" + maxForeign + ")"
                );
                return false;
            }
            
        } catch (Exception e) {
            result.addWarning("Impossible de vérifier le quota de joueurs étrangers");
        }
        
        return true;
    }
    
    private boolean isProfessionalDivision(Long divisionId) {
        return divisionId != null && 
               (divisionId.equals(LIGUE_I) || divisionId.equals(LIGUE_II));
    }
}