package com.football.management.dto;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

public class DashboardStatsDTO {
    
    private Long totalDemandes;
    private Long demandesEnAttente;
    private Long demandesValidees;
    private Long demandesRejetees;
    private Long demandesImprimees;
    
    private Map<String, Long> demandesByStatus;
    private Map<String, Long> demandesByCategory;
    private Map<String, Long> demandesBySeason;
    private Map<String, Long> demandesByTeam;
    
    private Double tauxValidation;
    private Double tauxRejet;
    private Long demandesThisMonth;
    private Long demandesThisWeek;
    
    public DashboardStatsDTO() {
        this.demandesByStatus = new HashMap<>();
        this.demandesByCategory = new HashMap<>();
        this.demandesBySeason = new HashMap<>();
        this.demandesByTeam = new HashMap<>();
    }
    
    // Getters et Setters
    public Long getTotalDemandes() {
        return totalDemandes;
    }
    
    public void setTotalDemandes(Long totalDemandes) {
        this.totalDemandes = totalDemandes;
    }
    
    public Long getDemandesEnAttente() {
        return demandesEnAttente;
    }
    
    public void setDemandesEnAttente(Long demandesEnAttente) {
        this.demandesEnAttente = demandesEnAttente;
    }
    
    public Long getDemandesValidees() {
        return demandesValidees;
    }
    
    public void setDemandesValidees(Long demandesValidees) {
        this.demandesValidees = demandesValidees;
    }
    
    public Long getDemandesRejetees() {
        return demandesRejetees;
    }
    
    public void setDemandesRejetees(Long demandesRejetees) {
        this.demandesRejetees = demandesRejetees;
    }
    
    public Long getDemandesImprimees() {
        return demandesImprimees;
    }
    
    public void setDemandesImprimees(Long demandesImprimees) {
        this.demandesImprimees = demandesImprimees;
    }
    
    public Map<String, Long> getDemandesByStatus() {
        return demandesByStatus;
    }
    
    public void setDemandesByStatus(Map<String, Long> demandesByStatus) {
        this.demandesByStatus = demandesByStatus;
    }
    
    public Map<String, Long> getDemandesByCategory() {
        return demandesByCategory;
    }
    
    public void setDemandesByCategory(Map<String, Long> demandesByCategory) {
        this.demandesByCategory = demandesByCategory;
    }
    
    public Map<String, Long> getDemandesBySeason() {
        return demandesBySeason;
    }
    
    public void setDemandesBySeason(Map<String, Long> demandesBySeason) {
        this.demandesBySeason = demandesBySeason;
    }
    
    public Map<String, Long> getDemandesByTeam() {
        return demandesByTeam;
    }
    
    public void setDemandesByTeam(Map<String, Long> demandesByTeam) {
        this.demandesByTeam = demandesByTeam;
    }
    
    public Double getTauxValidation() {
        return tauxValidation;
    }
    
    public void setTauxValidation(Double tauxValidation) {
        this.tauxValidation = tauxValidation;
    }
    
    public Double getTauxRejet() {
        return tauxRejet;
    }
    
    public void setTauxRejet(Double tauxRejet) {
        this.tauxRejet = tauxRejet;
    }
    
    public Long getDemandesThisMonth() {
        return demandesThisMonth;
    }
    
    public void setDemandesThisMonth(Long demandesThisMonth) {
        this.demandesThisMonth = demandesThisMonth;
    }
    
    public Long getDemandesThisWeek() {
        return demandesThisWeek;
    }
    
    public void setDemandesThisWeek(Long demandesThisWeek) {
        this.demandesThisWeek = demandesThisWeek;
    }
}