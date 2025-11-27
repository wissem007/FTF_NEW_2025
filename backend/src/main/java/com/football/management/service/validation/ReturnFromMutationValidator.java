package com.football.management.service.validation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import com.football.management.dto.DemandePlayersDTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;

/**
 * ✅ VALIDATEUR POUR RETOUR MUTATION (Type 9)
 *
 * LOGIQUE DE VALIDATION:
 * 1. Déterminer critères de recherche selon âge (CADETS+ vs <CADETS)
 * 2. Vérifier que le joueur EXISTE dans ct_intervenants
 * 3. Vérifier qu'il a une MUTATION (Type 4) dans la saison ACTUELLE dans VOTRE club
 * 4. Vérifier qu'il avait une licence dans VOTRE club avant la mutation
 * 5. Vérifier qu'il n'y a pas déjà une demande de retour mutation cette saison
 *
 * @see GUIDE_VALIDATION_LICENCES.md pour la documentation complète
 */
@Component
public class ReturnFromMutationValidator {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Valide une demande de RETOUR MUTATION (Type 9)
     */
    public ValidationResult validateReturnFromMutation(DemandePlayersDTO dto) {
        ValidationResult result = new ValidationResult();

        // Vérifier si c'est un RETOUR MUTATION (type = 9)
        if (dto.getTypeLicenceId() == null || dto.getTypeLicenceId().compareTo(BigDecimal.valueOf(9)) != 0) {
            return result; // Pas un retour mutation, OK
        }

        System.out.println("════════════════════════════════════════════════════════════");
        System.out.println("🔍 VALIDATION RETOUR MUTATION - DÉBUT");
        System.out.println("════════════════════════════════════════════════════════════");

        // ✅ ÉTAPE 1: Déterminer les critères de recherche selon l'âge
        boolean isCadetsOrOlder = isCadetsOrOlder(dto.getDateOfBirth());
        System.out.println("📅 Date de naissance: " + dto.getDateOfBirth());
        System.out.println("👤 Catégorie: " + (isCadetsOrOlder ? "CADETS+ (≥16 ans)" : "< CADETS (<16 ans)"));

        // ✅ ÉTAPE 2: Vérifier que le joueur existe dans ct_intervenants
        System.out.println("\n📋 ÉTAPE 2: Vérification existence joueur dans ct_intervenants...");
        if (!playerExists(dto, isCadetsOrOlder)) {
            result.addError("❌ JOUEUR INTROUVABLE DANS LE SYSTÈME\n\n" +
                "Ce joueur n'existe pas dans la base de données.\n\n" +
                "➤ Le type \"RETOUR MUTATION\" est réservé aux joueurs déjà enregistrés qui reviennent dans votre club.\n\n" +
                "➤ Veuillez utiliser \"NOUVELLE LICENCE\" pour enregistrer un nouveau joueur.");
            System.out.println("❌ RÉSULTAT: Joueur n'existe pas");
            System.out.println("════════════════════════════════════════════════════════════\n");
            return result;
        }
        System.out.println("✅ Joueur existe dans le système");

        // ✅ ÉTAPE 3: Vérifier qu'il a une MUTATION dans la saison ACTUELLE dans votre club
        System.out.println("\n🔍 ÉTAPE 3: Vérification MUTATION saison actuelle...");
        if (!hasMutationThisSeason(dto, isCadetsOrOlder)) {
            result.addError("❌ JOUEUR N'A PAS DE MUTATION ACTIVE\n\n" +
                "Ce joueur n'a pas de mutation active dans votre club pour la saison actuelle.\n\n" +
                "➤ Le type \"Retour de Mutation\" est réservé aux joueurs qui ont une mutation active dans votre club.\n\n" +
                "➤ Veuillez utiliser l'un des types suivants :\n\n" +
                "   • RENOUVELLEMENT : Si le joueur était dans votre club l'année dernière\n" +
                "   • MUTATION : Si le joueur vient d'un autre club (mutation standard)\n" +
                "   • TRANSFERT : Si le joueur est transféré d'un autre club");
            System.out.println("❌ RÉSULTAT: Pas de mutation active");
            System.out.println("════════════════════════════════════════════════════════════\n");
            return result;
        }
        System.out.println("✅ Mutation active trouvée dans votre club");

        // ✅ ÉTAPE 4: Vérifier qu'il avait une licence dans votre club AVANT la mutation
        System.out.println("\n🔍 ÉTAPE 4: Vérification licence antérieure dans votre club...");
        if (!hadLicenceBeforeMutation(dto, isCadetsOrOlder)) {
            // Ce n'est pas un RETOUR de mutation, c'est une mutation normale
            // On ne bloque pas, on laisse passer (validation normale de mutation)
            System.out.println("ℹ️  Joueur n'avait pas de licence antérieure → MUTATION NORMALE (pas un retour)");
            System.out.println("════════════════════════════════════════════════════════════\n");
            return result; // OK - c'est une mutation normale
        }
        System.out.println("✅ Licence antérieure trouvée → RETOUR DE MUTATION confirmé");

        // ✅ ÉTAPE 5: Vérifier qu'il n'y a pas de demande existante cette saison
        System.out.println("\n📋 ÉTAPE 5: Vérification demandes existantes cette saison...");
        if (hasExistingDemandeThisSeason(dto, isCadetsOrOlder)) {
            result.addError("❌ DEMANDE DÉJÀ ENREGISTRÉE\n\n" +
                "Ce joueur a déjà une demande de retour mutation enregistrée pour cette saison.\n\n" +
                "➤ Impossible de créer une deuxième demande pour le même joueur dans la même saison.");
            System.out.println("❌ RÉSULTAT: Demande existante trouvée");
            System.out.println("════════════════════════════════════════════════════════════\n");
            return result;
        }
        System.out.println("✅ Aucune demande existante trouvée");

        System.out.println("\n✅ VALIDATION RETOUR MUTATION - SUCCÈS");
        System.out.println("════════════════════════════════════════════════════════════\n");

        return result;
    }

