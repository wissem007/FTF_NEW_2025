	package com.football.management.controller;
	
	import com.football.management.service.DemandePlayersService;
	import org.springframework.beans.factory.annotation.Autowired;
	import org.springframework.http.ResponseEntity;
	import org.springframework.web.bind.annotation.*;
	
	import java.util.List;
	import java.util.ArrayList;
	import java.util.Map;
	import java.util.HashMap;
	import java.time.LocalDate;
	import org.springframework.http.HttpHeaders;
	import org.springframework.http.ContentDisposition;
	import org.springframework.http.MediaType;
	import com.fasterxml.jackson.databind.ObjectMapper;
	
	import java.time.format.DateTimeFormatter;
	
	import java.time.LocalDate;
	import java.util.HashMap;
	import java.util.Map;
	
	@RestController
	@RequestMapping("/api/v1/stats")
	@CrossOrigin(origins = "http://localhost:5173")
	public class StatsController {
	
	    @Autowired
	    private DemandePlayersService demandePlayersService;
	
	    /**
	     * Test simple pour vérifier que le contrôleur fonctionne
	     */
	    @GetMapping("/test")
	    public ResponseEntity<Map<String, String>> test() {
	        return ResponseEntity.ok(Map.of("message", "StatsController fonctionne !"));
	    }
	
	    /**
	     * Tableau de bord avec gestion d'erreurs
	     */
	    @GetMapping("/dashboard")
	    public ResponseEntity<Map<String, Object>> getDashboardStats(
	            @RequestParam(required = false) Long seasonId) {
	        try {
	            Map<String, Object> dashboard = new HashMap<>();
	            
	            // Statistiques générales - CORRIGÉ : ajouter le 7ème paramètre (ctIntervenantTypeId)
	            Long totalDemandes = demandePlayersService.countDemandes(null, seasonId, null, null, null, null, null);
	            dashboard.put("totalDemandes", totalDemandes);
	            
	            // Test si les méthodes statistiques existent
	            try {
	                dashboard.put("parRegime", demandePlayersService.getRegimeStatistics());
	            } catch (Exception e) {
	                dashboard.put("parRegime", "Méthode non disponible");
	            }
	            
	            try {
	                dashboard.put("parTypeLicence", demandePlayersService.getTypeLicenceStatistics());
	            } catch (Exception e) {
	                dashboard.put("parTypeLicence", "Méthode non disponible");
	            }
	            
	            try {
	                dashboard.put("parStatut", demandePlayersService.getStatusStatistics());
	            } catch (Exception e) {
	                dashboard.put("parStatut", "Méthode non disponible");
	            }
	            
	            try {
	                LocalDate fromDate = LocalDate.now().minusDays(30);
	                Long recentCount = demandePlayersService.countCreatedAfter(fromDate);
	                dashboard.put("demandesRecentes", recentCount);
	            } catch (Exception e) {
	                dashboard.put("demandesRecentes", "Méthode non disponible");
	            }
	            
	            return ResponseEntity.ok(dashboard);
	        } catch (Exception e) {
	            e.printStackTrace();
	            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
	        }
	    }
	
	    /**
	     * Statistiques par équipe et saison
	     */
	    @GetMapping("/team/{teamId}/season/{seasonId}")
	    public ResponseEntity<Map<String, Object>> getTeamSeasonStats(
	            @PathVariable Long teamId,
	            @PathVariable Long seasonId) {
	        try {
	            Map<String, Object> stats = new HashMap<>();
	            
	            // Stats de base par équipe/saison - CORRIGÉ : ajouter le 7ème paramètre
	            Long totalEquipe = demandePlayersService.countDemandes(teamId, seasonId, null, null, null, null, null);
	            stats.put("totalDemandes", totalEquipe);
	            
	            // Essayer les stats détaillées si la méthode existe
	            try {
	                Map<String, Object> detailedStats = demandePlayersService.getTeamSeasonStats(teamId, seasonId);
	                stats.putAll(detailedStats);
	            } catch (Exception e) {
	                // Stats manuelles si la méthode détaillée n'existe pas
	                stats.put("info", "Stats basiques uniquement");
	            }
	            
	            return ResponseEntity.ok(stats);
	        } catch (Exception e) {
	            e.printStackTrace();
	            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
	        }
	    }
	
	    /**
	     * Statistiques générales complètes
	     */
	    @GetMapping("/general")
	    public ResponseEntity<Map<String, Object>> getGeneralStats() {
	        try {
	            Map<String, Object> stats = new HashMap<>();
	            
	            // Statistiques par régime
	            stats.put("regimes", demandePlayersService.getRegimeStatistics());
	            
	            // Statistiques par type de licence
	            stats.put("typesLicence", demandePlayersService.getTypeLicenceStatistics());
	            
	            // Statistiques par statut
	            stats.put("statuts", demandePlayersService.getStatusStatistics());
	            
	            // Demandes récentes
	            LocalDate fromDate = LocalDate.now().minusDays(30);
	            Long recentCount = demandePlayersService.countCreatedAfter(fromDate);
	            stats.put("demandesRecentes", recentCount);
	            
	            // Total général - CORRIGÉ : ajouter le 7ème paramètre
	            Long total = demandePlayersService.countDemandes(null, null, null, null, null, null, null);
	            stats.put("totalGeneral", total);
	            
	            return ResponseEntity.ok(stats);
	        } catch (Exception e) {
	            e.printStackTrace();
	            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
	        }
	    }
	
	    /**
	     * Résumé par saison
	     */
	    @GetMapping("/season/{seasonId}/summary")
	    public ResponseEntity<Map<String, Object>> getSeasonSummary(@PathVariable Long seasonId) {
	        try {
	            Map<String, Object> summary = new HashMap<>();
	            
	            // Total pour la saison - CORRIGÉ : ajouter le 7ème paramètre
	            Long total = demandePlayersService.countDemandes(null, seasonId, null, null, null, null, null);
	            summary.put("totalSaison", total);
	            
	            // Par régime pour cette saison (approximatif)
	            summary.put("regimes", demandePlayersService.getRegimeStatistics());
	            summary.put("typesLicence", demandePlayersService.getTypeLicenceStatistics());
	            summary.put("statuts", demandePlayersService.getStatusStatistics());
	            
	            summary.put("seasonId", seasonId);
	            
	            return ResponseEntity.ok(summary);
	        } catch (Exception e) {
	            e.printStackTrace();
	            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
	        }
	    }
	    
	    
	 // Ajouts suggérés dans votre StatsController.java
	
	    /**
	     * Récupérer les statistiques par type d'intervenant
	     */
	    @GetMapping("/team/{teamId}/season/{seasonId}/type/{intervenantTypeId}")
	    public ResponseEntity<Map<String, Object>> getTeamStatsbyType(
	            @PathVariable Long teamId,
	            @PathVariable Long seasonId,
	            @PathVariable Long intervenantTypeId) {
	        try {
	            Map<String, Object> stats = new HashMap<>();
	            
	            // Utiliser votre service existant avec le bon paramètre
	            Long count = demandePlayersService.countDemandes(teamId, seasonId, null, null, null, null, intervenantTypeId);
	            stats.put("totalParType", count);
	            stats.put("intervenantTypeId", intervenantTypeId);
	            
	            return ResponseEntity.ok(stats);
	        } catch (Exception e) {
	            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
	        }
	    }
	
	    /**
	     * Export de données (temporaire en JSON, PDF plus tard)
	     */
	    @PostMapping("/export")
	    public ResponseEntity<Map<String, Object>> exportData(@RequestBody Map<String, Object> request) {
	        try {
	            String reportType = (String) request.get("reportType");
	            Long teamId = Long.valueOf(request.get("teamId").toString());
	            Long seasonId = Long.valueOf(request.get("seasonId").toString());
	            
	            Map<String, Object> exportData = new HashMap<>();
	            exportData.put("reportType", reportType);
	            exportData.put("teamId", teamId);
	            exportData.put("seasonId", seasonId);
	            exportData.put("timestamp", LocalDate.now());
	            exportData.put("message", "Export préparé - implémentation PDF à venir");
	            
	            return ResponseEntity.ok(exportData);
	        } catch (Exception e) {
	            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
	        }
	    }
	    
	    /**
	     * bordereau
	     */
	    
	    @PostMapping("/export-bordereau-html")
	    public ResponseEntity<String> exportBordereauHTML(@RequestBody Map<String, Object> request) {
	        try {
	            Long teamId = Long.valueOf(request.get("teamId").toString());
	            Long seasonId = Long.valueOf(request.get("seasonId").toString());
	            @SuppressWarnings("unchecked")
	            List<Integer> selectedIds = (List<Integer>) request.get("selectedIds");
	            
	            List<Map<String, Object>> selectedDemandes = getSelectedDemandes(selectedIds, teamId, seasonId);
	            
	            String html = generateBordereauHTML(teamId, seasonId, selectedDemandes);
	            
	            HttpHeaders headers = new HttpHeaders();
	            headers.setContentType(MediaType.TEXT_HTML);
	            headers.set("Content-Disposition", "inline; filename=bordereau.html");
	            
	            return ResponseEntity.ok()
	                .headers(headers)
	                .body(html);
	                
	        } catch (Exception e) {
	            e.printStackTrace();
	            return ResponseEntity.status(500).body("Erreur: " + e.getMessage());
	        }
	    }
	
	    private String generateBordereauHTML(Long teamId, Long seasonId, List<Map<String, Object>> demandes) {
	        StringBuilder html = new StringBuilder();
	        html.append("<!DOCTYPE html>");
	        html.append("<html><head>");
	        html.append("<meta charset='UTF-8'>");
	        html.append("<title>Bordereau d'envoi</title>");
	        html.append("<style>");
	        html.append("body { font-family: Arial, sans-serif; margin: 20px; }");
	        html.append("table { width: 100%; border-collapse: collapse; margin-top: 20px; }");
	        html.append("th, td { border: 1px solid black; padding: 8px; text-align: left; }");
	        html.append("th { background-color: #f0f0f0; }");
	        html.append(".header { text-align: center; margin-bottom: 20px; }");
	        html.append("</style></head><body>");
	        
	        // En-tête
	        html.append("<div class='header'>");
	        html.append("<h2>Fédération Tunisienne de Football</h2>");
	        html.append("<h3>").append(getClubName(teamId)).append("</h3>");
	        html.append("<p>Bordereau d'envoi pour la saison : ").append(seasonId).append("</p>");
	        html.append("<p>Date: ").append(LocalDate.now().toString()).append("</p>");
	        html.append("</div>");
	        
	        // Tableau
	        html.append("<table>");
	        html.append("<thead>");
	        html.append("<tr>");
	        html.append("<th>Type Intervenant</th>");
	        html.append("<th>Nom & Prénom</th>");
	        html.append("<th>CIN/Passeport</th>");
	        html.append("<th>Date Naissance</th>");
	        html.append("<th>Lieu Naissance</th>");
	        html.append("<th>Nationalité</th>");
	        html.append("<th>Date d'envoi</th>");
	        html.append("</tr></thead><tbody>");
	        
	        for (Map<String, Object> demande : demandes) {
	            html.append("<tr>");
	            html.append("<td>Joueur</td>");
	            html.append("<td>").append(demande.get("nom")).append(" ").append(demande.get("prenom")).append("</td>");
	            html.append("<td>").append(demande.get("cin")).append("</td>");
	            html.append("<td>").append(demande.get("dateNaissance")).append("</td>");
	            html.append("<td>").append(demande.get("lieuNaissance")).append("</td>");
	            html.append("<td>").append(demande.get("nationalite")).append("</td>");
	            html.append("<td>").append(demande.get("dateEnvoi")).append("</td>");
	            html.append("</tr>");
	        }
	        
	        html.append("</tbody></table>");
	        html.append("</body></html>");
	        
	        return html.toString();
	    }
	
	    // AJOUTEZ CETTE MÉTHODE à votre StatsController (si elle n'existe pas déjà)
	    private String getClubName(Long teamId) {
	        if (teamId == 102L) return "Club Africain";
	        if (teamId == 101L) return "Espérance Sportive de Tunis";
	        return "Club ID: " + teamId;
	    }
	
	    // Assurez-vous que cette méthode existe aussi
	    private List<Map<String, Object>> getSelectedDemandes(List<Integer> selectedIds, Long teamId, Long seasonId) {
	        List<Map<String, Object>> demandes = new ArrayList<>();
	        
	        for (Integer id : selectedIds) {
	            Map<String, Object> demande = new HashMap<>();
	            demande.put("nom", "JOUEUR " + id);
	            demande.put("prenom", "PRENOM " + id);
	            demande.put("cin", "1234567" + id);
	            demande.put("licenceNum", "11010" + id);
	            demande.put("dateNaissance", "01/01/1995");
	            demande.put("lieuNaissance", "TUNIS");
	            demande.put("nationalite", "TUNISIE");
	            demande.put("dateEnvoi", LocalDate.now().toString());
	            
	            demandes.add(demande);
	        }
	        
	        return demandes;
	    }
	    
	}