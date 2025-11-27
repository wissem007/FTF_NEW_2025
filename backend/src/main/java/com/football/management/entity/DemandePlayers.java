package com.football.management.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity
@Table(name = "ct_demandes", schema = "sss_competition_db")
public class DemandePlayers {

    @Id
    @Column(name = "ct_demande_id", columnDefinition = "NUMERIC")
    private BigDecimal demandeId;

    @Column(name = "ct_demande_statu_id", columnDefinition = "NUMERIC")
    private BigDecimal demandeStatuId;

    @Column(name = "cr_etat_civil_id", columnDefinition = "NUMERIC")
    private BigDecimal etatCivilId;

    @Column(name = "alias")
    private String alias;
    
    @Column(name = "ct_intervenant_id")
    private BigDecimal intervenantId;

    @NotBlank
    @Column(name = "last_name")
    private String lastName;

    @NotBlank
    @Column(name = "name")
    private String name;

    @Column(name = "cr_pays_id", columnDefinition = "NUMERIC")
    private BigDecimal paysId;

    // Ajoutez cette relation ManyToOne
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cr_pays_id", referencedColumnName = "cr_pays_id", insertable = false, updatable = false)
    private Pays pays;
    
    
    @Column(name = "ct_team_id", columnDefinition = "NUMERIC")
    private BigDecimal teamId;

    @Column(name = "ct_season_id", columnDefinition = "NUMERIC")
    private BigDecimal seasonId;

    @Column(name = "ct_player_category_id", columnDefinition = "NUMERIC")
    private BigDecimal playerCategoryId;

    @Column(name = "ct_regime_id", columnDefinition = "NUMERIC")
    private BigDecimal regimeId;

    @Column(name = "ct_type_licence_id", columnDefinition = "NUMERIC")
    private BigDecimal typeLicenceId;

    @Column(name = "licence_num")
    private String licenceNum;

    @Column(name = "cin_number")
    private String cinNumber;

    @Column(name = "cin_number_parent")
    private String cinNumberParent;

