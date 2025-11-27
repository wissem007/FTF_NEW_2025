package com.football.management.service;

import com.football.management.dto.DashboardStatsDTO;
import com.football.management.enums.DemandeStatus;
import com.football.management.repository.DemandePlayersRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {
    
    @Autowired
    private DemandePlayersRepository demandeRepository;
    
    /**
     * Statistiques globales avec cache (10 minutes)
     */
    @Cacheable(value = "dashboardStats", key = "'global'")
    public DashboardStatsDTO getDashboardStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();
        
        // Total des demandes
        Long totalDemandes = demandeRepository.count();
        stats.setTotalDemandes(totalDemandes);
        
        // Demandes par statut
        stats.setDemandesEnAttente(countByStatus(DemandeStatus.EN_ATTENTE));
        stats.setDemandesValidees(countByStatus(DemandeStatus.VALIDEE_CLUB));
        stats.setDemandesRejetees(countByStatus(DemandeStatus.REJETEE));
        stats.setDemandesImprimees(countByStatus(DemandeStatus.IMPRIMEE));
        
        // Map des statuts
        Map<String, Long> statusMap = new HashMap<>();
        statusMap.put("Initial", countByStatus(DemandeStatus.INITIAL));
        statusMap.put("En attente", countByStatus(DemandeStatus.EN_ATTENTE));
        statusMap.put("Validée", countByStatus(DemandeStatus.VALIDEE_CLUB));
        statusMap.put("Imprimée", countByStatus(DemandeStatus.IMPRIMEE));
        statusMap.put("Rejetée", countByStatus(DemandeStatus.REJETEE));
        stats.setDemandesByStatus(statusMap);
        
        // Calcul des taux
        if (totalDemandes > 0) {
            stats.setTauxValidation((stats.getDemandesValidees() * 100.0) / totalDemandes);
            stats.setTauxRejet((stats.getDemandesRejetees() * 100.0) / totalDemandes);
        } else {
            stats.setTauxValidation(0.0);
            stats.setTauxRejet(0.0);
        }
        
        // Demandes ce mois-ci
        LocalDate startOfMonth = LocalDate.now().with(TemporalAdjusters.firstDayOfMonth());
        stats.setDemandesThisMonth(countDemandesSinceDate(startOfMonth));
        
        // Demandes cette semaine
        LocalDate startOfWeek = LocalDate.now().minusDays(7);
        stats.setDemandesThisWeek(countDemandesSinceDate(startOfWeek));
        
        // Statistiques par catégorie
        stats.setDemandesByCategory(getDemandesByCategory());
        
        // Statistiques par saison
        stats.setDemandesBySeason(getDemandesBySeason());
        
        // Top 5 équipes
        stats.setDemandesByTeam(getTop5Teams());
        
        return stats;
    }
    
    /**
     * Statistiques d'un club avec cache
     */
    @Cacheable(value = "dashboardStats", key = "'club-' + #teamId")
    public DashboardStatsDTO getDashboardStatsByTeam(BigDecimal teamId, BigDecimal seasonId) {
        DashboardStatsDTO stats = new DashboardStatsDTO();
        
        // Total des demandes du club
        Long totalDemandes = demandeRepository.countByTeamIdAndSeasonId(teamId, seasonId);
        stats.setTotalDemandes(totalDemandes);
        
        // Demandes par statut
        stats.setDemandesEnAttente(countByTeamAndStatus(teamId, seasonId, DemandeStatus.EN_ATTENTE));
        stats.setDemandesValidees(countByTeamAndStatus(teamId, seasonId, DemandeStatus.VALIDEE_CLUB));
        stats.setDemandesRejetees(countByTeamAndStatus(teamId, seasonId, DemandeStatus.REJETEE));
        stats.setDemandesImprimees(countByTeamAndStatus(teamId, seasonId, DemandeStatus.IMPRIMEE));
        
        // Calcul des taux
        if (totalDemandes > 0) {
            stats.setTauxValidation((stats.getDemandesValidees() * 100.0) / totalDemandes);
            stats.setTauxRejet((stats.getDemandesRejetees() * 100.0) / totalDemandes);
        }
        
        // Statistiques par catégorie du club
        stats.setDemandesByCategory(getDemandesByCategoryForTeam(teamId, seasonId));
        
        return stats;
    }
    
    /**
     * Invalider le cache après une modification
     */
    @CacheEvict(value = {"dashboardStats", "teamsList"}, allEntries = true)
    public void clearCache() {
        // Le cache est automatiquement vidé
    }
    
    // ========== Méthodes privées ==========
    
    private Long countByStatus(DemandeStatus status) {
        return demandeRepository.countByDemandeStatuId(status.getBigDecimalId());
    }
    
    private Long countByTeamAndStatus(BigDecimal teamId, BigDecimal seasonId, DemandeStatus status) {
        return demandeRepository.countByTeamIdAndSeasonIdAndStatus(teamId, seasonId, status.getBigDecimalId());
    }
    
    private Long countDemandesSinceDate(LocalDate date) {
        return demandeRepository.countByDateEnregistrementAfter(date);
    }
    
    private Map<String, Long> getDemandesByCategory() {
        Map<String, Long> categoryMap = new HashMap<>();
        categoryMap.put("Poussins", countByCategory(1L));
        categoryMap.put("Benjamins", countByCategory(2L));
        categoryMap.put("Minimes", countByCategory(3L));
        categoryMap.put("Cadets", countByCategory(4L));
        categoryMap.put("Juniors", countByCategory(5L));
        categoryMap.put("Espoirs", countByCategory(6L));
        categoryMap.put("Seniors", countByCategory(7L));
        return categoryMap;
    }
    
    private Map<String, Long> getDemandesByCategoryForTeam(BigDecimal teamId, BigDecimal seasonId) {
        Map<String, Long> categoryMap = new HashMap<>();
        categoryMap.put("Poussins", countByTeamAndCategory(teamId, seasonId, 1L));
        categoryMap.put("Benjamins", countByTeamAndCategory(teamId, seasonId, 2L));
        categoryMap.put("Minimes", countByTeamAndCategory(teamId, seasonId, 3L));
        categoryMap.put("Cadets", countByTeamAndCategory(teamId, seasonId, 4L));
        categoryMap.put("Juniors", countByTeamAndCategory(teamId, seasonId, 5L));
        categoryMap.put("Espoirs", countByTeamAndCategory(teamId, seasonId, 6L));
        categoryMap.put("Seniors", countByTeamAndCategory(teamId, seasonId, 7L));
        return categoryMap;
    }
    
    private Long countByCategory(Long categoryId) {
        return demandeRepository.countByPlayerCategoryId(BigDecimal.valueOf(categoryId));
    }
    
    private Long countByTeamAndCategory(BigDecimal teamId, BigDecimal seasonId, Long categoryId) {
        return demandeRepository.countByTeamIdAndSeasonIdAndCategory(
            teamId, seasonId, BigDecimal.valueOf(categoryId)
        );
    }
    
    private Map<String, Long> getDemandesBySeason() {
        Map<String, Long> seasonMap = new HashMap<>();
        List<Object[]> results = demandeRepository.countBySeasonGrouped();
        
        for (Object[] result : results) {
            BigDecimal seasonId = (BigDecimal) result[0];
            Long count = ((Number) result[1]).longValue();
            seasonMap.put("Saison " + seasonId, count);
        }
        
        return seasonMap;
    }
    
    private Map<String, Long> getTop5Teams() {
        Map<String, Long> teamMap = new HashMap<>();
        List<Object[]> results = demandeRepository.findTop5TeamsByDemandesCount();
        
        for (Object[] result : results) {
            String teamName = (String) result[0];
            Long count = ((Number) result[1]).longValue();
            teamMap.put(teamName, count);
        }
        
        return teamMap;
    }
    
    /**
     * Statistiques d'une équipe pour la saison courante
     */
    @Cacheable(value = "dashboardStats", key = "'team-' + #teamId")
    public Map<String, Object> getTeamStats(Long teamId) {
        // Obtenir la saison courante (vous pouvez adapter selon votre logique)
        BigDecimal currentSeasonId = getCurrentSeasonId();
        
        // Récupérer les stats via la méthode existante
        DashboardStatsDTO stats = getDashboardStatsByTeam(
            BigDecimal.valueOf(teamId), 
            currentSeasonId
        );
        
        // Convertir le DTO en Map
        Map<String, Object> result = new HashMap<>();
        result.put("teamId", teamId);
        result.put("seasonId", currentSeasonId);
        result.put("totalDemandes", stats.getTotalDemandes());
        result.put("demandesEnAttente", stats.getDemandesEnAttente());
        result.put("demandesValidees", stats.getDemandesValidees());
        result.put("demandesRejetees", stats.getDemandesRejetees());
        result.put("demandesImprimees", stats.getDemandesImprimees());
        result.put("tauxValidation", stats.getTauxValidation());
        result.put("tauxRejet", stats.getTauxRejet());
        result.put("demandesByCategory", stats.getDemandesByCategory());
        
        return result;
    }

    /**
     * Obtenir l'ID de la saison courante
     */
    private BigDecimal getCurrentSeasonId() {
        // TODO: Implémenter votre logique pour obtenir la saison courante
        // Par exemple, chercher dans une table Season la saison active
        // Pour l'instant, retourne une valeur par défaut
        return BigDecimal.valueOf(1); // À adapter selon votre logique
    }
}