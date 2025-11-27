package com.football.management.service.validation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import com.football.management.dto.DemandePlayersDTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;

/**
 * ✅ VALIDATEUR POUR RENOUVELLEMENT (Type 2)
 *
 * LOGIQUE DE VALIDATION:
 * 1. Déterminer critères de recherche selon âge (CADETS+ vs <CADETS)
 * 2. Vérifier que le joueur EXISTE dans ct_intervenants
 * 3. Vérifier qu'il avait une licence l'année dernière dans LE MÊME CLUB (ct_team_intervenants)
 * 4. Vérifier qu'il n'y a pas déjà une demande de renouvellement cette saison
 *
 * @see GUIDE_VALIDATION_LICENCES.md pour la documentation complète
 */
@Component
public class RenewalValidator {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Valide une demande de RENOUVELLEMENT
     */
    public ValidationResult validateRenewal(DemandePlayersDTO dto) {
        ValidationResult result = new ValidationResult();

        // Vérifier si c'est bien un RENOUVELLEMENT (type = 2)
        if (dto.getTypeLicenceId() == null || dto.getTypeLicenceId().compareTo(BigDecimal.valueOf(2)) != 0) {
            return result; // Pas un renouvellement, OK
        }

        System.out.println("════════════════════════════════════════════════════════════");
        System.out.println("🔍 VALIDATION RENOUVELLEMENT - DÉBUT");
        System.out.println("════════════════════════════════════════════════════════════");

        // ✅ ÉTAPE 1: Déterminer les critères de recherche selon l'âge
        boolean isCadetsOrOlder = isCadetsOrOlder(dto.getDateOfBirth());
        System.out.println("📅 Date de naissance: " + dto.getDateOfBirth());
        System.out.println("👤 Catégorie: " + (isCadetsOrOlder ? "CADETS+ (≥16 ans)" : "< CADETS (<16 ans)"));

        // ✅ ÉTAPE 2: Vérifier que le joueur EXISTE dans le système
        System.out.println("\n🔍 ÉTAPE 2: Vérification existence du joueur dans ct_intervenants...");
        if (!playerExists(dto, isCadetsOrOlder)) {
            result.addError("❌ JOUEUR INTROUVABLE\n\n" +
                "Ce joueur n'existe pas dans le système.\n\n" +
                "➤ Utilisez \"NOUVELLE LICENCE\" pour enregistrer un nouveau joueur.");
            System.out.println("❌ RÉSULTAT: Joueur n'existe pas");
            System.out.println("════════════════════════════════════════════════════════════\n");
            return result;
        }
        System.out.println("✅ Joueur existe dans ct_intervenants");

        // ✅ ÉTAPE 3: Vérifier qu'il avait une licence l'année dernière dans LE MÊME CLUB
        System.out.println("\n🔍 ÉTAPE 3: Vérification licence saison précédente dans ct_team_intervenants...");
        if (!hadLicenceLastSeasonInSameTeam(dto, isCadetsOrOlder)) {
            result.addError("❌ JOUEUR NON LICENCIÉ L'ANNÉE DERNIÈRE\n\n" +
                "Ce joueur n'avait pas de licence dans votre club lors de la saison précédente.\n\n" +
                "➤ Veuillez utiliser l'un des types suivants :\n\n" +
                "   • MUTATION : Si le joueur vient d'un autre club de la même ligue\n" +
                "   • TRANSFERT : Si le joueur est transféré d'un autre club\n" +
                "   • NOUVELLE LICENCE : Si c'est un nouveau joueur");
            System.out.println("❌ RÉSULTAT: Pas de licence saison précédente");
            System.out.println("════════════════════════════════════════════════════════════\n");
            return result;
        }
        System.out.println("✅ Joueur avait une licence saison précédente dans ce club");

        // ✅ ÉTAPE 4: Vérifier qu'il n'y a pas déjà une demande de renouvellement cette saison
        System.out.println("\n📋 ÉTAPE 4: Vérification demandes existantes...");
        if (hasExistingRenewalThisSeason(dto, isCadetsOrOlder)) {
            result.addError("❌ DEMANDE DE RENOUVELLEMENT DÉJÀ ENREGISTRÉE\n\n" +
                "Ce joueur a déjà une demande de renouvellement enregistrée pour cette saison.\n\n" +
                "➤ Impossible de créer une deuxième demande de renouvellement pour le même joueur dans la même saison.");
            System.out.println("❌ RÉSULTAT: Demande de renouvellement existante trouvée");
            System.out.println("════════════════════════════════════════════════════════════\n");
            return result;
        }
        System.out.println("✅ Aucune demande de renouvellement existante");

        System.out.println("\n✅ VALIDATION RENOUVELLEMENT - SUCCÈS");
        System.out.println("════════════════════════════════════════════════════════════\n");

        return result;
    }

