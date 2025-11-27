package com.football.management.service.validation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import com.football.management.dto.DemandePlayersDTO;

import java.math.BigDecimal;
import java.util.Map;
import java.util.HashMap;

/**
 * VALIDATEUR POUR LES RENOUVELLEMENTS
 * Vérifie que le joueur était dans le même club la saison précédente
 */
@Component
public class RenewalValidator {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Valide une demande de renouvellement
     */
    public ValidationResult validateRenewalRequest(DemandePlayersDTO dto) {
        ValidationResult result = new ValidationResult();
        
        // Vérifier si c'est un RENOUVELLEMENT (type = 2)
        if (dto.getTypeLicenceId() == null || dto.getTypeLicenceId().compareTo(BigDecimal.valueOf(2)) != 0) {
            return result; // Pas un renouvellement, OK
        }

        // Vérifier que le joueur existe
        if (dto.getIntervenantId() == null) {
            result.addError("RENOUVELLEMENT impossible : Aucun joueur sélectionné.");
            return result;
        }

        // Vérifier qu'il était dans CE club la saison précédente
        BigDecimal previousSeasonId = getPreviousSeasonId(dto.getSeasonId());
        
        String sql = "SELECT COUNT(*) as count " +
                     "FROM ct_demandes dp " +
                     "WHERE dp.ct_intervenant_id = ? " +
                     "AND dp.ct_team_id = ? " +
                     "AND dp.ct_season_id = ? " +
                     "AND dp.ct_demande_statu_id IN (5, 9)";
        
        try {
            Map<String, Object> queryResult = jdbcTemplate.queryForMap(
                sql,
                dto.getIntervenantId(),
                dto.getTeamId(),
                previousSeasonId
            );
            
            // Convertir le count en int
            Object countObj = queryResult.get("count");
            int count = 0;
            if (countObj instanceof BigDecimal) {
                count = ((BigDecimal) countObj).intValue();
            } else if (countObj instanceof Number) {
                count = ((Number) countObj).intValue();
            }
            
            if (count == 0) {
                // Le joueur n'était PAS dans ce club
                result.addError("❌ RENOUVELLEMENT IMPOSSIBLE\n\n" +
                    "Le joueur n'était pas dans votre club la saison précédente.\n\n" +
                    "📋 SOLUTION : Utilisez l'un de ces types :\n" +
                    "• NOUVELLE (Type 1) : Première licence\n" +
                    "• MUTATION (Type 4) : Joueur d'un autre club (amateur)\n" +
                    "• TRANSFERT (Type 8) : Joueur d'un autre club (professionnel)\n" +
                    "• LIBRE (Type 11) : Joueur sans club");
            }
            
        } catch (Exception e) {
            result.addError("Erreur lors de la vérification : " + e.getMessage());
        }
        
        return result;
    }

    /**
     * Obtient l'ID de la saison précédente
     */
    private BigDecimal getPreviousSeasonId(BigDecimal currentSeasonId) {
        if (currentSeasonId == null) {
            return null;
        }
        
        try {
            String sql = "SELECT id FROM saison " +
                        "WHERE id < ? " +
                        "ORDER BY id DESC " +
                        "FETCH FIRST 1 ROWS ONLY";
            
            Object result = jdbcTemplate.queryForObject(sql, Object.class, currentSeasonId);
            
            if (result instanceof BigDecimal) {
                return (BigDecimal) result;
            } else if (result instanceof Number) {
                return BigDecimal.valueOf(((Number) result).longValue());
            }
            
            return currentSeasonId.subtract(BigDecimal.ONE);
            
        } catch (Exception e) {
            return currentSeasonId.subtract(BigDecimal.ONE);
        }
    }

    /**
     * Vérifie si un joueur peut être renouvelé (pour le frontend)
     */
    public boolean canPlayerBeRenewed(BigDecimal intervenantId, BigDecimal teamId, BigDecimal seasonId) {
        if (intervenantId == null || teamId == null || seasonId == null) {
            return false;
        }
        
        BigDecimal previousSeasonId = getPreviousSeasonId(seasonId);
        
        String sql = "SELECT COUNT(*) FROM ct_demandes " +
                    "WHERE ct_intervenant_id = ? " +
                    "AND ct_team_id = ? " +
                    "AND ct_season_id = ? " +
                    "AND ct_demande_statu_id IN (5, 9)";
        
        try {
            Object countObj = jdbcTemplate.queryForObject(sql, Object.class, intervenantId, teamId, previousSeasonId);
            
            int count = 0;
            if (countObj instanceof BigDecimal) {
                count = ((BigDecimal) countObj).intValue();
            } else if (countObj instanceof Number) {
                count = ((Number) countObj).intValue();
            }
            
            return count > 0;
            
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Obtient les infos de la dernière licence (pour le frontend)
     */
    public Map<String, Object> getPlayerLastLicenceInfo(BigDecimal intervenantId, BigDecimal seasonId) {
        BigDecimal previousSeasonId = getPreviousSeasonId(seasonId);
        
        String sql = "SELECT " +
                    "dp.ct_demande_id as demande_id, " +
                    "t.name as team_name, " +
                    "t.id as team_id, " +
                    "s.libelle as season, " +
                    "dr.libelle as regime, " +
                    "dl.libelle as licence_type, " +
                    "dp.date_enregistrement " +
                    "FROM ct_demandes dp " +
                    "JOIN team t ON dp.ct_team_id = t.id " +
                    "JOIN saison s ON dp.ct_season_id = s.id " +
                    "JOIN dict_regime dr ON dp.ct_regime_id = dr.id " +
                    "LEFT JOIN dict_type_licence dl ON dp.ct_type_licence_id = dl.id " +
                    "WHERE dp.ct_intervenant_id = ? " +
                    "AND dp.ct_season_id = ? " +
                    "AND dp.ct_demande_statu_id IN (5, 9) " +
                    "ORDER BY dp.date_enregistrement DESC " +
                    "FETCH FIRST 1 ROWS ONLY";
        
        try {
            return jdbcTemplate.queryForMap(sql, intervenantId, previousSeasonId);
        } catch (Exception e) {
            return new HashMap<>();
        }
    }
}