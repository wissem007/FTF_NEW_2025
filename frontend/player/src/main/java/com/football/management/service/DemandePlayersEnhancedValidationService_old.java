package com.football.management.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import com.football.management.dto.DemandePlayersDTO;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Service de validation complexe basé sur l'ancien code
 * Intègre toutes les validations sophistiquées du système legacy
 */
@Service
public class DemandePlayersEnhancedValidationService_old {

    @Autowired
    private DemandePlayersService demandePlayersService;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    // CONSTANTES REPRISES DE L'ANCIEN CODE
    public static final class Constants {
        // Régimes
        public static final Long AMATEUR = 1L;
        public static final Long PROFESSIONNEL = 2L;
        public static final Long SEMI_PROFESSIONNEL = 3L;
        public static final Long STAGIAIRE = 4L;
        public static final Long REGIME_CP = 5L;

        // Types de licence
        public static final Long NOUVELLE = 1L;
        public static final Long RENOUVELLEMENT = 2L;
        public static final Long TRANSFERT = 3L;
        public static final Long TRANSFERT_LIBRE = 4L;
        public static final Long PRET = 5L;
        public static final Long MUTATION = 6L;
        public static final Long LIBRE_AMATEUR = 7L;
        public static final Long SURCLASSEMENT = 8L;

        // Catégories d'âge
        public static final Long U7 = 9L;
        public static final Long U9 = 1L;
        public static final Long U11 = 2L;
        public static final Long U13 = 3L;
        public static final Long U15 = 4L;
        public static final Long U17 = 5L;
        public static final Long U19 = 6L;
        public static final Long SENIOR = 7L;
        public static final Long CADETS = 4L;

        // Divisions/Ligues
        public static final Long LIGUE_I = 1L;
        public static final Long LIGUE_II = 2L;
        public static final Long LIGUE_III_1 = 3L;
        public static final Long LIGUE_III_2 = 4L;
        public static final Long LIGUE_REG = 10L;

        // Pays
        public static final Long TUNISIE = 216L;
        
        // Limites par défaut
        public static final Integer MAX_PLAYERS_TEAM = 80;
        public static final Integer MAX_PRO_PLAYERS = 25;
        public static final Integer MAX_FOREIGN_LIGUE1 = 4;
        public static final Integer MAX_FOREIGN_LIGUE2 = 3;
        public static final Integer MAX_LOAN_PRO = 5;
        public static final Integer MAX_TRANSFERS_U21 = 3;
        public static final Integer MAX_TRANSFERS_U22 = 5;
    }

    public static class ValidationResult {
        private boolean valid = true;
        private List<String> errors = new ArrayList<>();
        private List<String> warnings = new ArrayList<>();
        private String playerCategory;
        private String regime;
        private Integer age;
        private Long categoryId;
        private Long divisionId;

        public void addError(String error) {
            this.errors.add(error);
            this.valid = false;
        }

        public void addWarning(String warning) {
            this.warnings.add(warning);
        }

        // Getters et setters
        public boolean isValid() { return valid; }
        public List<String> getErrors() { return errors; }
        public List<String> getWarnings() { return warnings; }
        public String getPlayerCategory() { return playerCategory; }
        public String getRegime() { return regime; }
        public Integer getAge() { return age; }
        public Long getCategoryId() { return categoryId; }
        public Long getDivisionId() { return divisionId; }
        
        public void setPlayerCategory(String playerCategory) { this.playerCategory = playerCategory; }
        public void setRegime(String regime) { this.regime = regime; }
        public void setAge(Integer age) { this.age = age; }
        public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
        public void setDivisionId(Long divisionId) { this.divisionId = divisionId; }
    }

    /**
     * VALIDATION COMPLÈTE AVEC TOUTES LES RÈGLES COMPLEXES
     */
    public ValidationResult validateDemandeComplete(DemandePlayersDTO demande) {
        ValidationResult result = new ValidationResult();

        try {
            // Calculer les infos de base
            Integer age = calculateAge(demande.getDateOfBirth());
            Long categoryId = calculatePlayerCategory(demande.getDateOfBirth());
            Long divisionId = getTeamDivision(demande.getTeamId());
            
            result.setAge(age);
            result.setCategoryId(categoryId);
            result.setDivisionId(divisionId);
            result.setPlayerCategory(getCategoryLabel(categoryId));
            result.setRegime(getRegimeLabel(demande.getRegimeId()));

            // 1. VALIDATIONS DE BASE
            validateBasicRequirements(demande, result, age, categoryId);

            // 2. VALIDATION PAR PAYS ET NATIONALITÉ
            validateByCountryAndNationality(demande, result, age, categoryId);

            // 3. VALIDATION MÉDICALE STRICTE
            validateMedicalStrictRules(demande, result);

            // 4. VALIDATION PAR TYPE DE LICENCE COMPLEXE
            validateByLicenceTypeComplex(demande, result, categoryId, divisionId);

            // 5. VALIDATION PAR RÉGIME ET DIVISION
            validateByRegimeAndDivision(demande, result, categoryId, divisionId);

            // 6. VALIDATION DES QUOTAS COMPLEXES
            validateComplexQuotas(demande, result, categoryId, divisionId);

            // 7. VALIDATION DES PÉRIODES AUTORISÉES
            validateAuthorizedPeriods(demande, result);

            // 8. VALIDATION SPÉCIALE LIGUES PROFESSIONNELLES
            validateProfessionalLeagueRules(demande, result, categoryId, divisionId);

            // 9. VALIDATION DES CONTRATS SELON DIVISION
            validateContractsByDivision(demande, result, divisionId);

            // 10. VALIDATION JOUEURS ÉTRANGERS
            validateForeignPlayersQuotas(demande, result, categoryId, divisionId);

        } catch (Exception e) {
            result.addError("Erreur lors de la validation complète: " + e.getMessage());
        }

        return result;
    }

