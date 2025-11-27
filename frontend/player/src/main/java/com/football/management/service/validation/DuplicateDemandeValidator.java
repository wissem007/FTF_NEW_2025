package com.football.management.service.validation;

import com.football.management.dto.DemandePlayersDTO;
import com.football.management.repository.DemandePlayersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Validation qu'il n'y a pas de doublon (même joueur, même saison)
 */
@Component
public class DuplicateDemandeValidator {
    
    private static final Long CADETS = 4L;
    private static final Long NOUVELLE = 1L;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Autowired
    private DemandePlayersRepository demandePlayersRepository;
    
    public boolean validate(
        DemandePlayersDTO demande,
        ValidationResult result,
        Long categoryId
    ) {
        if (demande.getTypeLicenceId() == null) {
            return true;
        }
        
        // Vérifier les doublons uniquement pour les nouvelles licences
        if (demande.getTypeLicenceId().longValue() == NOUVELLE) {
            return validateNoExistingDemand(demande, result, categoryId);
        }
        
        return true;
    }
    
    private boolean validateNoExistingDemand(
        DemandePlayersDTO demande,
        ValidationResult result,
        Long categoryId
    ) {
        try {
            String sql;
            Long count;
            
            // Pour les cadets et au-dessus : recherche par CIN
            if (categoryId != null && categoryId >= CADETS) {
                if (demande.getCinNumber() == null || demande.getCinNumber().trim().isEmpty()) {
                    return true; // Déjà validé par CinPassportValidator
                }
                
                sql = """
                    SELECT COUNT(*) FROM ct_demandes 
                    WHERE ct_season_id = ? 
                    AND cin_number = ?
                    AND ct_demande_statu_id IN (1, 8, 9)
                    """;
                
                count = jdbcTemplate.queryForObject(
                    sql, 
                    Long.class, 
                    demande.getSeasonId(), 
                    demande.getCinNumber()
                );
            } 
            // Pour les jeunes : recherche par nom + prénom + date de naissance
            else {
                sql = """
                    SELECT COUNT(*) FROM ct_demandes 
                    WHERE ct_season_id = ? 
                    AND name = ? 
                    AND last_name = ? 
                    AND date_of_birth = ?
                    AND ct_demande_statu_id IN (1, 8, 9)
                    """;
                
                count = jdbcTemplate.queryForObject(
                    sql,
                    Long.class,
                    demande.getSeasonId(),
                    demande.getName(),
                    demande.getLastName(),
                    demande.getDateOfBirth()
                );
            }
            
            if (count != null && count > 0) {
                result.addError(
                    "Demande déjà enregistrée pour ce joueur cette saison"
                );
                return false;
            }
            
        } catch (Exception e) {
            result.addWarning(
                "Impossible de vérifier les doublons: " + e.getMessage()
            );
        }
        
        return true;
    }
}