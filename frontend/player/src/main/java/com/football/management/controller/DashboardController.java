package com.football.management.controller;

import com.football.management.dto.DashboardStatsDTO;
import com.football.management.service.DashboardService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard")
@Tag(name = "Dashboard", description = "Statistiques et indicateurs")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:8082"})
public class DashboardController {
    
    @Autowired
    private DashboardService dashboardService;
    
    /**
     * Obtenir les statistiques globales du dashboard
     */
    @GetMapping("/stats")
    @Operation(
        summary = "Obtenir les statistiques globales",
        description = "Retourne toutes les statistiques : total demandes, répartition par statut, taux de validation, etc."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Statistiques retournées avec succès"),
        @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    public ResponseEntity<?> getDashboardStats() {
        try {
            DashboardStatsDTO stats = dashboardService.getDashboardStats();
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Obtenir les statistiques d'une équipe
     */
    @GetMapping("/team/{teamId}")
    @Operation(
        summary = "Statistiques d'une équipe",
        description = "Retourne les statistiques pour une équipe spécifique"
    )
    public ResponseEntity<?> getTeamStats(
        @Parameter(description = "ID de l'équipe", required = true, example = "102")
        @PathVariable Long teamId
    ) {
        try {
            Map<String, Object> stats = dashboardService.getTeamStats(teamId);
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
}