    // 1. VALIDATIONS DE BASE
    private void validateBasicRequirements(DemandePlayersDTO demande, ValidationResult result, Integer age, Long categoryId) {
        if (demande.getName() == null || demande.getName().trim().isEmpty()) {
            result.addError("Le nom est obligatoire");
        }
        if (demande.getLastName() == null || demande.getLastName().trim().isEmpty()) {
            result.addError("Le prénom est obligatoire");
        }
        if (demande.getDateOfBirth() == null) {
            result.addError("La date de naissance est obligatoire");
        }
        if (demande.getPaysId() == null) {
            result.addError("La nationalité est obligatoire");
        }
        if (demande.getTeamId() == null) {
            result.addError("L'équipe est obligatoire");
        }
        if (demande.getSeasonId() == null) {
            result.addError("La saison est obligatoire");
        }
        if (demande.getRegimeId() == null) {
            result.addError("Le régime est obligatoire");
        }
        if (demande.getTypeLicenceId() == null) {
            result.addError("Le type de licence est obligatoire");
        }
    }

    // 2. VALIDATION PAR PAYS ET NATIONALITÉ (copié de l'ancien code)
    private void validateByCountryAndNationality(DemandePlayersDTO demande, ValidationResult result, Integer age, Long categoryId) {
        if (demande.getPaysId() == null || age == null) return;

        // Joueur tunisien
        if (demande.getPaysId().equals(BigDecimal.valueOf(Constants.TUNISIE))) {
            // CIN obligatoire à partir de la catégorie cadets pour les tunisiens
            if (categoryId != null && categoryId >= Constants.CADETS && categoryId < 8L) {
                if (demande.getCinNumber() == null || demande.getCinNumber().trim().isEmpty()) {
                    result.addError("N° CIN obligatoire à partir de la catégorie cadets pour les joueurs tunisiens");
                }
                
                // Validation format CIN tunisien (8 chiffres)
                if (demande.getCinNumber() != null) {
                    if (!demande.getCinNumber().matches("\\d{8}")) {
                        result.addError("N° CIN tunisien invalide, il doit être composé de 8 chiffres");
                    }
                }
            }
        } else {
            // Joueur étranger - passport obligatoire
            if (categoryId != null && categoryId >= Constants.CADETS) {
                if (demande.getPassportNum() == null || demande.getPassportNum().trim().isEmpty()) {
                    result.addError("N° Passport obligatoire pour les joueurs étrangers à partir de la catégorie cadets");
                }
                
                // Validation longueur passport
                if (demande.getPassportNum() != null && demande.getPassportNum().length() > 20) {
                    result.addError("N° Passport invalide, maximum 20 caractères autorisés");
                }
            }
        }
    }

    // 3. VALIDATION MÉDICALE STRICTE
    private void validateMedicalStrictRules(DemandePlayersDTO demande, ValidationResult result) {
        if (demande.getDateConsultationDoctor() == null) {
            result.addError("Date de consultation médicale obligatoire");
        } else {
            LocalDate today = LocalDate.now();
            LocalDate consultationDate = demande.getDateConsultationDoctor();

            // Ne doit pas être antérieure à 1 mois
            if (consultationDate.isBefore(today.minusMonths(1))) {
                result.addError("Date de consultation ne doit pas être inférieure à la date d'envoi -1 mois");
            }

            // Ne doit pas être dans le futur
            if (consultationDate.isAfter(today)) {
                result.addError("Date de consultation ne doit pas être supérieure à la date d'envoi");
            }
        }

        // Médecin obligatoire
        if (demande.getNameDoctor() == null || demande.getNameDoctor().trim().isEmpty()) {
            result.addError("Nom du médecin obligatoire");
        }
        if (demande.getLastNameDoctor() == null || demande.getLastNameDoctor().trim().isEmpty()) {
            result.addError("Prénom du médecin obligatoire");
        }
    }

    // 4. VALIDATION PAR TYPE DE LICENCE COMPLEXE
    private void validateByLicenceTypeComplex(DemandePlayersDTO demande, ValidationResult result, Long categoryId, Long divisionId) {
        BigDecimal typeId = demande.getTypeLicenceId();
        if (typeId == null) return;

        // NOUVELLE LICENCE
        if (typeId.equals(BigDecimal.valueOf(Constants.NOUVELLE))) {
            validateNewLicence(demande, result, categoryId);
        }
        // RENOUVELLEMENT
        else if (typeId.equals(BigDecimal.valueOf(Constants.RENOUVELLEMENT))) {
            validateRenewal(demande, result, categoryId);
        }
        // TRANSFERT
        else if (typeId.equals(BigDecimal.valueOf(Constants.TRANSFERT))) {
            validateTransfer(demande, result, categoryId, divisionId);
        }
        // TRANSFERT LIBRE
        else if (typeId.equals(BigDecimal.valueOf(Constants.TRANSFERT_LIBRE))) {
            validateFreeTransfer(demande, result, categoryId);
        }
        // PRÊT
        else if (typeId.equals(BigDecimal.valueOf(Constants.PRET))) {
            validateLoan(demande, result, categoryId, divisionId);
        }
        // SURCLASSEMENT
        else if (typeId.equals(BigDecimal.valueOf(Constants.SURCLASSEMENT))) {
            validateSurclassement(demande, result, categoryId);
        }
    }

