package com.football.management.service.validation;

import com.football.management.dto.DemandePlayersDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;

/**
 * ✅ VALIDATEUR POUR PRÊT (Type 5)
 *
 * LOGIQUE DE VALIDATION:
 * 1. Vérifier le quota global de PRÊT depuis ct_param_demandes
 * 2. Vérifier que le joueur EXISTE dans ct_intervenants
 * 3. Vérifier qu'il n'y a pas déjà une demande de prêt cette saison
 *
 * @see GUIDE_VALIDATION_LICENCES.md pour la documentation complète
 */
@Component
public class PretValidator {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Constantes pour les régimes
    private static final Long AMATEUR = 1L;
    private static final Long PROFESSIONNEL = 2L;
    private static final Long SEMI_PROFESSIONNEL = 3L;
    private static final Long STAGIAIRE = 4L;
    private static final Long CP = 5L;

    // Constantes pour les divisions
    private static final Long LIGUE_I = 1L;
    private static final Long LIGUE_II = 2L;
    private static final Long LIGUE_III_1 = 3L;
    private static final Long LIGUE_III_2 = 4L;

    /**
     * Valide une demande de PRÊT (Type 5)
     */
    public ValidationResult validatePret(DemandePlayersDTO dto, Long categoryId, Long divisionId) {
        ValidationResult result = new ValidationResult();

        System.out.println("════════════════════════════════════════════════════════════");
        System.out.println("🔍 VALIDATION PRÊT - DÉBUT");
        System.out.println("════════════════════════════════════════════════════════════");
        System.out.println("📋 Régime: " + dto.getRegimeId() + " | Division: " + divisionId + " | Catégorie: " + categoryId);

        // ÉTAPE 1: Déterminer si CADETS+ (≥16 ans)
        boolean isCadetsOrOlder = isCadetsOrOlder(dto);
        System.out.println("📅 Age: " + (isCadetsOrOlder ? "CADETS+ (≥16 ans)" : "<CADETS (<16 ans)"));

        // ÉTAPE 2: Vérifier que le joueur EXISTE
        if (!playerExists(dto, isCadetsOrOlder)) {
            String errorMsg = formatError(
                "❌ JOUEUR INTROUVABLE DANS LE SYSTÈME",
                "",
                "Ce joueur n'existe pas dans la base de données.",
                "",
                "➤ Pour créer une demande de PRÊT, le joueur doit déjà être enregistré dans le système.",
                "➤ Veuillez d'abord créer une NOUVELLE LICENCE pour ce joueur."
            );
            result.addError(errorMsg);
            System.out.println("❌ VALIDATION PRÊT - ÉCHEC: Joueur introuvable");
            System.out.println("════════════════════════════════════════════════════════════\n");
            return result;
        }
        System.out.println("✅ Joueur trouvé dans ct_intervenants");

        // ÉTAPE 3: Vérifier le quota PRÊT selon le régime
        Long regimeId = dto.getRegimeId() != null ? dto.getRegimeId().longValue() : null;

        if (regimeId != null) {
            if (isProfessionalRegime(regimeId)) {
                // PRÊT PROFESSIONNEL (PRO, SEMI-PRO, STAGIAIRE)
                System.out.println("🔍 Type: PRÊT PROFESSIONNEL");
                if (!validatePretProfessionalQuota(dto, categoryId)) {
                    String errorMsg = formatQuotaError("PRÊT PROFESSIONNEL", categoryId);
                    result.addError(errorMsg);
                    System.out.println("❌ VALIDATION PRÊT - ÉCHEC: Quota PRÊT PRO atteint");
                    System.out.println("════════════════════════════════════════════════════════════\n");
                    return result;
                }
            } else if (regimeId.equals(AMATEUR)) {
                // PRÊT AMATEUR (vérifier selon division)
                if (divisionId != null) {
                    if (divisionId.equals(LIGUE_I)) {
                        System.out.println("🔍 Type: PRÊT AMATEUR LIGUE I");
                        if (!validatePretAmateurQuota(dto, categoryId, "LIGUE I")) {
                            String errorMsg = formatQuotaError("PRÊT AMATEUR LIGUE I", categoryId);
                            result.addError(errorMsg);
                            System.out.println("❌ VALIDATION PRÊT - ÉCHEC: Quota PRÊT AMATEUR L1 atteint");
                            System.out.println("════════════════════════════════════════════════════════════\n");
                            return result;
                        }
                    } else if (divisionId.equals(LIGUE_II)) {
                        System.out.println("🔍 Type: PRÊT AMATEUR LIGUE II");
                        if (!validatePretAmateurQuota(dto, categoryId, "LIGUE II")) {
                            String errorMsg = formatQuotaError("PRÊT AMATEUR LIGUE II", categoryId);
                            result.addError(errorMsg);
                            System.out.println("❌ VALIDATION PRÊT - ÉCHEC: Quota PRÊT AMATEUR L2 atteint");
                            System.out.println("════════════════════════════════════════════════════════════\n");
                            return result;
                        }
                    } else if (divisionId.equals(LIGUE_III_1) || divisionId.equals(LIGUE_III_2)) {
                        System.out.println("🔍 Type: PRÊT AMATEUR LIGUE III");
                        if (!validatePretAmateurQuota(dto, categoryId, "LIGUE III")) {
                            String errorMsg = formatQuotaError("PRÊT AMATEUR LIGUE III", categoryId);
                            result.addError(errorMsg);
                            System.out.println("❌ VALIDATION PRÊT - ÉCHEC: Quota PRÊT AMATEUR L3 atteint");
                            System.out.println("════════════════════════════════════════════════════════════\n");
                            return result;
                        }
                    }
                }
            }
        }

        // ÉTAPE 4: Vérifier qu'il n'y a pas déjà une demande cette saison
        if (hasExistingDemandeThisSeason(dto, isCadetsOrOlder)) {
            String errorMsg = formatError(
                "❌ DEMANDE DÉJÀ ENREGISTRÉE",
                "",
                "Ce joueur a déjà une demande de PRÊT en cours pour cette saison.",
                "",
                "➤ Équipe: " + dto.getTeamId(),
                "➤ Saison: " + dto.getSeasonId(),
                "➤ Type: PRÊT"
            );
            result.addError(errorMsg);
            System.out.println("❌ VALIDATION PRÊT - ÉCHEC: Demande déjà enregistrée");
            System.out.println("════════════════════════════════════════════════════════════\n");
            return result;
        }
        System.out.println("✅ Aucun doublon trouvé");

        System.out.println("✅ VALIDATION PRÊT - SUCCÈS");
        System.out.println("════════════════════════════════════════════════════════════\n");
        return result;
    }