    /**
     * Détermine si le joueur est CADETS+ (≥16 ans) ou <CADETS (<16 ans)
     */
    private boolean isCadetsOrOlder(LocalDate dateOfBirth) {
        if (dateOfBirth == null) {
            System.out.println("   ⚠️  Date de naissance NULL → considéré comme CADETS+");
            return true; // Par défaut, on considère CADETS+
        }

        int age = Period.between(dateOfBirth, LocalDate.now()).getYears();
        System.out.println("   Âge calculé: " + age + " ans");
        return age >= 16;
    }

    /**
     * ÉTAPE 2: Vérifie si le joueur EXISTE dans ct_intervenants
     *
     * Critères de recherche:
     * - CADETS+ (≥16 ans): Recherche par CIN ou Passeport
     * - <CADETS (<16 ans): Recherche par Nom + Prénom + Date de Naissance
     */
    private boolean playerExists(DemandePlayersDTO dto, boolean isCadetsOrOlder) {
        String sql;
        Object[] params;

        if (isCadetsOrOlder) {
            // CADETS+ : Recherche par CIN ou Passeport
            System.out.println("🔎 Recherche intervenant par: CIN ou Passeport");
            System.out.println("   CIN: " + dto.getCinNumber());
            System.out.println("   Passeport: " + dto.getPassportNum());

            // ✅ Vérification AVANT d'exécuter la requête
            if (dto.getCinNumber() == null && dto.getPassportNum() == null) {
                System.out.println("⚠️  Aucun CIN ni Passeport fourni → BLOQUER (obligatoire pour renouvellement)");
                return false;
            }

            sql = "SELECT COUNT(*) FROM ct_intervenants " +
                  "WHERE cin_number = ? OR passport_num = ?";

            params = new Object[]{
                dto.getCinNumber(),
                dto.getPassportNum()
            };

        } else {
            // <CADETS : Recherche par Nom + Prénom + Date Naissance
            System.out.println("🔎 Recherche intervenant par: Nom + Prénom + Date");
            System.out.println("   Nom: " + dto.getLastName());
            System.out.println("   Prénom: " + dto.getName());
            System.out.println("   Date: " + dto.getDateOfBirth());

            // ✅ Vérification AVANT d'exécuter la requête
            if (dto.getLastName() == null || dto.getName() == null || dto.getDateOfBirth() == null) {
                System.out.println("⚠️  Informations incomplètes → BLOQUER (obligatoires pour renouvellement)");
                return false;
            }

            sql = "SELECT COUNT(*) FROM ct_intervenants " +
                  "WHERE UPPER(last_name) = UPPER(?) " +
                  "AND UPPER(name) = UPPER(?) " +
                  "AND date_of_birth = ?";

            params = new Object[]{
                dto.getLastName(),
                dto.getName(),
                dto.getDateOfBirth()
            };
        }

        try {
            System.out.println("   📝 SQL Intervenants: " + sql);
            System.out.println("   📝 Params: " + java.util.Arrays.toString(params));

            Object countObj = jdbcTemplate.queryForObject(sql, Object.class, params);
            int count = convertToInt(countObj);

            System.out.println("   ✅ Résultat COUNT intervenants: " + count);

            if (count > 0) {
                System.out.println("   ✅ Joueur trouvé dans ct_intervenants");
                return true;
            } else {
                System.out.println("   ❌ Joueur NON trouvé dans ct_intervenants");
                return false;
            }

        } catch (Exception e) {
            System.err.println("❌ ERREUR SQL lors de la vérification du joueur dans ct_intervenants:");
            System.err.println("   Message: " + e.getMessage());
            e.printStackTrace();
            // ⚠️ IMPORTANT: En cas d'erreur SQL, on BLOQUE par sécurité
            System.err.println("   ⚠️  PAR SÉCURITÉ: On bloque la demande");
            return false;
        }
    }

