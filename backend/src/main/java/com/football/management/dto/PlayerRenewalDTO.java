package com.football.management.dto;

import java.time.LocalDate;
import java.math.BigDecimal;

public class PlayerRenewalDTO {
    private BigDecimal id;
    private String nom;
    private String prenom;
    private String licenceNum;
    private LocalDate dateNaissance;
    
    public PlayerRenewalDTO() {}
    
    public PlayerRenewalDTO(BigDecimal id, String nom, String prenom, String licenceNum, LocalDate dateNaissance) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.licenceNum = licenceNum;
        this.dateNaissance = dateNaissance;
    }
    
    // Getters et Setters
    public BigDecimal getId() { return id; }
    public void setId(BigDecimal id) { this.id = id; }
    
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    
    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }
    
    public String getLicenceNum() { return licenceNum; }
    public void setLicenceNum(String licenceNum) { this.licenceNum = licenceNum; }
    
    public LocalDate getDateNaissance() { return dateNaissance; }
    public void setDateNaissance(LocalDate dateNaissance) { this.dateNaissance = dateNaissance; }
}