    @Column(name = "passport_num")
    private String passportNum;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    
    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "contract_date")
    private LocalDate contractDate;

    public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	@Column(name = "contract_date_fin")
    private LocalDate contractDateFin;

    @Column(name = "duree_pret", columnDefinition = "NUMERIC")
    private BigDecimal dureePret;

    @Column(name = "contrat_status")
    private String contratStatus;

    @Column(name = "is_demission")
    private Boolean isDemission;

    @Column(name = "team_saison1_id", columnDefinition = "NUMERIC")
    private BigDecimal saison1Id;

    @Column(name = "ct_team_coor_bancaire_id", columnDefinition = "NUMERIC")
    private BigDecimal teamCoorBancaireId;

    @Column(name = "ct_team_saison1_coor_bancaire_id", columnDefinition = "NUMERIC")
    private BigDecimal teamSaison1CoorBancaireId;

    @Column(name = "ct_player_position_id", columnDefinition = "NUMERIC")
    private BigDecimal positionId;

    @Column(name = "ct_player_feet_id", columnDefinition = "NUMERIC")
    private BigDecimal feetId;

    @Column(name = "ct_type_competition_id", columnDefinition = "NUMERIC")
    private BigDecimal typeCompetitionId;

    @Column(name = "ct_intervenant_type_id")
    private BigDecimal ctIntervenantTypeId;

    // Champs supplémentaires
    @Column(name = "place_of_birth")
    private String placeOfBirth;

    @Column(name = "licence_num_old")
    private String licenceNumOld;

    @Column(name = "team_origine_id", columnDefinition = "NUMERIC")
    private BigDecimal teamOrigineId;

    @Column(name = "team_origine_libelle")
    private String teamOrigineLibelle;

    @Column(name = "team_saison1_libelle")
    private String teamSaison1Libelle;

    @Column(name = "num_year_contract", columnDefinition = "NUMERIC")
    private BigDecimal numYearContract;

    @Column(name = "name_doctor")
    private String nameDoctor;

    @Column(name = "last_name_doctor")
    private String lastNameDoctor;

    @Column(name = "weight", columnDefinition = "NUMERIC")
    private BigDecimal weight;

    @Column(name = "height", columnDefinition = "NUMERIC")
    private BigDecimal height;

    @Column(name = "tshirt_num", columnDefinition = "NUMERIC")
    private BigDecimal tshirtNum;

    @Column(name = "is_qualified")
    private Boolean isQualified;

    @Column(name = "is_on_classification")
    private Boolean isOnClassification;

    @Column(name = "date_consultation_doctor")
    private LocalDate dateConsultationDoctor;

    @Column(name = "ct_commission_id", columnDefinition = "NUMERIC")
    private BigDecimal commissionId;

    @Column(name = "date_commission")
    private LocalDate dateCommission;

    @Column(name = "date_enregistrement")
    private LocalDate dateEnregistrement;

    @Column(name = "membership_date")
    private LocalDate membershipDate;

    @Column(name = "date_impression")
    private LocalDate dateImpression;

    @Column(name = "ct_motifs_rejet_demende_id", columnDefinition = "NUMERIC")
    private BigDecimal motifsRejetDemendeId;

    @Column(name = "is_rejete")
    private Boolean isRejete;
    
    
    
    
    

    // Constructeurs
    public DemandePlayers() {}

    public DemandePlayers(String name, String lastName) {
        this.name = name;
        this.lastName = lastName;
    }

    // Getters et Setters pour BigDecimal
    public BigDecimal getDemandeId() { return demandeId; }
    public void setDemandeId(BigDecimal demandeId) { this.demandeId = demandeId; }

    public BigDecimal getDemandeStatuId() { return demandeStatuId; }
    public void setDemandeStatuId(BigDecimal demandeStatuId) { this.demandeStatuId = demandeStatuId; }

    public BigDecimal getEtatCivilId() { return etatCivilId; }
    public void setEtatCivilId(BigDecimal etatCivilId) { this.etatCivilId = etatCivilId; }

    public String getAlias() { return alias; }
    public void setAlias(String alias) { this.alias = alias; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getPaysId() { return paysId; }
    public void setPaysId(BigDecimal paysId) { this.paysId = paysId; }

    public BigDecimal getTeamId() { return teamId; }
    public void setTeamId(BigDecimal teamId) { this.teamId = teamId; }

    public BigDecimal getSeasonId() { return seasonId; }
    public void setSeasonId(BigDecimal seasonId) { this.seasonId = seasonId; }

    public BigDecimal getPlayerCategoryId() { return playerCategoryId; }
    public void setPlayerCategoryId(BigDecimal playerCategoryId) { this.playerCategoryId = playerCategoryId; }

    public BigDecimal getRegimeId() { return regimeId; }
    public void setRegimeId(BigDecimal regimeId) { this.regimeId = regimeId; }

    public BigDecimal getTypeLicenceId() { return typeLicenceId; }
    public void setTypeLicenceId(BigDecimal typeLicenceId) { this.typeLicenceId = typeLicenceId; }

    public String getLicenceNum() { return licenceNum; }
    public void setLicenceNum(String licenceNum) { this.licenceNum = licenceNum; }

    public String getCinNumber() { return cinNumber; }
    public void setCinNumber(String cinNumber) { this.cinNumber = cinNumber; }

    public String getCinNumberParent() { return cinNumberParent; }
    public void setCinNumberParent(String cinNumberParent) { this.cinNumberParent = cinNumberParent; }

    public String getPassportNum() { return passportNum; }
    public void setPassportNum(String passportNum) { this.passportNum = passportNum; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public LocalDate getContractDate() { return contractDate; }
    public void setContractDate(LocalDate contractDate) { this.contractDate = contractDate; }

    public LocalDate getContractDateFin() { return contractDateFin; }
    public void setContractDateFin(LocalDate contractDateFin) { this.contractDateFin = contractDateFin; }

    public BigDecimal getDureePret() { return dureePret; }
    public void setDureePret(BigDecimal dureePret) { this.dureePret = dureePret; }

    public String getContratStatus() { return contratStatus; }
    public void setContratStatus(String contratStatus) { this.contratStatus = contratStatus; }

    public Boolean getIsDemission() { return isDemission; }
    public void setIsDemission(Boolean isDemission) { this.isDemission = isDemission; }

    public BigDecimal getSaison1Id() { return saison1Id; }
    public void setSaison1Id(BigDecimal saison1Id) { this.saison1Id = saison1Id; }

    public BigDecimal getTeamCoorBancaireId() { return teamCoorBancaireId; }
    public void setTeamCoorBancaireId(BigDecimal teamCoorBancaireId) { this.teamCoorBancaireId = teamCoorBancaireId; }

    public BigDecimal getTeamSaison1CoorBancaireId() { return teamSaison1CoorBancaireId; }
    public void setTeamSaison1CoorBancaireId(BigDecimal teamSaison1CoorBancaireId) { this.teamSaison1CoorBancaireId = teamSaison1CoorBancaireId; }

    public BigDecimal getPositionId() { return positionId; }
    public void setPositionId(BigDecimal positionId) { this.positionId = positionId; }

    public BigDecimal getFeetId() { return feetId; }
    public void setFeetId(BigDecimal feetId) { this.feetId = feetId; }

    public BigDecimal getTypeCompetitionId() { return typeCompetitionId; }
    public void setTypeCompetitionId(BigDecimal typeCompetitionId) { this.typeCompetitionId = typeCompetitionId; }

    public BigDecimal getCtIntervenantTypeId() { return ctIntervenantTypeId; }
    public void setCtIntervenantTypeId(BigDecimal ctIntervenantTypeId) { this.ctIntervenantTypeId = ctIntervenantTypeId; }

    // Getters/Setters pour les nouveaux champs
    public String getPlaceOfBirth() { return placeOfBirth; }
    public void setPlaceOfBirth(String placeOfBirth) { this.placeOfBirth = placeOfBirth; }

    public BigDecimal getWeight() { return weight; }
    public void setWeight(BigDecimal weight) { this.weight = weight; }

    public BigDecimal getHeight() { return height; }
    public void setHeight(BigDecimal height) { this.height = height; }

    public BigDecimal getCommissionId() { return commissionId; }
    public void setCommissionId(BigDecimal commissionId) { this.commissionId = commissionId; }

    public LocalDate getDateEnregistrement() { return dateEnregistrement; }
    public void setDateEnregistrement(LocalDate dateEnregistrement) { this.dateEnregistrement = dateEnregistrement; }
    
    
    
    
 // Getters et Setters pour les champs doctor et tshirt
    public String getNameDoctor() {
        return nameDoctor;
    }

    public void setNameDoctor(String nameDoctor) {
        this.nameDoctor = nameDoctor;
    }

    public String getLastNameDoctor() {
        return lastNameDoctor;
    }

    public void setLastNameDoctor(String lastNameDoctor) {
        this.lastNameDoctor = lastNameDoctor;
    }

    public LocalDate getDateConsultationDoctor() {
        return dateConsultationDoctor;
    }

    public void setDateConsultationDoctor(LocalDate dateConsultationDoctor) {
        this.dateConsultationDoctor = dateConsultationDoctor;
    }

    public BigDecimal getTshirtNum() {
        return tshirtNum;
    }

    public void setTshirtNum(BigDecimal tshirtNum) {
        this.tshirtNum = tshirtNum;
    }
    
    public BigDecimal getIntervenantId() {
        return intervenantId;
    }

    public void setIntervenantId(BigDecimal intervenantId) {
        this.intervenantId = intervenantId;
    }

    // Méthodes de compatibilité avec Long (pour ne pas casser le code existant)
    public Long getDemandeIdAsLong() { return demandeId != null ? demandeId.longValue() : null; }
    public Long getTeamIdAsLong() { return teamId != null ? teamId.longValue() : null; }
    public Long getSeasonIdAsLong() { return seasonId != null ? seasonId.longValue() : null; }
    
    
    
 // Ajoutez le getter et setter pour la relation
    public Pays getPays() { return pays; }
    public void setPays(Pays pays) { this.pays = pays; }

    // Méthodes utilitaires
    public boolean isAmateur() {
        return regimeId != null && regimeId.compareTo(BigDecimal.ONE) == 0;
    }

    public boolean isTransfert() {
        return typeLicenceId != null && 
               (typeLicenceId.compareTo(BigDecimal.valueOf(3)) == 0 || 
                typeLicenceId.compareTo(BigDecimal.valueOf(4)) == 0);
    }

    public boolean isPret() {
        return typeLicenceId != null && typeLicenceId.compareTo(BigDecimal.valueOf(5)) == 0;
    }

    public boolean isNouvelle() {
        return typeLicenceId != null && typeLicenceId.compareTo(BigDecimal.ONE) == 0;
    }

    public boolean isRenouvellement() {
        return typeLicenceId != null && typeLicenceId.compareTo(BigDecimal.valueOf(2)) == 0;
    }

    public String getFullName() {
        return (name != null ? name : "") + " " + (lastName != null ? lastName : "");
    }

    // Méthodes pour compatibilité avec l'ancien code
    public java.time.LocalDateTime getCreatedAt() { return null; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { }
    
    public java.time.LocalDateTime getUpdatedAt() { return null; }
    public void setUpdatedAt(java.time.LocalDateTime updatedAt) { }
    
    public Long getCreatedBy() { return null; }
    public void setCreatedBy(Long createdBy) { }
    
    public Long getUpdatedBy() { return null; }
    public void setUpdatedBy(Long updatedBy) { }

    public Boolean getIsChild() { 
        if (dateOfBirth != null) {
            int age = LocalDate.now().getYear() - dateOfBirth.getYear();
            return age < 18;
        }
        return false; 
    }
    
    public void setIsChild(Boolean isChild) { }

    @Override
    public String toString() {
        return "DemandePlayers{" +
                "demandeId=" + demandeId +
                ", name='" + name + '\'' +
                ", lastName='" + lastName + '\'' +
                ", teamId=" + teamId +
                ", seasonId=" + seasonId +
                '}';
    }
}