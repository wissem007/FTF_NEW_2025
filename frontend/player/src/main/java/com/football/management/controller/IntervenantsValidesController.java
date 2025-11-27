package com.football.management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "http://localhost:5173")
public class IntervenantsValidesController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/test")
    public ResponseEntity<String> simpleTest() {
        return ResponseEntity.ok("Controller fonctionne correctement!");
    }

    @GetMapping(value = "/seasons", produces = "application/json")
    public ResponseEntity<List<Map<String, Object>>> getSeasons() {
        try {
            String sql = """
                SELECT 
                    ct_season_id as seasonId,
                    name as seasonName,
                    start_date as startDate,
                    end_date as endDate,
                    is_active as isActive
                FROM sss_competition_db.ct_seasons 
                ORDER BY ct_season_id DESC
                """;

            List<Map<String, Object>> seasons = jdbcTemplate.queryForList(sql);
            return ResponseEntity.ok(seasons);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping(value = "/intervenants-valides/resume", produces = "application/json")
    public ResponseEntity<Map<String, Object>> getResumeIntervenants(
            @RequestParam(required = false) BigDecimal teamId,
            @RequestParam(required = true) BigDecimal seasonId) {

        try {
            Map<String, Object> resume = new HashMap<>();

            StringBuilder sql = new StringBuilder();
            sql.append("SELECT ");
            sql.append("    ti.ct_intervenant_type_id as type, ");
            sql.append("    COUNT(DISTINCT i.ct_intervenant_id) as count ");
            sql.append("FROM sss_competition_db.ct_intervenants i ");
            sql.append("INNER JOIN sss_competition_db.ct_team_intervenants ti ");
            sql.append("    ON i.ct_intervenant_id = ti.ct_intervenant_id ");
            sql.append("WHERE ti.ct_season_id = ? ");
            
            if (teamId != null) {
                sql.append("AND ti.ct_team_id = ? ");
            }
            
            sql.append("GROUP BY ti.ct_intervenant_type_id ");
            sql.append("ORDER BY ti.ct_intervenant_type_id");

            Object[] params = teamId != null ? new Object[]{seasonId, teamId} : new Object[]{seasonId};
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql.toString(), params);

            resume.put("joueurs", 0);
            resume.put("dirigeants", 0);
            resume.put("entraineurs", 0);
            resume.put("staffMedical", 0);
            resume.put("total", 0);

            int total = 0;
            for (Map<String, Object> row : results) {
                Integer type = ((Number) row.get("type")).intValue();
                Integer count = ((Number) row.get("count")).intValue();
                total += count;

                switch (type) {
                    case 1: resume.put("joueurs", count); break;
                    case 2: resume.put("dirigeants", count); break;
                    case 3: resume.put("entraineurs", count); break;
                    case 4: resume.put("staffMedical", count); break;
                }
            }

            resume.put("total", total);
            return ResponseEntity.ok(resume);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping(value = "/intervenants-valides", produces = "application/json")
    public ResponseEntity<List<Map<String, Object>>> getIntervenantsValides(
            @RequestParam(required = false) BigDecimal intervenantTypeId,
            @RequestParam(required = false) BigDecimal teamId,
            @RequestParam(required = true) BigDecimal seasonId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String lastName,
            @RequestParam(required = false) String licenceNum,
            @RequestParam(required = false) String cinNumber,
            @RequestParam(required = false) String passportNum,
            @RequestParam(required = false) BigDecimal paysId) {

        try {
            StringBuilder sql = new StringBuilder();
            sql.append("SELECT ");
            sql.append("DISTINCT i.ct_intervenant_id as intervenantId, ");
            sql.append("i.ct_intervenant_type_id as intervenantTypeId, ");
            sql.append("i.cr_pays_id as paysId, ");
            sql.append("i.cr_etat_civil_id as etatCivilId, ");
            sql.append("i.name, ");
            sql.append("i.last_name as lastName, ");
            sql.append("i.alias, ");
            sql.append("i.cin_number as cinNumber, ");
            sql.append("i.passport_num as passportNum, ");
            sql.append("i.date_of_birth as dateOfBirth, ");
            sql.append("i.place_of_birth as placeOfBirth, ");
            sql.append("i.licence_num as licenceNum, ");
            sql.append("i.membership_date as membershipDate, ");
            sql.append("i.team_origine_id as origineId, ");
            sql.append("i.fifa_id as fifaId, ");
            sql.append("COALESCE(ti.tshirt_num::text, 'N/A') as jerseyNumber, ");
            sql.append("ti.weight, ");
            sql.append("ti.height, ");
            sql.append("ti.fifa_registred as fifaRegistered, ");
            sql.append("ti.is_qualified as isQualified, ");
            sql.append("ti.ct_season_id as currentSeasonId, ");
            sql.append("ti.ct_team_id as currentTeamId, ");
            sql.append("ti.ct_regime_id as regimeId, ");
            sql.append("ti.ct_player_category_id as playerCategoryId, ");
            sql.append("ti.ct_type_licence_id as typeLicenceId, ");
            sql.append("ti.ct_team_intervenant_photo_id as photoId, ");
            sql.append("ti.ct_player_position_id as positionId ");
            
            sql.append("FROM sss_competition_db.ct_intervenants i ");
            sql.append("INNER JOIN sss_competition_db.ct_team_intervenants ti ");
            sql.append("ON i.ct_intervenant_id = ti.ct_intervenant_id ");
            
            sql.append("WHERE ti.ct_season_id = ? ");

            if (teamId != null) {
                sql.append("AND ti.ct_team_id = ? ");
            }

            if (intervenantTypeId != null) {
                sql.append("AND ti.ct_intervenant_type_id = ? ");
            }

            if (name != null && !name.trim().isEmpty()) {
                sql.append("AND TRIM(UPPER(i.name)) LIKE TRIM(UPPER(?)) ");
            }

            if (lastName != null && !lastName.trim().isEmpty()) {
                sql.append("AND TRIM(UPPER(i.last_name)) LIKE TRIM(UPPER(?)) ");
            }

            if (licenceNum != null && !licenceNum.trim().isEmpty()) {
                sql.append("AND i.licence_num = ? ");
            }

            if (cinNumber != null && !cinNumber.trim().isEmpty()) {
                sql.append("AND TRIM(UPPER(i.cin_number)) LIKE TRIM(UPPER(?)) ");
            }

            if (passportNum != null && !passportNum.trim().isEmpty()) {
                sql.append("AND TRIM(UPPER(i.passport_num)) LIKE TRIM(UPPER(?)) ");
            }

            if (paysId != null) {
                sql.append("AND i.cr_pays_id = ? ");
            }

            sql.append("ORDER BY i.last_name, i.name");

            Object[] params = buildParams(seasonId, teamId, intervenantTypeId, name, lastName, 
                                        licenceNum, cinNumber, passportNum, paysId);

            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql.toString(), params);
            return ResponseEntity.ok(results);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping(value = "/intervenants-valides/{intervenantId}/history", produces = "application/json")
    public ResponseEntity<List<Map<String, Object>>> getIntervenantHistory(
            @PathVariable BigDecimal intervenantId) {
        
        try {
            String sql = """
                SELECT 
                    ti.ct_season_id as seasonId,
                    ti.ct_team_id as teamId,
                    ti.ct_intervenant_type_id as intervenantTypeId,
                    ti.ct_regime_id as regimeId,
                    ti.ct_player_category_id as playerCategoryId,
                    ti.ct_type_licence_id as typeLicenceId,
                    COALESCE(ti.tshirt_num::text, 'N/A') as jerseyNumber,
                    ti.ct_player_position_id as positionId,
                    ti.ct_team_intervenant_photo_id as photoId,
                    ti.weight,
                    ti.height,
                    ti.fifa_registred as fifaRegistered,
                    ti.is_qualified as isQualified,
                    s.name as seasonName,
                    t.name as teamName
                FROM sss_competition_db.ct_team_intervenants ti
                LEFT JOIN sss_competition_db.ct_seasons s ON ti.ct_season_id = s.ct_season_id
                LEFT JOIN sss_competition_db.ct_teams t ON ti.ct_team_id = t.ct_team_id
                WHERE ti.ct_intervenant_id = ?
                ORDER BY ti.ct_season_id DESC
                """;
            
            List<Map<String, Object>> history = jdbcTemplate.queryForList(sql, intervenantId);
            return ResponseEntity.ok(history);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping(value = "/intervenants-valides/{intervenantId}/latest-season", produces = "application/json")
    public ResponseEntity<Map<String, Object>> getIntervenantLatestSeason(
            @PathVariable BigDecimal intervenantId) {
        
        try {
            String sql = """
                SELECT 
                    i.ct_intervenant_id as intervenantId,
                    i.name,
                    i.last_name as lastName,
                    i.fifa_id as fifaId,
                    ti.ct_season_id as latestSeasonId,
                    ti.ct_team_id as latestTeamId,
                    COALESCE(ti.tshirt_num::text, 'N/A') as latestJerseyNumber,
                    ti.ct_regime_id as latestRegimeId,
                    ti.ct_player_category_id as latestPlayerCategoryId,
                    ti.ct_type_licence_id as latestTypeLicenceId,
                    ti.ct_player_position_id as latestPositionId,
                    ti.ct_team_intervenant_photo_id as latestPhotoId,
                    ti.weight as latestWeight,
                    ti.height as latestHeight,
                    ti.fifa_registred as latestFifaRegistered,
                    ti.is_qualified as latestIsQualified,
                    s.name as latestSeasonName,
                    t.name as latestTeamName
                FROM sss_competition_db.ct_intervenants i
                INNER JOIN sss_competition_db.ct_team_intervenants ti 
                    ON i.ct_intervenant_id = ti.ct_intervenant_id
                LEFT JOIN sss_competition_db.ct_seasons s ON ti.ct_season_id = s.ct_season_id
                LEFT JOIN sss_competition_db.ct_teams t ON ti.ct_team_id = t.ct_team_id
                WHERE i.ct_intervenant_id = ?
                AND ti.ct_season_id = (
                    SELECT MAX(ti2.ct_season_id)
                    FROM sss_competition_db.ct_team_intervenants ti2
                    WHERE ti2.ct_intervenant_id = i.ct_intervenant_id
                )
                """;
            
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, intervenantId);
            
            if (results.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(results.get(0));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private Object[] buildParams(BigDecimal seasonId, BigDecimal teamId, BigDecimal intervenantTypeId,
                                String name, String lastName, String licenceNum, String cinNumber,
                                String passportNum, BigDecimal paysId) {
        
        java.util.List<Object> paramsList = new java.util.ArrayList<>();

        paramsList.add(seasonId);

        if (teamId != null) {
            paramsList.add(teamId);
        }

        if (intervenantTypeId != null) {
            paramsList.add(intervenantTypeId);
        }

        if (name != null && !name.trim().isEmpty()) {
            paramsList.add(name.trim() + "%");
        }

        if (lastName != null && !lastName.trim().isEmpty()) {
            paramsList.add(lastName.trim() + "%");
        }

        if (licenceNum != null && !licenceNum.trim().isEmpty()) {
            paramsList.add(licenceNum.trim());
        }

        if (cinNumber != null && !cinNumber.trim().isEmpty()) {
            paramsList.add(cinNumber.trim() + "%");
        }

        if (passportNum != null && !passportNum.trim().isEmpty()) {
            paramsList.add(passportNum.trim() + "%");
        }

        if (paysId != null) {
            paramsList.add(paysId);
        }

        return paramsList.toArray();
    }

    // Endpoint de débogage temporaire
    @GetMapping(value = "/intervenants-valides/{intervenantId}/debug", produces = "application/json")
    public ResponseEntity<Map<String, Object>> debugIntervenant(@PathVariable BigDecimal intervenantId) {
        try {
            Map<String, Object> debug = new HashMap<>();
            debug.put("intervenantId", intervenantId);
            debug.put("intervenantIdType", intervenantId.getClass().getSimpleName());
            
            // Test simple pour voir si l'intervenant existe
            String testSql = "SELECT COUNT(*) as count FROM sss_competition_db.ct_team_intervenants WHERE ct_intervenant_id = ?";
            List<Map<String, Object>> testResult = jdbcTemplate.queryForList(testSql, intervenantId);
            debug.put("recordsFound", testResult.get(0).get("count"));
            
            // Test pour voir les saisons disponibles pour cet intervenant
            String seasonsSql = "SELECT ct_season_id FROM sss_competition_db.ct_team_intervenants WHERE ct_intervenant_id = ? ORDER BY ct_season_id";
            List<Map<String, Object>> seasonsResult = jdbcTemplate.queryForList(seasonsSql, intervenantId);
            debug.put("availableSeasons", seasonsResult);
            
            return ResponseEntity.ok(debug);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("intervenantId", intervenantId);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping(value = "/intervenants-valides/health", produces = "application/json")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "IntervenantsValides");
        health.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(health);
    }
    
    @GetMapping("/photos/{photoId}")
    public ResponseEntity<byte[]> getPhoto(@PathVariable BigDecimal photoId) {
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
            
            return new ResponseEntity<>(imageData, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }
}