    // 5. VALIDATION PAR RÉGIME ET DIVISION
    private void validateByRegimeAndDivision(DemandePlayersDTO demande, ValidationResult result, Long categoryId, Long divisionId) {
        BigDecimal regimeId = demande.getRegimeId();
        if (regimeId == null) return;

        // Pour les professionnels
        if (!regimeId.equals(BigDecimal.valueOf(Constants.AMATEUR))) {
            
            // Contrat obligatoire selon type
            if (isContractRequired(demande.getTypeLicenceId())) {
                if (demande.getContractDate() == null) {
                    result.addError("Date de contrat obligatoire pour les joueurs professionnels de ce type");
                }
                if (demande.getContractDateFin() == null) {
                    result.addError("Date fin de contrat obligatoire pour les joueurs professionnels");
                }
            }

            // Numéro de maillot obligatoire pour Ligue I et II
            if (isProfessionalDivision(divisionId) && demande.getTshirtNum() == null) {
                result.addError("Numéro de maillot obligatoire pour les joueurs professionnels (Ligue I & Ligue II)");
            }

            // Validation date fin contrat (doit être 30/06)
            if (demande.getContractDateFin() != null) {
                LocalDate endDate = demande.getContractDateFin();
                if (endDate.getDayOfMonth() != 30 || endDate.getMonth() != Month.JUNE) {
                    result.addError("Date fin contrat doit être égale à la date de clôture de saison (30/06)");
                }
            }
        }
    }

    // 6. VALIDATION DES QUOTAS COMPLEXES
    private void validateComplexQuotas(DemandePlayersDTO demande, ValidationResult result, Long categoryId, Long divisionId) {
        if (demande.getTeamId() == null || demande.getSeasonId() == null) return;

        try {
            // Quota général par équipe
            Long totalPlayers = countTotalPlayersInTeam(demande.getTeamId(), demande.getSeasonId());
            if (totalPlayers >= Constants.MAX_PLAYERS_TEAM) {
                result.addError("Nombre maximum de joueurs atteint pour cette équipe (" + Constants.MAX_PLAYERS_TEAM + ")");
            }

            // Quotas par régime
            validateRegimeQuotas(demande, result, categoryId, divisionId);

            // Quotas par catégorie d'âge
            validateCategoryQuotas(demande, result, categoryId, divisionId);

            // Quotas par type de licence
            validateLicenceTypeQuotas(demande, result, categoryId, divisionId);

        } catch (Exception e) {
            result.addWarning("Impossible de vérifier certains quotas: " + e.getMessage());
        }
    }

    // 7. VALIDATION DES PÉRIODES AUTORISÉES
    private void validateAuthorizedPeriods(DemandePlayersDTO demande, ValidationResult result) {
        LocalDate today = LocalDate.now();
        Month currentMonth = today.getMonth();
        BigDecimal typeId = demande.getTypeLicenceId();
        BigDecimal regimeId = demande.getRegimeId();

        if (typeId == null || regimeId == null) return;

        // Période générale d'enregistrement (septembre à juin)
        if (currentMonth == Month.JULY || currentMonth == Month.AUGUST) {
            result.addWarning("Période de vacances - vérifiez les autorisations spéciales");
        }

        // Périodes spéciales pour transferts
        if (typeId.equals(BigDecimal.valueOf(Constants.TRANSFERT)) || 
            typeId.equals(BigDecimal.valueOf(Constants.TRANSFERT_LIBRE))) {
            
            // Période estivale (juin-septembre)
            boolean summerPeriod = (currentMonth.getValue() >= 6 && currentMonth.getValue() <= 9);
            // Période hivernale (janvier)
            boolean winterPeriod = (currentMonth == Month.JANUARY);
            
            if (!summerPeriod && !winterPeriod) {
                result.addWarning("Période de transfert inhabituelle - vérification des autorisations requise");
            }
        }

        // Validation spéciale pour prêts selon régime
        if (typeId.equals(BigDecimal.valueOf(Constants.PRET))) {
            if (regimeId.equals(BigDecimal.valueOf(Constants.PROFESSIONNEL))) {
                // Prêts professionnels plus restrictifs
                if (currentMonth.getValue() < 6 || currentMonth.getValue() > 9) {
                    result.addWarning("Période de prêt professionnel limitée (juin-septembre)");
                }
            }
        }
    }

    // 8. VALIDATION SPÉCIALE LIGUES PROFESSIONNELLES
    private void validateProfessionalLeagueRules(DemandePlayersDTO demande, ValidationResult result, Long categoryId, Long divisionId) {
        if (!isProfessionalDivision(divisionId)) return;

        // Validation pour Ligue I
        if (divisionId.equals(Constants.LIGUE_I)) {
            validateLigue1SpecialRules(demande, result, categoryId);
        }
        
        // Validation pour Ligue II
        if (divisionId.equals(Constants.LIGUE_II)) {
            validateLigue2SpecialRules(demande, result, categoryId);
        }
    }

