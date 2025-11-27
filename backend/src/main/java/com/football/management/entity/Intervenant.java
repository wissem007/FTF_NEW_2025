package com.football.management.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "ct_intervenants", schema = "sss_competition_db")
public class Intervenant {
    
    @Id
    @Column(name = "intervenant_id", columnDefinition = "NUMERIC")
    private BigDecimal intervenantId;
    
    @Column(name = "name")
    private String name;
    
    @Column(name = "last_name")
    private String lastName;
    
    @Column(name = "licence_num")
    private String licenceNum;
    
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    
    @Column(name = "intervenant_type_id", columnDefinition = "NUMERIC")
    private BigDecimal intervenantTypeId;
    
    @Column(name = "pays_id", columnDefinition = "NUMERIC")
    private BigDecimal paysId;
    
    @Column(name = "place_of_birth")
    private String placeOfBirth;
    
    // Constructeurs
    public Intervenant() {}
    
    // Getters et Setters
    public BigDecimal getIntervenantId() { return intervenantId; }
    public void setIntervenantId(BigDecimal intervenantId) { this.intervenantId = intervenantId; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getLicenceNum() { return licenceNum; }
    public void setLicenceNum(String licenceNum) { this.licenceNum = licenceNum; }
    
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    
    public BigDecimal getIntervenantTypeId() { return intervenantTypeId; }
    public void setIntervenantTypeId(BigDecimal intervenantTypeId) { this.intervenantTypeId = intervenantTypeId; }
    
    public BigDecimal getPaysId() { return paysId; }
    public void setPaysId(BigDecimal paysId) { this.paysId = paysId; }
    
    public String getPlaceOfBirth() { return placeOfBirth; }
    public void setPlaceOfBirth(String placeOfBirth) { this.placeOfBirth = placeOfBirth; }
}