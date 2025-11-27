package com.football.management.service.validation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import com.football.management.dto.DemandePlayersDTO;

import java.util.Map;
import java.util.HashMap;

/**
 * ✅ VALIDATEUR POUR LES RÈGLES DE RENOUVELLEMENT
 * 
 * Ce validateur vérifie qu'une demande de RENOUVELLEMENT respecte les règles :
 * - Le joueur DOIT avoir été licencié dans LE MÊME CLUB la saison précédente
 * - Si ce n'est pas le cas, suggère le type de licence approprié
 */
@Component
public class RenewalValidator {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Valide une demande de renouvellement
     * 
     * @param dto La demande à valider
     * @return ValidationResult avec succès ou erreur détaillée
     */
    public ValidationResult validateRenewalRequest(DemandePlayersDTO dto) {
        
        // ✅ Vérifier si c'est une demande de RENOUVELLEMENT
        if (dto.getTypeLicenceId() == null || dto.getTypeLicenceId() != 2) {
            // Ce n'est pas un renouvellement, pas de validation nécessaire
            return ValidationResult.success();
        }

        // ✅ RÈGLE 1 : Le joueur doit exister
        if (dto.getJoueurId() == null) {
            return ValidationResult.error(
                "RENOUVELLEMENT impossible : Aucun joueur sélectionné. " +
                "Un renouvellement nécessite un joueur existant."
            );
        }

        // ✅ RÈGLE 2 : Vérifier que le joueur avait une licence dans CE club la saison précédente
        Long previousSeasonId = getPreviousSeasonId(dto.getSeasonId());
        
        String sql = """
            SELECT COUNT(*) as count,
                   MAX(dl.libelle) as last_licence_type,
                   MAX(t.name) as last_team_name
            FROM demande_players dp
            LEFT JOIN dict_type_licence dl ON dp.type_licence_id = dl.id
            LEFT JOIN team t ON dp.team_id = t.id
            WHERE dp.joueur_id = ?
            AND dp.team_id = ?
            AND dp.season_id = ?
            AND dp.demande_statu_id IN (5, 9)
        """;
        
        Map<String, Object> result = jdbcTemplate.queryForMap(
            sql,
            dto.getJoueurId(),
            dto.getTeamId(),
            previousSeasonId
        );
        
        Integer count = ((Number) result.get("count")).intValue();
        
        if (count == 0) {
            // ✅ Le joueur n'avait PAS de licence dans ce club
            // On vérifie s'il avait une licence ailleurs
            String sqlOtherClub = """
                SELECT 
                    t.name as team_name,
                    s.libelle as season,
                    dr.libelle as regime,
                    dl.libelle as licence_type
                FROM demande_players dp
                JOIN team t ON dp.team_id = t.id
                JOIN saison s ON dp.season_id = s.id
                JOIN dict_regime dr ON dp.regime_id = dr.id
                LEFT JOIN dict_type_licence dl ON dp.type_licence_id = dl.id
                WHERE dp.joueur_id = ?
                AND dp.season_id = ?
                AND dp.demande_statu_id IN (5, 9)
                ORDER BY dp.date_enregistrement DESC
                LIMIT 1
            """;
            
            try {
                Map<String, Object> lastLicence = jdbcTemplate.queryForMap(
                    sqlOtherClub,
                    dto.getJoueurId(),
                    previousSeasonId
                );
                
                String lastTeamName = (String) lastLicence.get("team_name");
                String lastRegime = (String) lastLicence.get("regime");
                
                // Suggérer le bon type de licence selon le régime
                String suggestion = getSuggestionBasedOnRegime(dto.getRegimeId(), lastRegime);
                
                return ValidationResult.error(
                    "❌ RENOUVELLEMENT IMPOSSIBLE\n\n" +
                    "Le joueur n'était PAS dans votre club la saison précédente.\n" +
                    "Dernière licence : " + lastTeamName + " (" + lastRegime + ")\n\n" +
                    "📋 SOLUTION :\n" + suggestion
                );
                
            } catch (Exception e) {
                // Le joueur n'avait aucune licence la saison précédente
                return ValidationResult.error(
                    "❌ RENOUVELLEMENT IMPOSSIBLE\n\n" +
                    "Le joueur n'avait aucune licence active la saison précédente " +
                    "dans votre club.\n\n" +
                    "📋 SOLUTION :\n" +
                    "Utilisez l'un des types suivants :\n" +
                    "- NOUVELLE : Si c'est sa première licence\n" +
                    "- MUTATION : S'il vient d'un autre club (amateur)\n" +
                    "- TRANSFERT : S'il vient d'un autre club (professionnel)\n" +
                    "- LIBRE (AMATEUR) : S'il est sans club"
                );
            }
        }
        
        // ✅ Le joueur avait bien une licence dans ce club la saison précédente
        return ValidationResult.success();
    }