    // 9. VALIDATION DES CONTRATS SELON DIVISION
    private void validateContractsByDivision(DemandePlayersDTO demande, ValidationResult result, Long divisionId) {
        if (demande.getContractDate() == null || demande.getContractDateFin() == null) return;

        // Calcul durée contrat
        long contractMonths = java.time.temporal.ChronoUnit.MONTHS.between(
            demande.getContractDate(), demande.getContractDateFin());

        // Validation durée selon division
        if (isProfessionalDivision(divisionId)) {
            if (contractMonths < 12) {
                result.addError("Durée de contrat trop courte pour cette division (minimum 1 an)");
            }
            if (contractMonths > 60) {
                result.addError("Durée de contrat trop longue (maximum 5 ans)");
            }
        }

        // Validation dates
        if (demande.getContractDate().isAfter(LocalDate.now())) {
            result.addError("Date de contrat ne doit pas être supérieure à la date d'envoi");
        }

        if (!demande.getContractDate().isBefore(demande.getContractDateFin())) {
            result.addError("Date fin de contrat doit être supérieure à la date début de contrat");
        }
    }

    // 10. VALIDATION JOUEURS ÉTRANGERS
    private void validateForeignPlayersQuotas(DemandePlayersDTO demande, ValidationResult result, Long categoryId, Long divisionId) {
        if (demande.getPaysId() == null || demande.getPaysId().equals(BigDecimal.valueOf(Constants.TUNISIE))) {
            return; // Joueur tunisien
        }

        try {
            Long foreignCount = countForeignPlayersInTeam(demande.getTeamId(), demande.getSeasonId(), divisionId);
            
            // Quotas selon division
            if (divisionId != null && divisionId.equals(Constants.LIGUE_I)) {
                if (foreignCount >= Constants.MAX_FOREIGN_LIGUE1) {
                    result.addError("Nombre maximum de joueurs étrangers atteint pour Ligue I (" + Constants.MAX_FOREIGN_LIGUE1 + ")");
                }
            } else if (divisionId != null && divisionId.equals(Constants.LIGUE_II)) {
                if (foreignCount >= Constants.MAX_FOREIGN_LIGUE2) {
                    result.addError("Nombre maximum de joueurs étrangers atteint pour Ligue II (" + Constants.MAX_FOREIGN_LIGUE2 + ")");
                }
            }

            // Quota spécial pour seniors étrangers en Ligue I
            if (divisionId != null && divisionId.equals(Constants.LIGUE_I) && 
                categoryId != null && categoryId.equals(Constants.SENIOR)) {
                
                Long foreignSeniors = countForeignSeniorsInTeam(demande.getTeamId(), demande.getSeasonId());
                if (foreignSeniors >= 2) { // Limite spéciale
                    result.addError("Nombre maximum de joueurs étrangers seniors atteint pour Ligue I (2)");
                }
            }

        } catch (Exception e) {
            result.addWarning("Impossible de vérifier les quotas de joueurs étrangers");
        }
    }

    // MÉTHODES DE VALIDATION SPÉCIALISÉES

    private void validateNewLicence(DemandePlayersDTO demande, ValidationResult result, Long categoryId) {
        // Vérifier qu'il n'y a pas déjà une demande pour ce joueur cette saison
        if (hasExistingDemandThisSeason(demande, categoryId)) {
            result.addError("Demande déjà envoyée pour ce joueur cette saison");
        }

        // Vérifier que le joueur n'existe pas déjà dans la base
        if (playerExistsInDatabase(demande, categoryId)) {
            result.addError("Impossible d'ajouter une nouvelle licence pour un joueur existant dans la base");
        }
    }

    private void validateRenewal(DemandePlayersDTO demande, ValidationResult result, Long categoryId) {
        if (demande.getLicenceNum() == null || demande.getLicenceNum().trim().isEmpty()) {
            result.addError("Numéro de licence obligatoire pour un renouvellement");
        }

        // Vérifier que le joueur existe dans l'équipe
        if (!playerExistsInTeam(demande)) {
            result.addError("Joueur non trouvé dans cette équipe pour renouvellement");
        }

        // Limiter à une seule demande de renouvellement par saison
        if (countRenewalDemandsThisSeason(demande) > 0) {
            result.addError("Demande de renouvellement déjà envoyée pour ce joueur cette saison");
        }
    }

    private void validateTransfer(DemandePlayersDTO demande, ValidationResult result, Long categoryId, Long divisionId) {
        if (demande.getLicenceNum() == null || demande.getLicenceNum().trim().isEmpty()) {
            result.addError("Numéro de licence obligatoire pour un transfert");
        }

        // Contrat obligatoire pour transferts professionnels
        if (!demande.getRegimeId().equals(BigDecimal.valueOf(Constants.AMATEUR))) {
            if (demande.getContractDate() == null) {
                result.addError("Date de contrat obligatoire pour un transfert professionnel");
            }
        }

        // Vérifier quotas transferts
        validateTransferQuotas(demande, result, categoryId, divisionId);
    }

    private void validateLoan(DemandePlayersDTO demande, ValidationResult result, Long categoryId, Long divisionId) {
        if (demande.getDureePret() == null) {
            result.addError("Durée de prêt obligatoire");
        } else {
            // Validation durée prêt
            int duree = demande.getDureePret().intValue();
            if (duree < 1 || duree > 2) {
                result.addError("Durée de prêt invalide (entre 1 et 2 ans autorisée)");
            }
        }

        // Vérifier que le joueur ne peut pas être prêté dans son propre club
        if (playerInSameTeam(demande)) {
            result.addError("Un joueur ne peut pas avoir une licence PRÊT dans son club d'origine");
        }

        // Quotas prêts selon division
        validateLoanQuotas(demande, result, categoryId, divisionId);
    }