    /**
     * ÉTAPE 3: Vérifie si le joueur est éligible pour RENOUVELLEMENT
     *
     * LOGIQUE COMPLEXE basée sur la requête existante:
     * - Joueurs qui avaient une licence dans les saisons PRÉCÉDENTES
     *   ET type_licence NOT IN (5=PRÊT, 6=RENOUVELLEMENT_SPÉCIAL)
     * - OU joueurs de la saison ACTUELLE avec type_licence IN (4=MUTATION, 11=LIBRE)
     *
     * Table: ct_team_intervenants
     * Critères de recherche:
     * - CADETS+ (≥16 ans): Recherche par CIN ou Passeport
     * - <CADETS (<16 ans): Recherche par Nom + Prénom + Date de Naissance
     */
    private boolean hadLicenceLastSeasonInSameTeam(DemandePlayersDTO dto, boolean isCadetsOrOlder) {
        if (dto.getTeamId() == null || dto.getSeasonId() == null) {
            System.out.println("⚠️  Team ID ou Season ID manquant → SKIP vérification");
            return false;
        }

        System.out.println("📅 Saison actuelle: " + dto.getSeasonId());

        String sql;
        Object[] params;

        if (isCadetsOrOlder) {
            // CADETS+ : Recherche par CIN ou Passeport
            System.out.println("🔎 Recherche éligibilité renouvellement par: CIN ou Passeport");
            System.out.println("   CIN: " + dto.getCinNumber());
            System.out.println("   Passeport: " + dto.getPassportNum());

            if (dto.getCinNumber() == null && dto.getPassportNum() == null) {
                System.out.println("⚠️  Aucun CIN ni Passeport fourni → SKIP vérification");
                return false;
            }

            // ✅ LOGIQUE COMPLEXE avec JOINTURE: Saisons précédentes OU saison actuelle avec MUTATION/LIBRE
            sql = "SELECT COUNT(*) FROM ct_team_intervenants ti " +
                  "INNER JOIN ct_intervenants i ON ti.ct_intervenant_id = i.ct_intervenant_id " +
                  "WHERE ti.ct_team_id = ? " +
                  "AND ti.ct_intervenant_type_id = 1 " +  // Type = Joueur
                  "AND (i.cin_number = ? OR i.passport_num = ?) " +
                  "AND (" +
                  "    (ti.ct_season_id < ? AND ti.ct_type_licence_id NOT IN (5, 6)) " +  // Saisons précédentes (pas PRÊT/RENOUVELLEMENT_SPÉCIAL)
                  "    OR (ti.ct_season_id = ? AND ti.ct_type_licence_id IN (4, 11)) " +  // Saison actuelle avec MUTATION/LIBRE
                  ")";

            params = new Object[]{
                dto.getTeamId(),
                dto.getCinNumber(),
                dto.getPassportNum(),
                dto.getSeasonId(),  // Pour ct_season_id < ?
                dto.getSeasonId()   // Pour ct_season_id = ?
            };

        } else {
            // <CADETS : Recherche par Nom + Prénom + Date Naissance
            System.out.println("🔎 Recherche éligibilité renouvellement par: Nom + Prénom + Date");
            System.out.println("   Nom: " + dto.getLastName());
            System.out.println("   Prénom: " + dto.getName());
            System.out.println("   Date: " + dto.getDateOfBirth());

            if (dto.getLastName() == null || dto.getName() == null || dto.getDateOfBirth() == null) {
                System.out.println("⚠️  Informations incomplètes → SKIP vérification");
                return false;
            }

            // ✅ LOGIQUE COMPLEXE avec JOINTURE: Saisons précédentes OU saison actuelle avec MUTATION/LIBRE
            sql = "SELECT COUNT(*) FROM ct_team_intervenants ti " +
                  "INNER JOIN ct_intervenants i ON ti.ct_intervenant_id = i.ct_intervenant_id " +
                  "WHERE ti.ct_team_id = ? " +
                  "AND ti.ct_intervenant_type_id = 1 " +  // Type = Joueur
                  "AND UPPER(i.last_name) = UPPER(?) " +
                  "AND UPPER(i.name) = UPPER(?) " +
                  "AND i.date_of_birth = ? " +
                  "AND (" +
                  "    (ti.ct_season_id < ? AND ti.ct_type_licence_id NOT IN (5, 6)) " +  // Saisons précédentes (pas PRÊT/RENOUVELLEMENT_SPÉCIAL)
                  "    OR (ti.ct_season_id = ? AND ti.ct_type_licence_id IN (4, 11)) " +  // Saison actuelle avec MUTATION/LIBRE
                  ")";

            params = new Object[]{
                dto.getTeamId(),
                dto.getLastName(),
                dto.getName(),
                dto.getDateOfBirth(),
                dto.getSeasonId(),  // Pour ct_season_id < ?
                dto.getSeasonId()   // Pour ct_season_id = ?
            };
        }

        try {
            System.out.println("   📝 SQL Team Intervenants (LOGIQUE COMPLEXE): " + sql);
            System.out.println("   📝 Params: " + java.util.Arrays.toString(params));

            Object countObj = jdbcTemplate.queryForObject(sql, Object.class, params);
            int count = convertToInt(countObj);

            System.out.println("   ✅ Résultat COUNT éligibilité: " + count);

            if (count > 0) {
                System.out.println("   ✅ Joueur ÉLIGIBLE pour renouvellement");
                System.out.println("   (Avait une licence saisons précédentes OU MUTATION/LIBRE cette saison)");
                return true;
            } else {
                System.out.println("   ❌ Joueur NON ÉLIGIBLE pour renouvellement");
                return false;
            }

        } catch (Exception e) {
            System.err.println("❌ ERREUR SQL lors de la vérification de l'éligibilité:");
            System.err.println("   Message: " + e.getMessage());
            e.printStackTrace();
            // ⚠️ IMPORTANT: En cas d'erreur SQL, on BLOQUE par sécurité
            System.err.println("   ⚠️  PAR SÉCURITÉ: On bloque la demande");
            return false;
        }
    }

