package com.football.management.repository;

import com.football.management.dto.PlayerRenewalDTO;
import org.springframework.stereotype.Repository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import java.math.BigDecimal;
import java.util.List;

@Repository
public class IntervenantRepository {
    
    @Autowired
    private JdbcTemplate jdbcTemplate; // AJOUTEZ CETTE LIGNE
    
    public List<PlayerRenewalDTO> findPlayersEligibleForRenewal(
    	    BigDecimal teamId,
    	    BigDecimal regimeId,
    	    BigDecimal currentSeasonId
    	) {
    	    String sql = "SELECT DISTINCT i.ct_intervenant_id, i.name, i.last_name, i.licence_num, i.date_of_birth " +
    	                 "FROM ct_intervenants i " +
    	                 "INNER JOIN ct_team_intervenants ti ON i.ct_intervenant_id = ti.ct_intervenant_id " +
    	                 "WHERE ti.ct_team_id = ? " +              // Club Africain (102)
    	                 "AND ti.ct_regime_id = ? " +              // Régime choisi
    	                 "AND ti.ct_season_id < ? " +              // TOUTES les saisons précédentes
    	                 "AND i.ct_intervenant_type_id = 1 " +     // Seulement les joueurs
    	                 "ORDER BY i.last_name, i.name";
    	    
    	    return jdbcTemplate.query(sql, (rs, rowNum) -> new PlayerRenewalDTO(
    	        rs.getBigDecimal("ct_intervenant_id"),
    	        rs.getString("name"),
    	        rs.getString("last_name"),
    	        rs.getString("licence_num"),
    	        rs.getDate("date_of_birth") != null ? rs.getDate("date_of_birth").toLocalDate() : null
    	    ), teamId, regimeId, currentSeasonId);
    	}
}