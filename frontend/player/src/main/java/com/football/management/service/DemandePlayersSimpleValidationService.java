package com.football.management.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.football.management.dto.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class DemandePlayersSimpleValidationService {

    @Autowired
    private DemandePlayersService demandePlayersService;

    // Classe pour stocker les résultats
    public static class ValidationResult {
        private boolean valid = true;
        private List<String> errors = new ArrayList<>();
        private List<String> warnings = new ArrayList<>();
        private String playerCategory;
        private String regime;

        // Ajouter une erreur
        public void addError(String error) {
            this.errors.add(error);
            this.valid = false;
        }

        // Ajouter un avertissement
        public void addWarning(String warning) {
            this.warnings.add(warning);
        }

        // Méthodes pour récupérer les résultats
        public boolean isValid() { return valid; }
        public List<String> getErrors() { return errors; }
        public List<String> getWarnings() { return warnings; }
        public String getPlayerCategory() { return playerCategory; }
        public String getRegime() { return regime; }
        
        // Méthodes pour définir les infos
        public void setPlayerCategory(String playerCategory) { this.playerCategory = playerCategory; }
        public void setRegime(String regime) { this.regime = regime; }
    }

    // MÉTHODE PRINCIPALE DE VALIDATION
    public ValidationResult validateDemande(DemandePlayersDTO demande) {
        ValidationResult result = new ValidationResult();

        // 1. Vérifier les champs obligatoires
        checkRequiredFields(demande, result);
        
        // 2. Vérifier l'âge et le CIN
        checkAgeAndCin(demande, result);
        
        // 3. Vérifier les informations médicales
        checkMedicalInfo(demande, result);
        
        // 4. Vérifier selon le type de licence
        checkLicenceType(demande, result);
        
        // 5. Vérifier les quotas
        checkQuotas(demande, result);

        // 6. Ajouter les informations du joueur
        addPlayerInfo(demande, result);

        return result;
    }

    // 1. VÉRIFIER LES CHAMPS OBLIGATOIRES
    private void checkRequiredFields(DemandePlayersDTO demande, ValidationResult result) {
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
    }

    // 2. VÉRIFIER L'ÂGE ET LE CIN
    private void checkAgeAndCin(DemandePlayersDTO demande, ValidationResult result) {
        if (demande.getDateOfBirth() == null) return;

        // Calculer l'âge
        int age = LocalDate.now().getYear() - demande.getDateOfBirth().getYear();
        
        // Si le joueur est majeur, CIN obligatoire
        if (age >= 18) {
            if (demande.getCinNumber() == null || demande.getCinNumber().trim().isEmpty()) {
                result.addError("Numéro CIN obligatoire pour les joueurs majeurs");
            }
            
            // Vérifier le format du CIN tunisien (8 chiffres)
            if (demande.getCinNumber() != null && 
                demande.getPaysId() != null && 
                demande.getPaysId().equals(BigDecimal.valueOf(216))) { // Tunisie
                
                if (!demande.getCinNumber().matches("\\d{8}")) {
                    result.addError("N° CIN tunisien doit contenir exactement 8 chiffres");
                }
            }
        }
    }

    // 3. VÉRIFIER LES INFORMATIONS MÉDICALES
    private void checkMedicalInfo(DemandePlayersDTO demande, ValidationResult result) {
        // Date de consultation obligatoire
        if (demande.getDateConsultationDoctor() == null) {
            result.addError("Date de consultation médicale obligatoire");
        } else {
            LocalDate today = LocalDate.now();
            LocalDate consultationDate = demande.getDateConsultationDoctor();
            
            // La consultation ne doit pas être trop ancienne (6 mois max)
            if (consultationDate.isBefore(today.minusMonths(6))) {
                result.addError("Consultation médicale trop ancienne (plus de 6 mois)");
            }
            
            // La consultation ne peut pas être dans le futur
            if (consultationDate.isAfter(today)) {
                result.addError("Date de consultation ne peut pas être dans le futur");
            }
            
            // Avertissement si plus d'un mois
            if (consultationDate.isBefore(today.minusMonths(1))) {
                result.addWarning("Consultation médicale ancienne (plus d'1 mois)");
            }
        }
        
        // Nom du médecin obligatoire
        if (demande.getNameDoctor() == null || demande.getNameDoctor().trim().isEmpty()) {
            result.addError("Nom du médecin obligatoire");
        }
    }

    // 4. VÉRIFIER SELON LE TYPE DE LICENCE
    private void checkLicenceType(DemandePlayersDTO demande, ValidationResult result) {
        if (demande.getTypeLicenceId() == null) {
            result.addError("Type de licence obligatoire");
            return;
        }

        BigDecimal typeId = demande.getTypeLicenceId();
        
        // RENOUVELLEMENT (type 2)
        if (typeId.equals(BigDecimal.valueOf(2))) {
            if (demande.getLicenceNum() == null || demande.getLicenceNum().trim().isEmpty()) {
                result.addError("Numéro de licence obligatoire pour un renouvellement");
            }
        }
        
        // TRANSFERT (type 3)
        if (typeId.equals(BigDecimal.valueOf(3))) {
            if (demande.getLicenceNum() == null || demande.getLicenceNum().trim().isEmpty()) {
                result.addError("Numéro de licence obligatoire pour un transfert");
            }
            // Pour les professionnels, contrat obligatoire
            if (demande.getRegimeId() != null && 
                !demande.getRegimeId().equals(BigDecimal.valueOf(1))) { // Pas amateur
                if (demande.getContractDate() == null) {
                    result.addError("Date de contrat obligatoire pour un transfert professionnel");
                }
            }
        }
        
        // PRÊT (type 5)
        if (typeId.equals(BigDecimal.valueOf(5))) {
            if (demande.getDureePret() == null) {
                result.addError("Durée de prêt obligatoire");
            }
            if (demande.getContractDate() == null) {
                result.addError("Date de contrat obligatoire pour un prêt");
            }
        }
    }

    // 5. VÉRIFIER LES QUOTAS
    private void checkQuotas(DemandePlayersDTO demande, ValidationResult result) {
        if (demande.getTeamId() == null || demande.getSeasonId() == null) return;

        try {
            // Compter le nombre de joueurs dans l'équipe cette saison
            Long totalPlayers = demandePlayersService.countDemandes(
                demande.getTeamId().longValue(), 
                demande.getSeasonId().longValue(), 
                null, null, null, null, null
            );
            
            // Vérifier les limites
            if (totalPlayers >= 80) {
                result.addError("Nombre maximum de joueurs atteint pour cette équipe (80)");
            } else if (totalPlayers >= 50) {
                result.addWarning("Attention: équipe proche de la limite (50+ joueurs)");
            }
            
            // Pour les professionnels, limite plus stricte
            if (demande.getRegimeId() != null && 
                demande.getRegimeId().equals(BigDecimal.valueOf(2))) { // Professionnel
                
                Long proPlayers = demandePlayersService.countDemandes(
                    demande.getTeamId().longValue(), 
                    demande.getSeasonId().longValue(), 
                    null, null, null, 2L, null // Seulement professionnels
                );
                
                if (proPlayers >= 25) {
                    result.addError("Nombre maximum de joueurs professionnels atteint (25)");
                }
            }
            
        } catch (Exception e) {
            result.addWarning("Impossible de vérifier les quotas d'équipe");
        }
    }

    // 6. AJOUTER LES INFORMATIONS DU JOUEUR
    private void addPlayerInfo(DemandePlayersDTO demande, ValidationResult result) {
        // Calculer la catégorie selon l'âge
        String category = calculateCategory(demande.getDateOfBirth());
        result.setPlayerCategory(category);
        
        // Déterminer le régime
        String regime = getRegimeLabel(demande.getRegimeId());
        result.setRegime(regime);
    }

    // CALCULER LA CATÉGORIE SELON L'ÂGE
    private String calculateCategory(LocalDate birthDate) {
        if (birthDate == null) return "Senior";
        
        int age = LocalDate.now().getYear() - birthDate.getYear();
        
        if (age <= 7) return "U7";
        if (age <= 9) return "U9";
        if (age <= 11) return "U11";
        if (age <= 13) return "U13";
        if (age <= 15) return "U15";
        if (age <= 17) return "U17";
        if (age <= 19) return "U19";
        return "Senior";
    }

    // OBTENIR LE LABEL DU RÉGIME
    private String getRegimeLabel(BigDecimal regimeId) {
        if (regimeId == null) return "Non défini";
        
        switch (regimeId.intValue()) {
            case 1: return "Amateur";
            case 2: return "Professionnel";
            case 3: return "Semi-Professionnel";
            case 4: return "Stagiaire";
            default: return "Régime " + regimeId;
        }
    }
}