    /**
     * ÉTAPE 4: Vérifie si une demande de renouvellement existe déjà pour ce joueur cette saison
     *
     * Critères de recherche:
     * - CADETS+ (≥16 ans): Recherche par CIN ou Passeport
     * - <CADETS (<16 ans): Recherche par Nom + Prénom + Date de Naissance
     */
    private boolean hasExistingRenewalThisSeason(DemandePlayersDTO dto, boolean isCadetsOrOlder) {
        if (dto.getSeasonId() == null || dto.getTeamId() == null) {
            System.out.println("⚠️  Season ID ou Team ID manquant → SKIP vérification");
            return false;
        }

        String sql;
        Object[] params;

        if (isCadetsOrOlder) {
            // CADETS+ : Recherche par CIN ou Passeport
            System.out.println("🔎 Recherche demande par: CIN ou Passeport");
            System.out.println("   CIN: " + dto.getCinNumber());
            System.out.println("   Passeport: " + dto.getPassportNum());

            if (dto.getCinNumber() == null && dto.getPassportNum() == null) {
                System.out.println("⚠️  Aucun CIN ni Passeport fourni → SKIP vérification");
                return false; // Pas de critère de recherche
            }

            sql = "SELECT COUNT(*) FROM ct_demandes " +
                  "WHERE ct_team_id = ? " +
                  "AND ct_season_id = ? " +
                  "AND ct_type_licence_id = 2 " +
                  "AND (cin_number = ? OR passport_num = ?) " +
                  "AND ct_demande_statu_id != 0";

            params = new Object[]{
                dto.getTeamId(),
                dto.getSeasonId(),
                dto.getCinNumber(),
                dto.getPassportNum()
            };

        } else {
            // <CADETS : Recherche par Nom + Prénom + Date Naissance
            System.out.println("🔎 Recherche demande par: Nom + Prénom + Date de Naissance");
            System.out.println("   Nom: " + dto.getLastName());
            System.out.println("   Prénom: " + dto.getName());
            System.out.println("   Date: " + dto.getDateOfBirth());

            if (dto.getLastName() == null || dto.getName() == null || dto.getDateOfBirth() == null) {
                System.out.println("⚠️  Informations incomplètes → SKIP vérification");
                return false;
            }

            sql = "SELECT COUNT(*) FROM ct_demandes " +
                  "WHERE ct_team_id = ? " +
                  "AND ct_season_id = ? " +
                  "AND ct_type_licence_id = 2 " +
                  "AND UPPER(last_name) = UPPER(?) " +
                  "AND UPPER(name) = UPPER(?) " +
                  "AND date_of_birth = ? " +
                  "AND ct_demande_statu_id != 0";

            params = new Object[]{
                dto.getTeamId(),
                dto.getSeasonId(),
                dto.getLastName(),
                dto.getName(),
                dto.getDateOfBirth()
            };
        }

        try {
            System.out.println("   📝 SQL Demandes: " + sql);
            System.out.println("   📝 Params: " + java.util.Arrays.toString(params));

            Object countObj = jdbcTemplate.queryForObject(sql, Object.class, params);
            int count = convertToInt(countObj);

            System.out.println("   ✅ Résultat COUNT demandes: " + count);

            if (count > 0) {
                System.out.println("   ❌ DEMANDE(S) DE RENOUVELLEMENT EXISTANTE(S) trouvée(s)!");
                return true;
            } else {
                System.out.println("   ✅ Aucune demande de renouvellement existante");
                return false;
            }

        } catch (Exception e) {
            System.err.println("❌ ERREUR SQL lors de la vérification des demandes:");
            System.err.println("   Message: " + e.getMessage());
            e.printStackTrace();
            // En cas d'erreur, on bloque par sécurité
            System.err.println("   ⚠️  PAR SÉCURITÉ: On bloque la demande");
            return true;
        }
    }

