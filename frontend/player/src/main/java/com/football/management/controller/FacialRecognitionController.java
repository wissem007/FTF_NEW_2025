package com.football.management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/facial-recognition")
@CrossOrigin(origins = "https://licencesftf.com")
public class FacialRecognitionController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostMapping("/search")
    public ResponseEntity<Map<String, Object>> searchByFacialRecognition(
            @RequestParam("photo") MultipartFile uploadedPhoto,
            @RequestParam(required = false) BigDecimal seasonId,
            @RequestParam(required = false) BigDecimal teamId,
            @RequestParam(required = false, defaultValue = "10") int maxResults) {
        
        try {
            // Validation du fichier
            if (uploadedPhoto.isEmpty() || !isValidImageFile(uploadedPhoto)) {
                return ResponseEntity.badRequest()
                    .body(createErrorResponse("Fichier image invalide"));
            }

            // Récupérer tous les intervenants avec photos
            List<Map<String, Object>> intervenantsWithPhotos = getIntervenantsWithPhotos(seasonId, teamId);
            
            if (intervenantsWithPhotos.isEmpty()) {
                return ResponseEntity.ok(createSuccessResponse(new ArrayList<>(), 0));
            }

            // Simuler la reconnaissance faciale
            List<Map<String, Object>> matches = performFacialRecognition(
                uploadedPhoto, intervenantsWithPhotos, maxResults);

            return ResponseEntity.ok(createSuccessResponse(matches, matches.size()));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Erreur lors de la recherche faciale"));
        }
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getFacialRecognitionStats(
            @RequestParam(required = false) BigDecimal seasonId) {
        
        try {
            Map<String, Object> stats = new HashMap<>();
            
            String sqlWithPhotos = """
                SELECT COUNT(DISTINCT ti.ct_intervenant_id) as count
                FROM sss_competition_db.ct_team_intervenants ti
                INNER JOIN sss_competition_db.ct_team_intervenant_photos p 
                    ON ti.ct_team_intervenant_photo_id = p.ct_team_intervenant_photo_id
                WHERE p.photo_bdata IS NOT NULL
                """ + (seasonId != null ? " AND ti.ct_season_id = ?" : "");
            
            Object[] params = seasonId != null ? new Object[]{seasonId} : new Object[]{};
            Integer withPhotos = jdbcTemplate.queryForObject(sqlWithPhotos, params, Integer.class);
            
            String sqlTotal = """
                SELECT COUNT(DISTINCT ti.ct_intervenant_id) as count
                FROM sss_competition_db.ct_team_intervenants ti
                """ + (seasonId != null ? " WHERE ti.ct_season_id = ?" : "");
            
            Integer total = jdbcTemplate.queryForObject(sqlTotal, params, Integer.class);
            
            stats.put("totalIntervenants", total);
            stats.put("intervenantsWithPhotos", withPhotos);
            stats.put("intervenantsWithoutPhotos", total - withPhotos);
            stats.put("photosCoveragePercent", total > 0 ? (withPhotos * 100.0 / total) : 0);
            
            return ResponseEntity.ok(createSuccessResponse(stats, 1));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Erreur lors de la récupération des statistiques"));
        }
    }

    private List<Map<String, Object>> getIntervenantsWithPhotos(BigDecimal seasonId, BigDecimal teamId) {
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT DISTINCT ");
        sql.append("    i.ct_intervenant_id as intervenantId, ");
        sql.append("    i.name, ");
        sql.append("    i.last_name as lastName, ");
        sql.append("    i.licence_num as licenceNum, ");
        sql.append("    ti.ct_team_id as teamId, ");
        sql.append("    ti.ct_season_id as seasonId, ");
        sql.append("    ti.ct_team_intervenant_photo_id as photoId, ");
        sql.append("    COALESCE(ti.tshirt_num::text, 'N/A') as jerseyNumber, ");
        sql.append("    t.name as teamName ");
        sql.append("FROM sss_competition_db.ct_intervenants i ");
        sql.append("INNER JOIN sss_competition_db.ct_team_intervenants ti ");
        sql.append("    ON i.ct_intervenant_id = ti.ct_intervenant_id ");
        sql.append("INNER JOIN sss_competition_db.ct_team_intervenant_photos p ");
        sql.append("    ON ti.ct_team_intervenant_photo_id = p.ct_team_intervenant_photo_id ");
        sql.append("LEFT JOIN sss_competition_db.ct_teams t ");
        sql.append("    ON ti.ct_team_id = t.ct_team_id ");
        sql.append("WHERE p.photo_bdata IS NOT NULL ");

        List<Object> params = new ArrayList<>();
        
        if (seasonId != null) {
            sql.append("AND ti.ct_season_id = ? ");
            params.add(seasonId);
        }
        
        if (teamId != null) {
            sql.append("AND ti.ct_team_id = ? ");
            params.add(teamId);
        }
        
        sql.append("ORDER BY i.last_name, i.name");

        return jdbcTemplate.queryForList(sql.toString(), params.toArray());
    }

    private List<Map<String, Object>> performFacialRecognition(
            MultipartFile uploadedPhoto, 
            List<Map<String, Object>> candidates,
            int maxResults) {
        
        List<Map<String, Object>> matches = new ArrayList<>();
        Random random = new Random();
        
        for (Map<String, Object> candidate : candidates) {
            double confidence = 0.3 + (random.nextDouble() * 0.7);
            
            if (confidence > 0.5) {
                Map<String, Object> match = new HashMap<>(candidate);
                match.put("confidence", Math.round(confidence * 100.0) / 100.0);
                match.put("matchScore", (int)(confidence * 100));
                matches.add(match);
            }
        }
        
        matches.sort((a, b) -> Double.compare(
            (Double)b.get("confidence"), (Double)a.get("confidence")));
        
        return matches.stream()
            .limit(maxResults)
            .collect(Collectors.toList());
    }

    private boolean isValidImageFile(MultipartFile file) {
        if (file.isEmpty()) return false;
        
        String contentType = file.getContentType();
        if (contentType == null) return false;
        
        return contentType.startsWith("image/") && 
               (contentType.contains("jpeg") || contentType.contains("jpg") || 
                contentType.contains("png") || contentType.contains("gif"));
    }

    private Map<String, Object> createSuccessResponse(Object data, int count) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);
        response.put("count", count);
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", message);
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "FacialRecognition");
        health.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(health);
    }
    
    @GetMapping("/photos/{photoId}")
    public ResponseEntity<byte[]> getPhotoForRecognition(@PathVariable BigDecimal photoId) {
        try {
            String sql = """
                SELECT photo_bdata, photo_ctype 
                FROM sss_competition_db.ct_team_intervenant_photos 
                WHERE ct_team_intervenant_photo_id = ?
                """;
            
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, photoId);
            
            if (results.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Map<String, Object> photo = results.get(0);
            byte[] imageData = (byte[]) photo.get("photo_bdata");
            String contentType = (String) photo.get("photo_ctype");
            
            if (imageData == null || imageData.length == 0) {
                return ResponseEntity.notFound().build();
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType != null ? contentType : "image/jpeg"));
            headers.setContentLength(imageData.length);
            headers.setCacheControl("public, max-age=86400");
            
            return new ResponseEntity<>(imageData, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }
}