    private void validateSurclassement(DemandePlayersDTO demande, ValidationResult result, Long categoryId) {
        if (categoryId == null) return;

        // Vérifier si surclassement autorisé pour cette catégorie
        if (!isSurclassementAllowed(categoryId)) {
            result.addError("Surclassement non autorisé pour cette catégorie d'âge");
        }

        // Maximum 2 surclassements par joueur
        if (countSurclassementDemands(demande) >= 2) {
            result.addError("Nombre maximum de demandes de surclassement atteint pour ce joueur (2)");
        }
    }

    // MÉTHODES UTILITAIRES ET DE CALCUL

    private Integer calculateAge(LocalDate birthDate) {
        if (birthDate == null) return null;
        return LocalDate.now().getYear() - birthDate.getYear();
    }

    private Long calculatePlayerCategory(LocalDate birthDate) {
        if (birthDate == null) return Constants.SENIOR;
        
        // Selon votre tableau de catégories
        if (birthDate.isAfter(LocalDate.of(2017, 1, 1)) && birthDate.isBefore(LocalDate.of(2019, 1, 1))) {
            return Constants.U7;
        }
        if (birthDate.isAfter(LocalDate.of(2015, 1, 1)) && birthDate.isBefore(LocalDate.of(2017, 1, 1))) {
            return Constants.U9;
        }
        if (birthDate.isAfter(LocalDate.of(2013, 1, 1)) && birthDate.isBefore(LocalDate.of(2015, 1, 1))) {
            return Constants.U11;
        }
        if (birthDate.isAfter(LocalDate.of(2011, 1, 1)) && birthDate.isBefore(LocalDate.of(2013, 1, 1))) {
            return Constants.U13;
        }
        if (birthDate.isAfter(LocalDate.of(2009, 1, 1)) && birthDate.isBefore(LocalDate.of(2011, 1, 1))) {
            return Constants.U15;
        }
        if (birthDate.isAfter(LocalDate.of(2007, 1, 1)) && birthDate.isBefore(LocalDate.of(2009, 1, 1))) {
            return Constants.U17;
        }
        if (birthDate.isAfter(LocalDate.of(2005, 1, 1)) && birthDate.isBefore(LocalDate.of(2007, 1, 1))) {
            return Constants.U19;
        }
        
        return Constants.SENIOR;
    }