    /**
     * Détermine si le joueur est CADETS+ (≥16 ans)
     */
    private boolean isCadetsOrOlder(DemandePlayersDTO dto) {
        if (dto.getDateOfBirth() == null) {
            return false;
        }

        try {
            LocalDate birthDate = LocalDate.parse(dto.getDateOfBirth().toString());
            LocalDate now = LocalDate.now();
            int age = Period.between(birthDate, now).getYears();
            return age >= 16;
        } catch (Exception e) {
            System.out.println("⚠️  Erreur calcul âge: " + e.getMessage());
            return false;
        }
    }

    /**
     * Vérifie si le régime est PROFESSIONNEL (PRO, SEMI-PRO, STAGIAIRE)
     */
    private boolean isProfessionalRegime(Long regimeId) {
        return regimeId.equals(PROFESSIONNEL) ||
               regimeId.equals(SEMI_PROFESSIONNEL) ||
               regimeId.equals(STAGIAIRE);
    }

    /**
     * ÉTAPE 2: Vérifie que le joueur EXISTE dans ct_intervenants
     */
    private boolean playerExists(DemandePlayersDTO dto, boolean isCadetsOrOlder) {
        try {
            String sql;
            Object[] params;

            if (isCadetsOrOlder) {
                // CADETS+ : Recherche par CIN ou Passeport
                sql = "SELECT COUNT(*) FROM ct_intervenants " +
                      "WHERE cin_number = ? OR passport_num = ?";
                params = new Object[]{dto.getCinNumber(), dto.getPassportNum()};
            } else {
                // <CADETS : Recherche par nom + prénom + date naissance
                sql = "SELECT COUNT(*) FROM ct_intervenants " +
                      "WHERE UPPER(last_name) = UPPER(?) " +
                      "AND UPPER(name) = UPPER(?) " +
                      "AND date_of_birth = ?";
                params = new Object[]{dto.getLastName(), dto.getName(), dto.getDateOfBirth()};
            }

            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, params);
            return count != null && count > 0;

        } catch (Exception e) {
            System.out.println("⚠️  Erreur vérification existence joueur: " + e.getMessage());
            return false;
        }
    }

    /**
     * ÉTAPE 3.1: Valide le quota PRÊT PROFESSIONNEL
     */
    private boolean validatePretProfessionalQuota(DemandePlayersDTO dto, Long categoryId) {
        try {
            // Récupérer le quota global depuis ct_param_demandes
            String sqlQuota = "SELECT nbr_pret FROM ct_param_demandes WHERE ct_param_demande_id = 1";
            Integer maxQuota = jdbcTemplate.queryForObject(sqlQuota, Integer.class);

            if (maxQuota == null || maxQuota == 0) {
                System.out.println("⚠️  Quota PRÊT PRO non configuré → Autoriser");
                return true; // Pas de quota configuré = autoriser
            }

            // Compter le nombre de demandes PRÊT PRO actuelles
            String sqlCount = "SELECT COUNT(*) FROM ct_demandes " +
                            "WHERE ct_team_id = ? " +
                            "AND ct_season_id = ? " +
                            "AND ct_type_licence_id = 5 " +
                            "AND ct_player_category_id = ? " +
                            "AND ct_regime_id IN (2, 3, 4) " + // PRO, SEMI-PRO, STAGIAIRE
                            "AND ct_demande_statu_id != 0";

            Integer currentCount = jdbcTemplate.queryForObject(sqlCount, Integer.class,
                dto.getTeamId(), dto.getSeasonId(), categoryId);

            System.out.println("📊 Quota PRÊT PRO: " + currentCount + "/" + maxQuota);

            return currentCount < maxQuota;

        } catch (Exception e) {
            System.out.println("⚠️  Erreur validation quota PRÊT PRO: " + e.getMessage());
            return true; // En cas d'erreur, autoriser
        }
    }

    /**
     * ÉTAPE 3.2: Valide le quota PRÊT AMATEUR (LIGUE I, II, III)
     */
    private boolean validatePretAmateurQuota(DemandePlayersDTO dto, Long categoryId, String ligueLabel) {
        try {
            // Récupérer le quota global depuis ct_param_demandes
            String sqlQuota = "SELECT nbr_pret FROM ct_param_demandes WHERE ct_param_demande_id = 1";
            Integer maxQuota = jdbcTemplate.queryForObject(sqlQuota, Integer.class);

            if (maxQuota == null || maxQuota == 0) {
                System.out.println("⚠️  Quota PRÊT AMATEUR " + ligueLabel + " non configuré → Autoriser");
                return true;
            }

            // Déterminer l'ID de division
            Long divisionId = null;
            if ("LIGUE I".equals(ligueLabel)) divisionId = LIGUE_I;
            else if ("LIGUE II".equals(ligueLabel)) divisionId = LIGUE_II;
            else if ("LIGUE III".equals(ligueLabel)) divisionId = LIGUE_III_1; // ou LIGUE_III_2

            // Compter le nombre de demandes PRÊT AMATEUR actuelles pour cette division
            String sqlCount = "SELECT COUNT(*) FROM ct_demandes d " +
                            "INNER JOIN ct_team_divisions td ON d.ct_team_id = td.ct_team_id AND td.ct_season_id = d.ct_season_id " +
                            "WHERE d.ct_team_id = ? " +
                            "AND d.ct_season_id = ? " +
                            "AND d.ct_type_licence_id = 5 " +
                            "AND d.ct_player_category_id = ? " +
                            "AND d.ct_regime_id = 1 " + // AMATEUR
                            "AND td.ct_division_id = ? " +
                            "AND d.ct_demande_statu_id != 0";

            Integer currentCount = jdbcTemplate.queryForObject(sqlCount, Integer.class,
                dto.getTeamId(), dto.getSeasonId(), categoryId, divisionId);

            System.out.println("📊 Quota PRÊT AMATEUR " + ligueLabel + ": " + currentCount + "/" + maxQuota);

            return currentCount < maxQuota;

        } catch (Exception e) {
            System.out.println("⚠️  Erreur validation quota PRÊT AMATEUR: " + e.getMessage());
            return true;
        }
    }

    /**
     * ÉTAPE 4: Vérifie s'il existe déjà une demande cette saison
     */
    private boolean hasExistingDemandeThisSeason(DemandePlayersDTO dto, boolean isCadetsOrOlder) {
        if (dto.getTeamId() == null || dto.getSeasonId() == null) {
            System.out.println("⚠️  Team ID ou Season ID manquant → SKIP vérification");
            return false;
        }

        String sql;
        Object[] params;

        try {
            if (isCadetsOrOlder) {
                // CADETS+ : Recherche par CIN ou Passeport
                sql = "SELECT COUNT(*) FROM ct_demandes " +
                      "WHERE ct_team_id = ? " +
                      "AND ct_season_id = ? " +
                      "AND ct_type_licence_id = 5 " +
                      "AND (cin_number = ? OR passport_num = ?) " +
                      "AND ct_demande_statu_id != 0";
                params = new Object[]{dto.getTeamId(), dto.getSeasonId(), dto.getCinNumber(), dto.getPassportNum()};
            } else {
                // <CADETS : Recherche par nom + prénom + date naissance
                sql = "SELECT COUNT(*) FROM ct_demandes " +
                      "WHERE ct_team_id = ? " +
                      "AND ct_season_id = ? " +
                      "AND ct_type_licence_id = 5 " +
                      "AND UPPER(last_name) = UPPER(?) " +
                      "AND UPPER(name) = UPPER(?) " +
                      "AND date_of_birth = ? " +
                      "AND ct_demande_statu_id != 0";
                params = new Object[]{dto.getTeamId(), dto.getSeasonId(), dto.getLastName(), dto.getName(), dto.getDateOfBirth()};
            }

            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, params);
            return count != null && count > 0;

        } catch (Exception e) {
            System.out.println("⚠️  Erreur vérification doublon: " + e.getMessage());
            return false;
        }
    }

    /**
     * Récupère le label de la catégorie
     */
    private String getCategoryLabel(Long categoryId) {
        if (categoryId == null) return "Non défini";
        switch (categoryId.intValue()) {
            case 1: return "U9";
            case 2: return "U11";
            case 3: return "U13";
            case 4: return "U15";
            case 5: return "U17";
            case 6: return "U19";
            case 7: return "Senior";
            case 9: return "U7";
            default: return "Catégorie " + categoryId;
        }
    }

    /**
     * Formate un message d'erreur de quota
     */
    private String formatQuotaError(String quotaType, Long categoryId) {
        try {
            String sqlQuota = "SELECT nbr_pret FROM ct_param_demandes WHERE ct_param_demande_id = 1";
            Integer maxQuota = jdbcTemplate.queryForObject(sqlQuota, Integer.class);

            return formatError(
                "❌ QUOTA " + quotaType + " ATTEINT",
                "",
                "Nombre maximum de demandes PRÊT (" + quotaType + ") atteint.",
                "",
                "➤ Catégorie: " + getCategoryLabel(categoryId),
                "➤ Quota maximum: " + (maxQuota != null ? maxQuota : "Non défini"),
                "➤ Impossible de créer une nouvelle demande PRÊT pour cette catégorie."
            );
        } catch (Exception e) {
            return "❌ QUOTA " + quotaType + " ATTEINT";
        }
    }

    /**
     * Formate un message d'erreur avec lignes multiples
     */
    private String formatError(String... lines) {
        return String.join("\n", lines);
    }
}