    /**
     * Convertit un Object (BigDecimal ou Number) en int
     */
    private int convertToInt(Object countObj) {
        if (countObj instanceof BigDecimal) {
            return ((BigDecimal) countObj).intValue();
        } else if (countObj instanceof Number) {
            return ((Number) countObj).intValue();
        }
        return 0;
    }

    // ==================== MÉTHODES POUR LE FRONTEND ====================

    /**
     * Vérifie si un joueur peut être renouvelé (pour le frontend)
     * Utilisé pour afficher/masquer le bouton de renouvellement
     */
    public boolean canPlayerBeRenewed(BigDecimal intervenantId, BigDecimal teamId, BigDecimal seasonId) {
        if (intervenantId == null || teamId == null || seasonId == null) {
            return false;
        }

        String sql = "SELECT COUNT(*) FROM ct_team_intervenants ti " +
                    "WHERE ti.ct_intervenant_id = ? " +
                    "AND ti.ct_team_id = ? " +
                    "AND ti.ct_intervenant_type_id = 1 " +
                    "AND (" +
                    "    (ti.ct_season_id < ? AND ti.ct_type_licence_id NOT IN (5, 6)) " +
                    "    OR (ti.ct_season_id = ? AND ti.ct_type_licence_id IN (4, 11)) " +
                    ")";

        try {
            Object countObj = jdbcTemplate.queryForObject(sql, Object.class,
                intervenantId, teamId, seasonId, seasonId);
            int count = convertToInt(countObj);
            return count > 0;
        } catch (Exception e) {
            System.err.println("Erreur canPlayerBeRenewed: " + e.getMessage());
            return false;
        }
    }

    /**
     * Obtient les infos de la dernière licence (pour le frontend)
     */
    public java.util.Map<String, Object> getPlayerLastLicenceInfo(BigDecimal intervenantId, BigDecimal seasonId) {
        String sql = "SELECT " +
                    "ti.ct_team_intervenant_id, " +
                    "t.name as team_name, " +
                    "t.id as team_id, " +
                    "s.libelle as season, " +
                    "ti.ct_season_id, " +
                    "ti.ct_type_licence_id " +
                    "FROM ct_team_intervenants ti " +
                    "JOIN team t ON ti.ct_team_id = t.id " +
                    "JOIN saison s ON ti.ct_season_id = s.id " +
                    "WHERE ti.ct_intervenant_id = ? " +
                    "AND ti.ct_season_id < ? " +
                    "AND ti.ct_intervenant_type_id = 1 " +
                    "ORDER BY ti.ct_season_id DESC " +
                    "LIMIT 1";

        try {
            return jdbcTemplate.queryForMap(sql, intervenantId, seasonId);
        } catch (Exception e) {
            System.err.println("Erreur getPlayerLastLicenceInfo: " + e.getMessage());
            return new java.util.HashMap<>();
        }
    }
}