    /**
     * Obtient l'ID de la saison précédente
     */
    private Long getPreviousSeasonId(Long currentSeasonId) {
        if (currentSeasonId == null) {
            return null;
        }
        
        // Logique pour obtenir la saison précédente
        // Adapter selon votre structure de données
        try {
            String sql = """
                SELECT id FROM saison 
                WHERE id < ? 
                ORDER BY id DESC 
                LIMIT 1
            """;
            
            return jdbcTemplate.queryForObject(sql, Long.class, currentSeasonId);
            
        } catch (Exception e) {
            // Si pas de saison précédente trouvée, retourner currentSeasonId - 1
            return currentSeasonId - 1;
        }
    }

    /**
     * Suggère le type de licence approprié selon les régimes
     */
    private String getSuggestionBasedOnRegime(Long newRegimeId, String lastRegime) {
        StringBuilder suggestion = new StringBuilder();
        
        // Cas 1 : Passage vers PROFESSIONNEL (regime_id = 2)
        if (newRegimeId != null && newRegimeId == 2) {
            suggestion.append("Utilisez l'un de ces types :\n");
            suggestion.append("• TRANSFERT (Type 8) : Si le joueur est transféré avec indemnités\n");
            suggestion.append("• TRANSFERT LIBRE (Type 12) : Si le joueur est en fin de contrat\n");
            suggestion.append("• PRÊT (Type 5) : Si le joueur est prêté temporairement\n");
            suggestion.append("• NOUVELLE (Type 1) : Si c'est sa première licence professionnelle");
        }
        // Cas 2 : Passage vers AMATEUR (regime_id = 1)
        else if (newRegimeId != null && newRegimeId == 1) {
            suggestion.append("Utilisez l'un de ces types :\n");
            suggestion.append("• MUTATION (Type 4) : Si le joueur change de club amateur\n");
            suggestion.append("• LIBRE (AMATEUR) (Type 11) : Si le joueur est sans club\n");
            suggestion.append("• PRÊT (Type 5) : Si le joueur est prêté temporairement\n");
            suggestion.append("• NOUVELLE (Type 1) : Si c'est sa première licence");
        }
        // Cas 3 : Passage vers SEMI-PROFESSIONNEL (regime_id = 3, 4)
        else if (newRegimeId != null && (newRegimeId == 3 || newRegimeId == 4)) {
            suggestion.append("Utilisez l'un de ces types :\n");
            suggestion.append("• TRANSFERT (Type 8) : Si le joueur est transféré\n");
            suggestion.append("• TRANSFERT LIBRE (Type 13) : Si le joueur est en fin de contrat\n");
            suggestion.append("• PRÊT (Type 5) : Si le joueur est prêté temporairement\n");
            suggestion.append("• NOUVELLE (Type 1) : Si c'est sa première licence");
        }
        else {
            suggestion.append("Contactez l'administrateur pour déterminer le type approprié");
        }
        
        return suggestion.toString();
    }

    /**
     * Vérifie si le joueur peut être renouvelé
     * (Méthode publique pour vérification avant recherche)
     */
    public boolean canPlayerBeRenewed(Long playerId, Long teamId, Long seasonId) {
        if (playerId == null || teamId == null || seasonId == null) {
            return false;
        }
        
        Long previousSeasonId = getPreviousSeasonId(seasonId);
        
        String sql = """
            SELECT COUNT(*) FROM demande_players
            WHERE joueur_id = ?
            AND team_id = ?
            AND season_id = ?
            AND demande_statu_id IN (5, 9)
        """;
        
        try {
            Integer count = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                playerId,
                teamId,
                previousSeasonId
            );
            
            return count != null && count > 0;
            
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Obtient les informations de la dernière licence du joueur
     */
    public Map<String, Object> getPlayerLastLicenceInfo(Long playerId, Long seasonId) {
        Long previousSeasonId = getPreviousSeasonId(seasonId);
        
        String sql = """
            SELECT 
                dp.id as demande_id,
                t.name as team_name,
                t.id as team_id,
                s.libelle as season,
                dr.libelle as regime,
                dl.libelle as licence_type,
                dp.date_enregistrement,
                ds.libelle as status
            FROM demande_players dp
            JOIN team t ON dp.team_id = t.id
            JOIN saison s ON dp.season_id = s.id
            JOIN dict_regime dr ON dp.regime_id = dr.id
            LEFT JOIN dict_type_licence dl ON dp.type_licence_id = dl.id
            LEFT JOIN demande_statu ds ON dp.demande_statu_id = ds.id
            WHERE dp.joueur_id = ?
            AND dp.season_id = ?
            AND dp.demande_statu_id IN (5, 9)
            ORDER BY dp.date_enregistrement DESC
            LIMIT 1
        """;
        
        try {
            return jdbcTemplate.queryForMap(sql, playerId, previousSeasonId);
        } catch (Exception e) {
            return new HashMap<>();
        }
    }
}
