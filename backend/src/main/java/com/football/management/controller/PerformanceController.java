package com.football.management.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/performance")
@Tag(name = "Performance", description = "Monitoring et optimisation")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:8082"})
public class PerformanceController {
    
    @Autowired
    private CacheManager cacheManager;
    
    /**
     * Obtenir les statistiques du cache
     */
    @GetMapping("/cache/stats")
    @Operation(summary = "Statistiques du cache")
    public ResponseEntity<?> getCacheStats() {
        Map<String, Object> stats = new HashMap<>();
        
        Collection<String> cacheNames = cacheManager.getCacheNames();
        stats.put("totalCaches", cacheNames.size());
        stats.put("cacheNames", cacheNames);
        
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Vider le cache
     */
    @DeleteMapping("/cache/clear")
    @Operation(summary = "Vider le cache")
    public ResponseEntity<?> clearCache(@RequestParam(required = false) String cacheName) {
        if (cacheName != null) {
            var cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                cache.clear();
                return ResponseEntity.ok(Map.of(
                    "message", "Cache '" + cacheName + "' vidé avec succès"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Cache '" + cacheName + "' non trouvé"
                ));
            }
        } else {
            // Vider tous les caches
            for (String name : cacheManager.getCacheNames()) {
                var cache = cacheManager.getCache(name);
                if (cache != null) {
                    cache.clear();
                }
            }
            return ResponseEntity.ok(Map.of(
                "message", "Tous les caches ont été vidés"
            ));
        }
    }
    
    /**
     * Informations système
     */
    @GetMapping("/system/info")
    @Operation(summary = "Informations système")
    public ResponseEntity<?> getSystemInfo() {
        Runtime runtime = Runtime.getRuntime();
        
        Map<String, Object> info = new HashMap<>();
        info.put("availableProcessors", runtime.availableProcessors());
        info.put("freeMemory", runtime.freeMemory() / (1024 * 1024) + " MB");
        info.put("totalMemory", runtime.totalMemory() / (1024 * 1024) + " MB");
        info.put("maxMemory", runtime.maxMemory() / (1024 * 1024) + " MB");
        info.put("usedMemory", (runtime.totalMemory() - runtime.freeMemory()) / (1024 * 1024) + " MB");
        
        return ResponseEntity.ok(info);
    }
}