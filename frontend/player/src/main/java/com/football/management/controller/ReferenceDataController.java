package com.football.management.controller;

import com.football.management.service.DemandePlayersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reference")
@CrossOrigin(origins = "http://localhost:5173")
public class ReferenceDataController {

    @Autowired
    private DemandePlayersService demandePlayersService;

    /**
     * Récupère toutes les données de référence nécessaires pour les filtres
     */
    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllReferenceData() {
        try {
            Map<String, Object> referenceData = new HashMap<>();
            
            // Récupérer les statistiques par différents critères
            referenceData.put("regimes", getRegimeStats());
            referenceData.put("typesLicence", getTypeLicenceStats());
            referenceData.put("statuts", getStatusStats());
            
            // Ajouter des constantes utiles
            referenceData.put("regimeLabels", getRegimeLabels());
            referenceData.put("typeLicenceLabels", getTypeLicenceLabels());
            referenceData.put("statusLabels", getStatusLabels());
            
            return ResponseEntity.ok(referenceData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Statistiques par régime
     */
    @GetMapping("/regimes/stats")
    public ResponseEntity<List<Map<String, Object>>> getRegimeStats() {
        try {
            // Vous devrez créer cette méthode dans votre service
            // Pour l'instant, on retourne des données fictives basées sur vos données
            List<Map<String, Object>> stats = List.of(
                Map.of("id", 1, "label", "Amateur", "count", 100),
                Map.of("id", 2, "label", "Professionnel", "count", 50)
            );
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Statistiques par type de licence
     */
    @GetMapping("/types-licence/stats")
    public ResponseEntity<List<Map<String, Object>>> getTypeLicenceStats() {
        try {
            List<Map<String, Object>> stats = List.of(
                Map.of("id", 1, "label", "Nouvelle", "count", 30),
                Map.of("id", 2, "label", "Renouvellement", "count", 80),
                Map.of("id", 3, "label", "Transfert National", "count", 20),
                Map.of("id", 4, "label", "Transfert International", "count", 5),
                Map.of("id", 5, "label", "Prêt", "count", 10)
            );
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Statistiques par statut
     */
    @GetMapping("/statuts/stats")
    public ResponseEntity<List<Map<String, Object>>> getStatusStats() {
        try {
            List<Map<String, Object>> stats = List.of(
                Map.of("id", 1, "label", "En attente", "count", 20),
                Map.of("id", 8, "label", "Validée par club", "count", 100),
                Map.of("id", 9, "label", "Imprimée", "count", 50)
            );
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Labels des régimes
     */
    private Map<String, String> getRegimeLabels() {
        Map<String, String> labels = new HashMap<>();
        labels.put("1", "Amateur");
        labels.put("2", "Professionnel");
        return labels;
    }

    /**
     * Labels des types de licence
     */
    private Map<String, String> getTypeLicenceLabels() {
        Map<String, String> labels = new HashMap<>();
        labels.put("1", "Nouvelle");
        labels.put("2", "Renouvellement");
        labels.put("3", "Transfert National");
        labels.put("4", "Transfert International");
        labels.put("5", "Prêt");
        labels.put("6", "Renouvellement Spécial");
        return labels;
    }

    /**
     * Labels des statuts
     */
    private Map<String, String> getStatusLabels() {
        Map<String, String> labels = new HashMap<>();
        labels.put("1", "En attente");
        labels.put("2", "En cours de traitement");
        labels.put("8", "Validée par club");
        labels.put("9", "Imprimée");
        labels.put("10", "Rejetée");
        return labels;
    }
}