package com.football.management.service.validation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import com.football.management.dto.DemandePlayersDTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;

/**
 * ✅ VALIDATEUR POUR NOUVELLE LICENCE (Type 1)
 *
 * LOGIQUE DE VALIDATION:
 * 1. Déterminer critères de recherche selon âge (CADETS+ vs <CADETS)
 * 2. Vérifier qu'il n'y a pas de demande existante cette saison
 * 3. Vérifier que le joueur n'existe pas déjà dans la base
 *
 * @see GUIDE_VALIDATION_LICENCES.md pour la documentation complète
 */
@Component
public class NouvelleLicenceValidator {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Valide une demande de NOUVELLE LICENCE
     */
    public ValidationResult validateNouvelleLicence(DemandePlayersDTO dto) {
        ValidationResult result = new ValidationResult();

        // Vérifier si c'est bien une NOUVELLE LICENCE (type = 1)
        if (dto.getTypeLicenceId() == null || dto.getTypeLicenceId().compareTo(BigDecimal.ONE) != 0) {
            return result; // Pas une nouvelle licence, OK
        }

        System.out.println("════════════════════════════════════════════════════════════");
        System.out.println("🔍 VALIDATION NOUVELLE LICENCE - DÉBUT");
        System.out.println("════════════════════════════════════════════════════════════");

        // ✅ ÉTAPE 1: Déterminer les critères de recherche selon l'âge
        boolean isCadetsOrOlder = isCadetsOrOlder(dto.getDateOfBirth());
        System.out.println("📅 Date de naissance: " + dto.getDateOfBirth());
        System.out.println("👤 Catégorie: " + (isCadetsOrOlder ? "CADETS+ (≥16 ans)" : "< CADETS (<16 ans)"));

        // ✅ ÉTAPE 2: Vérifier demandes existantes cette saison
        System.out.println("\n📋 ÉTAPE 2: Vérification des demandes existantes...");
        if (hasExistingDemandeThisSeason(dto, isCadetsOrOlder)) {
            result.addError("❌ DEMANDE DÉJÀ ENREGISTRÉE\n\n" +
                "Ce joueur a déjà une demande de nouvelle licence enregistrée pour cette saison.\n\n" +
                "➤ Impossible de créer une deuxième demande de nouvelle licence pour le même joueur dans la même saison.");
            System.out.println("❌ RÉSULTAT: Demande existante trouvée");
            System.out.println("════════════════════════════════════════════════════════════\n");
            return result;
        }
        System.out.println("✅ Aucune demande existante trouvée");

        // ✅ ÉTAPE 3: Vérifier que le joueur n'existe pas déjà dans la base
        System.out.println("\n🔍 ÉTAPE 3: Vérification joueur existant dans ct_intervenants...");
        if (playerAlreadyExists(dto, isCadetsOrOlder)) {
            result.addError("❌ JOUEUR DÉJÀ EXISTANT DANS LE SYSTÈME\n\n" +
                "Ce joueur est déjà enregistré dans la base de données. " +
                "Le type \"Nouvelle Licence\" est réservé aux joueurs qui n'ont jamais été enregistrés.\n\n" +
                "➤ Veuillez utiliser l'un des types suivants :\n\n" +
                "   • RENOUVELLEMENT : Si le joueur était dans votre club l'année dernière\n" +
                "   • MUTATION : Si le joueur vient d'un autre club de la même ligue\n" +
                "   • TRANSFERT : Si le joueur est transféré d'un autre club");
            System.out.println("❌ RÉSULTAT: Joueur existe déjà");
            System.out.println("════════════════════════════════════════════════════════════\n");
            return result;
        }
        System.out.println("✅ Joueur n'existe pas - Validation OK");

        System.out.println("\n✅ VALIDATION NOUVELLE LICENCE - SUCCÈS");
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
     * ÉTAPE 2: Vérifie si une demande existe déjà pour ce joueur cette saison
     *
     * Critères de recherche:
     * - CADETS+ (≥16 ans): Recherche par CIN ou Passeport
     * - <CADETS (<16 ans): Recherche par Nom + Prénom + Date de Naissance
     */
    private boolean hasExistingDemandeThisSeason(DemandePlayersDTO dto, boolean isCadetsOrOlder) {
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
                  "AND ct_type_licence_id = 1 " +
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
                  "AND ct_type_licence_id = 1 " +
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
            // En cas d'erreur, on bloque par sécurité
            System.err.println("   ⚠️  PAR SÉCURITÉ: On bloque la demande");
            return true;
        }
    }

    /**
     * ÉTAPE 3: Vérifie si le joueur existe déjà dans la base intervenants
     *
     * Critères de recherche:
     * - CADETS+ (≥16 ans): Recherche par CIN ou Passeport
     * - <CADETS (<16 ans): Recherche par Nom + Prénom + Date de Naissance
     */
    private boolean playerAlreadyExists(DemandePlayersDTO dto, boolean isCadetsOrOlder) {
        String sql;
        Object[] params;

        if (isCadetsOrOlder) {
            // CADETS+ : Recherche par CIN ou Passeport
            System.out.println("🔎 Recherche intervenant par: CIN ou Passeport");
            System.out.println("   CIN: " + dto.getCinNumber());
            System.out.println("   Passeport: " + dto.getPassportNum());

            // ✅ Vérification AVANT d'exécuter la requête
            if (dto.getCinNumber() == null && dto.getPassportNum() == null) {
                System.out.println("⚠️  Aucun CIN ni Passeport fourni → AUTORISER (pas de critère)");
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
                System.out.println("⚠️  Informations incomplètes → AUTORISER (pas de critère)");
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
                System.out.println("   ❌ JOUEUR TROUVÉ dans ct_intervenants!");
                return true;
            } else {
                System.out.println("   ✅ Joueur NON trouvé dans ct_intervenants");
                return false;
            }

        } catch (Exception e) {
            System.err.println("❌ ERREUR SQL lors de la vérification du joueur dans ct_intervenants:");
            System.err.println("   Message: " + e.getMessage());
            e.printStackTrace();
            // ⚠️ IMPORTANT: En cas d'erreur SQL, on BLOQUE par sécurité
            // car on ne peut pas vérifier si le joueur existe ou non
            System.err.println("   ⚠️  PAR SÉCURITÉ: On bloque la demande car impossible de vérifier");
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
}