    private String getCategoryLabel(Long categoryId) {
        if (categoryId == null) return "Non définie";
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

    private String getRegimeLabel(BigDecimal regimeId) {
        if (regimeId == null) return "Non défini";
        switch (regimeId.intValue()) {
            case 1: return "Amateur";
            case 2: return "Professionnel";
            case 3: return "Semi-Professionnel";
            case 4: return "Stagiaire";
            case 5: return "CP";
            default: return "Régime " + regimeId;
        }
    }

    // MÉTHODES DE COMPTAGE ET VÉRIFICATION

    private Long getTeamDivision(BigDecimal teamId) {
        try {
            String sql = "SELECT td.ct_division_id FROM ct_team_divisions td WHERE td.ct_team_id = ? ORDER BY td.ct_season_id DESC LIMIT 1";
            List<Long> results = jdbcTemplate.queryForList(sql, Long.class, teamId);
            return results.isEmpty() ? Constants.LIGUE_REG : results.get(0);
        } catch (Exception e) {
            return Constants.LIGUE_REG; // Division par défaut
        }
    }

    private Long countTotalPlayersInTeam(BigDecimal teamId, BigDecimal seasonId) {
        try {
            return demandePlayersService.countDemandes(
                teamId.longValue(), seasonId.longValue(), null, null, null, null, null);
        } catch (Exception e) {
            return 0L;
        }
    }

    private Long countForeignPlayersInTeam(BigDecimal teamId, BigDecimal seasonId, Long divisionId) {
        try {
            String sql = """
                SELECT COUNT(*) FROM ct_demande_players dp 
                WHERE dp.ct_team_id = ? AND dp.ct_season_id = ? 
                AND dp.cr_pays_id != ? 
                AND dp.ct_demande_statu_id IN (1, 8, 9)
                """;
            return jdbcTemplate.queryForObject(sql, Long.class, teamId, seasonId, Constants.TUNISIE);
        } catch (Exception e) {
            return 0L;
        }
    }

    private Long countForeignSeniorsInTeam(BigDecimal teamId, BigDecimal seasonId) {
        try {
            String sql = """
                SELECT COUNT(*) FROM ct_demande_players dp 
                WHERE dp.ct_team_id = ? AND dp.ct_season_id = ? 
                AND dp.cr_pays_id != ? 
                AND dp.ct_player_category_id = ?
                AND dp.ct_demande_statu_id IN (1, 8, 9)
                """;
            return jdbcTemplate.queryForObject(sql, Long.class, teamId, seasonId, Constants.TUNISIE, Constants.SENIOR);
        } catch (Exception e) {
            return 0L;
        }
    }

    private boolean isContractRequired(BigDecimal typeId) {
        return typeId != null && (
            typeId.equals(BigDecimal.valueOf(Constants.TRANSFERT)) ||
            typeId.equals(BigDecimal.valueOf(Constants.TRANSFERT_LIBRE)) ||
            typeId.equals(BigDecimal.valueOf(Constants.PRET))
        );
    }

    private boolean isProfessionalDivision(Long divisionId) {
        return divisionId != null && (
            divisionId.equals(Constants.LIGUE_I) || 
            divisionId.equals(Constants.LIGUE_II)
        );
    }

    private boolean isSurclassementAllowed(Long categoryId) {
        // Surclassement autorisé seulement pour certaines catégories
        return categoryId != null && categoryId >= Constants.U13 && categoryId <= Constants.U17;
    }

    // MÉTHODES DE VALIDATION PAR RÉGIME

    private void validateRegimeQuotas(DemandePlayersDTO demande, ValidationResult result, Long categoryId, Long divisionId) {
        BigDecimal regimeId = demande.getRegimeId();
        if (regimeId == null) return;

        try {
            // Quota professionnels
            if (regimeId.equals(BigDecimal.valueOf(Constants.PROFESSIONNEL))) {
                Long proCount = countProfessionalPlayers(demande.getTeamId(), demande.getSeasonId());
                if (proCount >= Constants.MAX_PRO_PLAYERS) {
                    result.addError("Nombre maximum de joueurs professionnels atteint (" + Constants.MAX_PRO_PLAYERS + ")");
                }
            }

            // Quota amateurs avec limite plus souple
            if (regimeId.equals(BigDecimal.valueOf(Constants.AMATEUR))) {
                Long amateurCount = countAmateurPlayers(demande.getTeamId(), demande.getSeasonId());
                if (amateurCount >= 60) { // Limite plus élevée pour amateurs
                    result.addWarning("Nombre élevé de joueurs amateurs dans l'équipe (" + amateurCount + ")");
                }
            }

        } catch (Exception e) {
            result.addWarning("Impossible de vérifier les quotas par régime");
        }
    }

    private void validateCategoryQuotas(DemandePlayersDTO demande, ValidationResult result, Long categoryId, Long divisionId) {
        if (categoryId == null) return;

        try {
            // Quotas spéciaux pour seniors en divisions professionnelles
            if (categoryId.equals(Constants.SENIOR) && isProfessionalDivision(divisionId)) {
                Long seniorCount = countSeniorPlayers(demande.getTeamId(), demande.getSeasonId());
                int maxSeniors = divisionId.equals(Constants.LIGUE_I) ? 20 : 18;
                
                if (seniorCount >= maxSeniors) {
                    result.addError("Nombre maximum de joueurs seniors atteint pour cette division (" + maxSeniors + ")");
                }
            }

            // Limites pour jeunes en professionnel
            if (categoryId < Constants.SENIOR && 
                demande.getRegimeId().equals(BigDecimal.valueOf(Constants.PROFESSIONNEL))) {
                
                Long youngProCount = countYoungProfessionals(demande.getTeamId(), demande.getSeasonId(), categoryId);
                if (youngProCount >= 8) {
                    result.addWarning("Nombre élevé de jeunes joueurs professionnels (" + youngProCount + ")");
                }
            }

        } catch (Exception e) {
            result.addWarning("Impossible de vérifier les quotas par catégorie");
        }
    }

    private void validateLicenceTypeQuotas(DemandePlayersDTO demande, ValidationResult result, Long categoryId, Long divisionId) {
        BigDecimal typeId = demande.getTypeLicenceId();
        if (typeId == null) return;

        try {
            // Quotas transferts
            if (typeId.equals(BigDecimal.valueOf(Constants.TRANSFERT)) || 
                typeId.equals(BigDecimal.valueOf(Constants.TRANSFERT_LIBRE))) {
                
                validateTransferQuotas(demande, result, categoryId, divisionId);
            }

            // Quotas prêts
            if (typeId.equals(BigDecimal.valueOf(Constants.PRET))) {
                validateLoanQuotas(demande, result, categoryId, divisionId);
            }

        } catch (Exception e) {
            result.addWarning("Impossible de vérifier les quotas par type de licence");
        }
    }

    // VALIDATIONS SPÉCIALES PAR LIGUE

    private void validateLigue1SpecialRules(DemandePlayersDTO demande, ValidationResult result, Long categoryId) {
        // Règles spéciales Ligue I
        
        // Transferts U21/U22 limités
        if (demande.getTypeLicenceId().equals(BigDecimal.valueOf(Constants.TRANSFERT)) && 
            categoryId != null && categoryId.equals(Constants.SENIOR)) {
            
            Integer age = calculateAge(demande.getDateOfBirth());
            if (age != null && age <= 22) {
                Long youngTransfers = countYoungTransfers(demande.getTeamId(), demande.getSeasonId(), 22);
                if (youngTransfers >= Constants.MAX_TRANSFERS_U22) {
                    result.addError("Nombre maximum de transferts U22 atteint pour Ligue I (" + Constants.MAX_TRANSFERS_U22 + ")");
                }
            }
        }

        // Contrats minimum 2 ans pour certains postes
        if (demande.getContractDate() != null && demande.getContractDateFin() != null) {
            long contractMonths = java.time.temporal.ChronoUnit.MONTHS.between(
                demande.getContractDate(), demande.getContractDateFin());
            
            if (contractMonths < 24 && categoryId != null && categoryId.equals(Constants.SENIOR)) {
                result.addWarning("Contrat court pour un senior en Ligue I (moins de 2 ans)");
            }
        }
    }

    private void validateLigue2SpecialRules(DemandePlayersDTO demande, ValidationResult result, Long categoryId) {
        // Règles spéciales Ligue II
        
        // Contrats courts autorisés mais limités
        if (demande.getContractDate() != null && demande.getContractDateFin() != null) {
            long contractMonths = java.time.temporal.ChronoUnit.MONTHS.between(
                demande.getContractDate(), demande.getContractDateFin());
            
            if (contractMonths <= 12) {
                Long shortContracts = countShortContracts(demande.getTeamId(), demande.getSeasonId());
                if (shortContracts >= 10) {
                    result.addError("Nombre maximum de contrats courts atteint pour Ligue II (10)");
                }
            }
        }
    }

    // MÉTHODES DE VÉRIFICATION D'EXISTENCE

    private boolean hasExistingDemandThisSeason(DemandePlayersDTO demande, Long categoryId) {
        try {
            String sql = """
                SELECT COUNT(*) FROM ct_demande_players 
                WHERE ct_season_id = ? AND ct_demande_statu_id IN (1, 8, 9)
                AND ((ct_player_category_id >= 4 AND cin_number = ?) 
                OR (ct_player_category_id < 4 AND name = ? AND last_name = ? AND date_of_birth = ?))
                """;
            
            Long count;
            if (categoryId != null && categoryId >= Constants.CADETS) {
                count = jdbcTemplate.queryForObject(sql, Long.class, 
                    demande.getSeasonId(), demande.getCinNumber(), null, null, null);
            } else {
                count = jdbcTemplate.queryForObject(sql, Long.class, 
                    demande.getSeasonId(), null, demande.getName(), demande.getLastName(), demande.getDateOfBirth());
            }
            
            return count != null && count > 0;
        } catch (Exception e) {
            return false;
        }
    }

    private boolean playerExistsInDatabase(DemandePlayersDTO demande, Long categoryId) {
        try {
            String sql = """
                SELECT COUNT(*) FROM ct_intervenants 
                WHERE ((ct_player_category_id >= 4 AND cin_number = ?) 
                OR (ct_player_category_id < 4 AND name = ? AND last_name = ? AND date_of_birth = ?))
                """;
            
            Long count;
            if (categoryId != null && categoryId >= Constants.CADETS) {
                count = jdbcTemplate.queryForObject(sql, Long.class, 
                    demande.getCinNumber(), null, null, null);
            } else {
                count = jdbcTemplate.queryForObject(sql, Long.class, 
                    null, demande.getName(), demande.getLastName(), demande.getDateOfBirth());
            }
            
            return count != null && count > 0;
        } catch (Exception e) {
            return false;
        }
    }

    private boolean playerExistsInTeam(DemandePlayersDTO demande) {
        try {
            String sql = """
                SELECT COUNT(*) FROM ct_team_intervenants ti
                INNER JOIN ct_intervenants i ON ti.ct_intervenant_id = i.ct_intervenant_id
                WHERE ti.ct_team_id = ? AND i.licence_num = ?
                """;
            
            Long count = jdbcTemplate.queryForObject(sql, Long.class, 
                demande.getTeamId(), demande.getLicenceNum());
            
            return count != null && count > 0;
        } catch (Exception e) {
            return false;
        }
    }

    private boolean playerInSameTeam(DemandePlayersDTO demande) {
        try {
            String sql = """
                SELECT COUNT(*) FROM ct_team_intervenants ti
                INNER JOIN ct_intervenants i ON ti.ct_intervenant_id = i.ct_intervenant_id
                WHERE ti.ct_team_id = ? AND i.licence_num = ? AND ti.ct_season_id = ?
                """;
            
            Long count = jdbcTemplate.queryForObject(sql, Long.class, 
                demande.getTeamId(), demande.getLicenceNum(), demande.getSeasonId());
            
            return count != null && count > 0;
        } catch (Exception e) {
            return false;
        }
    }

    // MÉTHODES DE COMPTAGE SPÉCIALISÉES

    private Long countProfessionalPlayers(BigDecimal teamId, BigDecimal seasonId) {
        try {
            return demandePlayersService.countDemandes(
                teamId.longValue(), seasonId.longValue(), null, null, null, Constants.PROFESSIONNEL, null);
        } catch (Exception e) {
            return 0L;
        }
    }

    private Long countAmateurPlayers(BigDecimal teamId, BigDecimal seasonId) {
        try {
            return demandePlayersService.countDemandes(
                teamId.longValue(), seasonId.longValue(), null, null, null, Constants.AMATEUR, null);
        } catch (Exception e) {
            return 0L;
        }
    }

    private Long countSeniorPlayers(BigDecimal teamId, BigDecimal seasonId) {
        try {
            String sql = """
                SELECT COUNT(*) FROM ct_demande_players 
                WHERE ct_team_id = ? AND ct_season_id = ? 
                AND ct_player_category_id = ? 
                AND ct_demande_statu_id IN (1, 8, 9)
                """;
            return jdbcTemplate.queryForObject(sql, Long.class, teamId, seasonId, Constants.SENIOR);
        } catch (Exception e) {
            return 0L;
        }
    }

    private Long countYoungProfessionals(BigDecimal teamId, BigDecimal seasonId, Long maxCategoryId) {
        try {
            String sql = """
                SELECT COUNT(*) FROM ct_demande_players 
                WHERE ct_team_id = ? AND ct_season_id = ? 
                AND ct_player_category_id <= ? 
                AND ct_regime_id = ?
                AND ct_demande_statu_id IN (1, 8, 9)
                """;
            return jdbcTemplate.queryForObject(sql, Long.class, 
                teamId, seasonId, maxCategoryId, Constants.PROFESSIONNEL);
        } catch (Exception e) {
            return 0L;
        }
    }

    private Long countYoungTransfers(BigDecimal teamId, BigDecimal seasonId, Integer maxAge) {
        try {
            String sql = """
                SELECT COUNT(*) FROM ct_demande_players 
                WHERE ct_team_id = ? AND ct_season_id = ? 
                AND ct_type_licence_id IN (?, ?)
                AND YEAR(CURDATE()) - YEAR(date_of_birth) <= ?
                AND ct_demande_statu_id IN (1, 8, 9)
                """;
            return jdbcTemplate.queryForObject(sql, Long.class, 
                teamId, seasonId, Constants.TRANSFERT, Constants.TRANSFERT_LIBRE, maxAge);
        } catch (Exception e) {
            return 0L;
        }
    }

    private Long countShortContracts(BigDecimal teamId, BigDecimal seasonId) {
        try {
            String sql = """
                SELECT COUNT(*) FROM ct_demande_players 
                WHERE ct_team_id = ? AND ct_season_id = ? 
                AND TIMESTAMPDIFF(MONTH, contract_date, contract_date_fin) <= 12
                AND ct_demande_statu_id IN (1, 8, 9)
                """;
            return jdbcTemplate.queryForObject(sql, Long.class, teamId, seasonId);
        } catch (Exception e) {
            return 0L;
        }
    }

    private Long countRenewalDemandsThisSeason(DemandePlayersDTO demande) {
        try {
            String sql = """
                SELECT COUNT(*) FROM ct_demande_players 
                WHERE ct_season_id = ? AND licence_num = ? 
                AND ct_type_licence_id = ?
                AND ct_demande_statu_id IN (1, 8, 9)
                """;
            return jdbcTemplate.queryForObject(sql, Long.class, 
                demande.getSeasonId(), demande.getLicenceNum(), Constants.RENOUVELLEMENT);
        } catch (Exception e) {
            return 0L;
        }
    }

    private Long countSurclassementDemands(DemandePlayersDTO demande) {
        try {
            String sql = """
                SELECT COUNT(*) FROM ct_demande_players 
                WHERE cin_number = ? AND ct_type_licence_id = ?
                AND ct_demande_statu_id IN (1, 8, 9)
                """;
            return jdbcTemplate.queryForObject(sql, Long.class, 
                demande.getCinNumber(), Constants.SURCLASSEMENT);
        } catch (Exception e) {
            return 0L;
        }
    }

    private void validateTransferQuotas(DemandePlayersDTO demande, ValidationResult result, Long categoryId, Long divisionId) {
        try {
            Long transferCount = countTransfersInTeam(demande.getTeamId(), demande.getSeasonId());
            
            // Limites selon division
            int maxTransfers = isProfessionalDivision(divisionId) ? 8 : 12;
            
            if (transferCount >= maxTransfers) {
                result.addError("Nombre maximum de transferts atteint pour cette division (" + maxTransfers + ")");
            }
        } catch (Exception e) {
            result.addWarning("Impossible de vérifier les quotas de transferts");
        }
    }

    private void validateLoanQuotas(DemandePlayersDTO demande, ValidationResult result, Long categoryId, Long divisionId) {
        try {
            Long loanCount = countLoansInTeam(demande.getTeamId(), demande.getSeasonId());
            
            // Limites selon régime et division
            int maxLoans = Constants.MAX_LOAN_PRO;
            if (demande.getRegimeId().equals(BigDecimal.valueOf(Constants.AMATEUR))) {
                maxLoans = 8; // Plus souple pour amateurs
            }
            
            if (loanCount >= maxLoans) {
                result.addError("Nombre maximum de prêts atteint (" + maxLoans + ")");
            }
        } catch (Exception e) {
            result.addWarning("Impossible de vérifier les quotas de prêts");
        }
    }

    private Long countTransfersInTeam(BigDecimal teamId, BigDecimal seasonId) {
        try {
            String sql = """
                SELECT COUNT(*) FROM ct_demande_players 
                WHERE ct_team_id = ? AND ct_season_id = ? 
                AND ct_type_licence_id IN (?, ?)
                AND ct_demande_statu_id IN (1, 8, 9)
                """;
            return jdbcTemplate.queryForObject(sql, Long.class, 
                teamId, seasonId, Constants.TRANSFERT, Constants.TRANSFERT_LIBRE);
        } catch (Exception e) {
            return 0L;
        }
    }

    private Long countLoansInTeam(BigDecimal teamId, BigDecimal seasonId) {
        try {
            String sql = """
                SELECT COUNT(*) FROM ct_demande_players 
                WHERE ct_team_id = ? AND ct_season_id = ? 
                AND ct_type_licence_id = ?
                AND ct_demande_statu_id IN (1, 8, 9)
                """;
            return jdbcTemplate.queryForObject(sql, Long.class, teamId, seasonId, Constants.PRET);
        } catch (Exception e) {
            return 0L;
        }
    }

    private void validateFreeTransfer(DemandePlayersDTO demande, ValidationResult result, Long categoryId) {
        // Validation spécifique aux transferts libres
        if (demande.getLicenceNum() == null || demande.getLicenceNum().trim().isEmpty()) {
            result.addError("Numéro de licence obligatoire pour un transfert libre");
        }
        
        // Vérifier que le contrat précédent est bien terminé
        // TODO: Implémenter selon votre logique métier
    }
}