    /**
     * Détermine si le joueur est CADETS+ (≥16 ans) ou <CADETS (<16 ans)
     */
    private boolean isCadetsOrOlder(LocalDate dateOfBirth) {
        if (dateOfBirth == null) {
            System.out.println("   ⚠️  Date de naissance NULL → considéré comme CADETS+");
            return true;
        }

        int age = Period.between(dateOfBirth, LocalDate.now()).getYears();
        System.out.println("   Âge calculé: " + age + " ans");
        return age >= 16;
    }

    /**
     * ÉTAPE 2: Vérifie si le joueur existe dans ct_intervenants
     */
    private boolean playerExists(DemandePlayersDTO dto, boolean isCadetsOrOlder) {
        String sql;
        Object[] params;

        if (isCadetsOrOlder) {
            System.out.println("🔎 Recherche joueur par: CIN ou Passeport");
            System.out.println("   CIN: " + dto.getCinNumber());
            System.out.println("   Passeport: " + dto.getPassportNum());

            if (dto.getCinNumber() == null && dto.getPassportNum() == null) {
                System.out.println("⚠️  Aucun CIN ni Passeport fourni → SKIP vérification");
                return false;
            }

            sql = "SELECT COUNT(*) FROM ct_intervenants " +
                  "WHERE cin_number = ? OR passport_num = ?";

            params = new Object[]{
                dto.getCinNumber(),
                dto.getPassportNum()
            };

        } else {
            System.out.println("🔎 Recherche joueur par: Nom + Prénom + Date de Naissance");
            System.out.println("   Nom: " + dto.getLastName());
            System.out.println("   Prénom: " + dto.getName());
            System.out.println("   Date: " + dto.getDateOfBirth());

            if (dto.getLastName() == null || dto.getName() == null || dto.getDateOfBirth() == null) {
                System.out.println("⚠️  Informations incomplètes → SKIP vérification");
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
            System.out.println("   📝 SQL: " + sql);
            System.out.println("   📝 Params: " + java.util.Arrays.toString(params));

            Object countObj = jdbcTemplate.queryForObject(sql, Object.class, params);
            int count = convertToInt(countObj);

            System.out.println("   ✅ Résultat COUNT: " + count);
            return count > 0;

        } catch (Exception e) {
            System.err.println("❌ ERREUR SQL lors de la vérification de l'existence du joueur:");
            System.err.println("   Message: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * ÉTAPE 3: Vérifie si le joueur a une MUTATION (Type 4) dans la saison ACTUELLE dans votre club
     */
    private boolean hasMutationThisSeason(DemandePlayersDTO dto, boolean isCadetsOrOlder) {
        if (dto.getSeasonId() == null || dto.getTeamId() == null) {
            System.out.println("⚠️  Season ID ou Team ID manquant → SKIP vérification");
            return false;
        }

        String sql;
        Object[] params;

        if (isCadetsOrOlder) {
            System.out.println("🔎 Recherche MUTATION saison actuelle par: CIN ou Passeport");
            System.out.println("   CIN: " + dto.getCinNumber());
            System.out.println("   Passeport: " + dto.getPassportNum());

            if (dto.getCinNumber() == null && dto.getPassportNum() == null) {
                System.out.println("⚠️  Aucun CIN ni Passeport fourni → SKIP vérification");
                return false;
            }

            sql = "SELECT COUNT(*) FROM ct_team_intervenants ti " +
                  "INNER JOIN ct_intervenants i ON ti.ct_intervenant_id = i.ct_intervenant_id " +
                  "WHERE ti.ct_team_id = ? " +
                  "AND ti.ct_season_id = ? " +
                  "AND ti.ct_intervenant_type_id = 1 " +
                  "AND ti.ct_type_licence_id = 4 " +
                  "AND (i.cin_number = ? OR i.passport_num = ?)";

            params = new Object[]{
                dto.getTeamId(),
                dto.getSeasonId(),
                dto.getCinNumber(),
                dto.getPassportNum()
            };

        } else {
            System.out.println("🔎 Recherche MUTATION saison actuelle par: Nom + Prénom + Date");
            System.out.println("   Nom: " + dto.getLastName());
            System.out.println("   Prénom: " + dto.getName());
            System.out.println("   Date: " + dto.getDateOfBirth());

            if (dto.getLastName() == null || dto.getName() == null || dto.getDateOfBirth() == null) {
                System.out.println("⚠️  Informations incomplètes → SKIP vérification");
                return false;
            }

            sql = "SELECT COUNT(*) FROM ct_team_intervenants ti " +
                  "INNER JOIN ct_intervenants i ON ti.ct_intervenant_id = i.ct_intervenant_id " +
                  "WHERE ti.ct_team_id = ? " +
                  "AND ti.ct_season_id = ? " +
                  "AND ti.ct_intervenant_type_id = 1 " +
                  "AND ti.ct_type_licence_id = 4 " +
                  "AND UPPER(i.last_name) = UPPER(?) " +
                  "AND UPPER(i.name) = UPPER(?) " +
                  "AND i.date_of_birth = ?";

            params = new Object[]{
                dto.getTeamId(),
                dto.getSeasonId(),
                dto.getLastName(),
                dto.getName(),
                dto.getDateOfBirth()
            };
        }

        try {
            System.out.println("   📝 SQL MUTATION: " + sql);
            System.out.println("   📝 Params: " + java.util.Arrays.toString(params));

            Object countObj = jdbcTemplate.queryForObject(sql, Object.class, params);
            int count = convertToInt(countObj);

            System.out.println("   ✅ Résultat COUNT MUTATION: " + count);
            return count > 0;

        } catch (Exception e) {
            System.err.println("❌ ERREUR SQL lors de la vérification de la mutation:");
            System.err.println("   Message: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * ÉTAPE 4: Vérifie si le joueur avait une licence dans votre club AVANT la mutation
     * (Saisons précédentes, pas de type PRÊT ou RENOUVELLEMENT_SPÉCIAL)
     */
    private boolean hadLicenceBeforeMutation(DemandePlayersDTO dto, boolean isCadetsOrOlder) {
        if (dto.getSeasonId() == null || dto.getTeamId() == null) {
            System.out.println("⚠️  Season ID ou Team ID manquant → SKIP vérification");
            return false;
        }

        String sql;
        Object[] params;

        if (isCadetsOrOlder) {
            System.out.println("🔎 Recherche licence antérieure par: CIN ou Passeport");
            System.out.println("   CIN: " + dto.getCinNumber());
            System.out.println("   Passeport: " + dto.getPassportNum());

            if (dto.getCinNumber() == null && dto.getPassportNum() == null) {
                System.out.println("⚠️  Aucun CIN ni Passeport fourni → SKIP vérification");
                return false;
            }

            sql = "SELECT COUNT(*) FROM ct_team_intervenants ti " +
                  "INNER JOIN ct_intervenants i ON ti.ct_intervenant_id = i.ct_intervenant_id " +
                  "WHERE ti.ct_team_id = ? " +
                  "AND ti.ct_intervenant_type_id = 1 " +
                  "AND (i.cin_number = ? OR i.passport_num = ?) " +
                  "AND ti.ct_season_id < ? " +
                  "AND ti.ct_type_licence_id NOT IN (5, 6)";

            params = new Object[]{
                dto.getTeamId(),
                dto.getCinNumber(),
                dto.getPassportNum(),
                dto.getSeasonId()
            };

        } else {
            System.out.println("🔎 Recherche licence antérieure par: Nom + Prénom + Date");
            System.out.println("   Nom: " + dto.getLastName());
            System.out.println("   Prénom: " + dto.getName());
            System.out.println("   Date: " + dto.getDateOfBirth());

            if (dto.getLastName() == null || dto.getName() == null || dto.getDateOfBirth() == null) {
                System.out.println("⚠️  Informations incomplètes → SKIP vérification");
                return false;
            }

            sql = "SELECT COUNT(*) FROM ct_team_intervenants ti " +
                  "INNER JOIN ct_intervenants i ON ti.ct_intervenant_id = i.ct_intervenant_id " +
                  "WHERE ti.ct_team_id = ? " +
                  "AND ti.ct_intervenant_type_id = 1 " +
                  "AND UPPER(i.last_name) = UPPER(?) " +
                  "AND UPPER(i.name) = UPPER(?) " +
                  "AND i.date_of_birth = ? " +
                  "AND ti.ct_season_id < ? " +
                  "AND ti.ct_type_licence_id NOT IN (5, 6)";

            params = new Object[]{
                dto.getTeamId(),
                dto.getLastName(),
                dto.getName(),
                dto.getDateOfBirth(),
                dto.getSeasonId()
            };
        }

        try {
            System.out.println("   📝 SQL Licence Antérieure: " + sql);
            System.out.println("   📝 Params: " + java.util.Arrays.toString(params));

            Object countObj = jdbcTemplate.queryForObject(sql, Object.class, params);
            int count = convertToInt(countObj);

            System.out.println("   ✅ Résultat COUNT Licence Antérieure: " + count);
            return count > 0;

        } catch (Exception e) {
            System.err.println("❌ ERREUR SQL lors de la vérification de la licence antérieure:");
            System.err.println("   Message: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * ÉTAPE 5: Vérifie si une demande existe déjà pour ce joueur cette saison
     */
    private boolean hasExistingDemandeThisSeason(DemandePlayersDTO dto, boolean isCadetsOrOlder) {
        if (dto.getSeasonId() == null || dto.getTeamId() == null) {
            System.out.println("⚠️  Season ID ou Team ID manquant → SKIP vérification");
            return false;
        }

        String sql;
        Object[] params;

        if (isCadetsOrOlder) {
            System.out.println("🔎 Recherche demande par: CIN ou Passeport");
            System.out.println("   CIN: " + dto.getCinNumber());
            System.out.println("   Passeport: " + dto.getPassportNum());

            if (dto.getCinNumber() == null && dto.getPassportNum() == null) {
                System.out.println("⚠️  Aucun CIN ni Passeport fourni → SKIP vérification");
                return false;
            }

            sql = "SELECT COUNT(*) FROM ct_demandes " +
                  "WHERE ct_team_id = ? " +
                  "AND ct_season_id = ? " +
                  "AND ct_type_licence_id = 9 " +
                  "AND (cin_number = ? OR passport_num = ?) " +
                  "AND ct_demande_statu_id != 0";

            params = new Object[]{
                dto.getTeamId(),
                dto.getSeasonId(),
                dto.getCinNumber(),
                dto.getPassportNum()
            };

        } else {
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
                  "AND ct_type_licence_id = 9 " +
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
                System.out.println("   ❌ DEMANDE(S) EXISTANTE(S) trouvée(s)!");
                return true;
            } else {
                System.out.println("   ✅ Aucune demande existante");
                return false;
            }

        } catch (Exception e) {
            System.err.println("❌ ERREUR SQL lors de la vérification des demandes:");
            System.err.println("   Message: " + e.getMessage());
            e.printStackTrace();
            return true; // Bloquer par sécurité
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
}
