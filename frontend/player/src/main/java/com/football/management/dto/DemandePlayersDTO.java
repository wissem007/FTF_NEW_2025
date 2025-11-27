package com.football.management.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class DemandePlayersDTO {
    
    // IDs principaux
    private BigDecimal demandeId;
    private BigDecimal demandeStatuId;
    private BigDecimal etatCivilId;
    
    // Informations personnelles
    private String alias;
    private String lastName;
    private String name;
    private LocalDate dateOfBirth;
    private String placeOfBirth;
    private String email;
    
    public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	// Nationalité
    private BigDecimal paysId;
    private String paysLibelle; // Pour affichage
    
    // Documents d'identité
    private String cinNumber;
    private String cinNumberParent;
    private String passportNum;
    private String licenceNum;
    
    // Équipe et saison
    private BigDecimal teamId;
    private String teamName; // Pour affichage
    private BigDecimal seasonId;
    
    // Catégorie et régime
    private BigDecimal playerCategoryId;
    private BigDecimal regimeId;
    private BigDecimal typeLicenceId;
    
    // Informations sportives
    private BigDecimal positionId;
    private BigDecimal feetId;
    private BigDecimal typeCompetitionId;
    private BigDecimal tshirtNum;
    private BigDecimal weight;
    private BigDecimal height;
    
    // Informations médicales
    private String nameDoctor;
    private String lastNameDoctor;
    private LocalDate dateConsultationDoctor;
    
    // Contrat
    private LocalDate contractDate;
    private LocalDate contractDateFin;
    private BigDecimal dureePret;
    private String contratStatus;
    
    // Informations financières
    private BigDecimal ruminationFixeTotale;
    private LocalDate dateAccordContrat;
    private BigDecimal teamCoorBancaireId;
    private BigDecimal teamSaison1CoorBancaireId;
    
    // Équipes liées
    private BigDecimal saison1Id;
    private BigDecimal intervenantId;
    
    // Type et statuts
    private BigDecimal ctIntervenantTypeId;
    private Boolean isDemission;
    private Boolean isChild;
    
    // Informations administratives
    private BigDecimal commissionId;
    private LocalDate dateEnregistrement;
    private LocalDate dateCommission;
    private LocalDate dateImpression;
    private LocalDate membershipDate;
    
    // Division et ligue
    private BigDecimal divisionId;
    private BigDecimal leagueId;
    
    // Qualification
    private Boolean isQualified;
    private Boolean isOnClassification;
    private Boolean isRejete;
    private BigDecimal motifsRejetDemendeId;
    
    // Champs de compatibilité/audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private Long updatedBy;
    
    // Informations anciennes équipes
    private BigDecimal teamOrigineId;
    private String teamOrigineLibelle;
    private String teamSaison1Libelle;
    private String licenceNumOld;
    private BigDecimal numYearContract;
    
    // ==================== CONSTRUCTEURS ====================
    
    public DemandePlayersDTO() {}
    
    // ==================== GETTERS ET SETTERS ====================
    
    public BigDecimal getDemandeId() {
        return demandeId;
    }
    
    public void setDemandeId(BigDecimal demandeId) {
        this.demandeId = demandeId;
    }
    
    public BigDecimal getDemandeStatuId() {
        return demandeStatuId;
    }
    
    public void setDemandeStatuId(BigDecimal demandeStatuId) {
        this.demandeStatuId = demandeStatuId;
    }
    
    public BigDecimal getEtatCivilId() {
        return etatCivilId;
    }
    
    public void setEtatCivilId(BigDecimal etatCivilId) {
        this.etatCivilId = etatCivilId;
    }
    
    public String getAlias() {
        return alias;
    }
    
    public void setAlias(String alias) {
        this.alias = alias;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }
    
    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }
    
    public String getPlaceOfBirth() {
        return placeOfBirth;
    }
    
    public void setPlaceOfBirth(String placeOfBirth) {
        this.placeOfBirth = placeOfBirth;
    }
    
    public BigDecimal getPaysId() {
        return paysId;
    }
    
    public void setPaysId(BigDecimal paysId) {
        this.paysId = paysId;
    }
    
    public String getPaysLibelle() {
        return paysLibelle;
    }
    
    public void setPaysLibelle(String paysLibelle) {
        this.paysLibelle = paysLibelle;
    }
    
    public String getCinNumber() {
        return cinNumber;
    }
    
    public void setCinNumber(String cinNumber) {
        this.cinNumber = cinNumber;
    }
    
    public String getCinNumberParent() {
        return cinNumberParent;
    }
    
    public void setCinNumberParent(String cinNumberParent) {
        this.cinNumberParent = cinNumberParent;
    }
    
    public String getPassportNum() {
        return passportNum;
    }
    
    public void setPassportNum(String passportNum) {
        this.passportNum = passportNum;
    }
    
    public String getLicenceNum() {
        return licenceNum;
    }
    
    public void setLicenceNum(String licenceNum) {
        this.licenceNum = licenceNum;
    }
    
    public BigDecimal getTeamId() {
        return teamId;
    }
    
    public void setTeamId(BigDecimal teamId) {
        this.teamId = teamId;
    }
    
    public String getTeamName() {
        return teamName;
    }
    
    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }
    
    public BigDecimal getSeasonId() {
        return seasonId;
    }
    
    public void setSeasonId(BigDecimal seasonId) {
        this.seasonId = seasonId;
    }
    
    public BigDecimal getPlayerCategoryId() {
        return playerCategoryId;
    }
    
    public void setPlayerCategoryId(BigDecimal playerCategoryId) {
        this.playerCategoryId = playerCategoryId;
    }
    
    public BigDecimal getRegimeId() {
        return regimeId;
    }
    
    public void setRegimeId(BigDecimal regimeId) {
        this.regimeId = regimeId;
    }
    
    public BigDecimal getTypeLicenceId() {
        return typeLicenceId;
    }
    
    public void setTypeLicenceId(BigDecimal typeLicenceId) {
        this.typeLicenceId = typeLicenceId;
    }
    
    public BigDecimal getPositionId() {
        return positionId;
    }
    
    public void setPositionId(BigDecimal positionId) {
        this.positionId = positionId;
    }
    
    public BigDecimal getFeetId() {
        return feetId;
    }
    
    public void setFeetId(BigDecimal feetId) {
        this.feetId = feetId;
    }
    
    public BigDecimal getTypeCompetitionId() {
        return typeCompetitionId;
    }
    
    public void setTypeCompetitionId(BigDecimal typeCompetitionId) {
        this.typeCompetitionId = typeCompetitionId;
    }
    
    public BigDecimal getTshirtNum() {
        return tshirtNum;
    }
    
    public void setTshirtNum(BigDecimal tshirtNum) {
        this.tshirtNum = tshirtNum;
    }
    
    public BigDecimal getWeight() {
        return weight;
    }
    
    public void setWeight(BigDecimal weight) {
        this.weight = weight;
    }
    
    public BigDecimal getHeight() {
        return height;
    }
    
    public void setHeight(BigDecimal height) {
        this.height = height;
    }
    
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
    
    public LocalDate getContractDate() {
        return contractDate;
    }
    
    public void setContractDate(LocalDate contractDate) {
        this.contractDate = contractDate;
    }
    
    public LocalDate getContractDateFin() {
        return contractDateFin;
    }
    
    public void setContractDateFin(LocalDate contractDateFin) {
        this.contractDateFin = contractDateFin;
    }
    
    public BigDecimal getDureePret() {
        return dureePret;
    }
    
    public void setDureePret(BigDecimal dureePret) {
        this.dureePret = dureePret;
    }
    
    public String getContratStatus() {
        return contratStatus;
    }
    
    public void setContratStatus(String contratStatus) {
        this.contratStatus = contratStatus;
    }
    
    public BigDecimal getRuminationFixeTotale() {
        return ruminationFixeTotale;
    }
    
    public void setRuminationFixeTotale(BigDecimal ruminationFixeTotale) {
        this.ruminationFixeTotale = ruminationFixeTotale;
    }
    
    public LocalDate getDateAccordContrat() {
        return dateAccordContrat;
    }
    
    public void setDateAccordContrat(LocalDate dateAccordContrat) {
        this.dateAccordContrat = dateAccordContrat;
    }
    
    public BigDecimal getTeamCoorBancaireId() {
        return teamCoorBancaireId;
    }
    
    public void setTeamCoorBancaireId(BigDecimal teamCoorBancaireId) {
        this.teamCoorBancaireId = teamCoorBancaireId;
    }
    
    public BigDecimal getTeamSaison1CoorBancaireId() {
        return teamSaison1CoorBancaireId;
    }
    
    public void setTeamSaison1CoorBancaireId(BigDecimal teamSaison1CoorBancaireId) {
        this.teamSaison1CoorBancaireId = teamSaison1CoorBancaireId;
    }
    
    public BigDecimal getSaison1Id() {
        return saison1Id;
    }
    
    public void setSaison1Id(BigDecimal saison1Id) {
        this.saison1Id = saison1Id;
    }
    
    public BigDecimal getIntervenantId() {
        return intervenantId;
    }
    
    public void setIntervenantId(BigDecimal intervenantId) {
        this.intervenantId = intervenantId;
    }
    
    public BigDecimal getCtIntervenantTypeId() {
        return ctIntervenantTypeId;
    }
    
    public void setCtIntervenantTypeId(BigDecimal ctIntervenantTypeId) {
        this.ctIntervenantTypeId = ctIntervenantTypeId;
    }
    
    public Boolean getIsDemission() {
        return isDemission;
    }
    
    public void setIsDemission(Boolean isDemission) {
        this.isDemission = isDemission;
    }
    
    public Boolean getIsChild() {
        return isChild;
    }
    
    public void setIsChild(Boolean isChild) {
        this.isChild = isChild;
    }
    
    public BigDecimal getCommissionId() {
        return commissionId;
    }
    
    public void setCommissionId(BigDecimal commissionId) {
        this.commissionId = commissionId;
    }
    
    public LocalDate getDateEnregistrement() {
        return dateEnregistrement;
    }
    
    public void setDateEnregistrement(LocalDate dateEnregistrement) {
        this.dateEnregistrement = dateEnregistrement;
    }
    
    public LocalDate getDateCommission() {
        return dateCommission;
    }
    
    public void setDateCommission(LocalDate dateCommission) {
        this.dateCommission = dateCommission;
    }
    
    public LocalDate getDateImpression() {
        return dateImpression;
    }
    
    public void setDateImpression(LocalDate dateImpression) {
        this.dateImpression = dateImpression;
    }
    
    public LocalDate getMembershipDate() {
        return membershipDate;
    }
    
    public void setMembershipDate(LocalDate membershipDate) {
        this.membershipDate = membershipDate;
    }
    
    public BigDecimal getDivisionId() {
        return divisionId;
    }
    
    public void setDivisionId(BigDecimal divisionId) {
        this.divisionId = divisionId;
    }
    
    public BigDecimal getLeagueId() {
        return leagueId;
    }
    
    public void setLeagueId(BigDecimal leagueId) {
        this.leagueId = leagueId;
    }
    
    public Boolean getIsQualified() {
        return isQualified;
    }
    
    public void setIsQualified(Boolean isQualified) {
        this.isQualified = isQualified;
    }
    
    public Boolean getIsOnClassification() {
        return isOnClassification;
    }
    
    public void setIsOnClassification(Boolean isOnClassification) {
        this.isOnClassification = isOnClassification;
    }
    
    public Boolean getIsRejete() {
        return isRejete;
    }
    
    public void setIsRejete(Boolean isRejete) {
        this.isRejete = isRejete;
    }
    
    public BigDecimal getMotifsRejetDemendeId() {
        return motifsRejetDemendeId;
    }
    
    public void setMotifsRejetDemendeId(BigDecimal motifsRejetDemendeId) {
        this.motifsRejetDemendeId = motifsRejetDemendeId;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public Long getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }
    
    public Long getUpdatedBy() {
        return updatedBy;
    }
    
    public void setUpdatedBy(Long updatedBy) {
        this.updatedBy = updatedBy;
    }
    
    public BigDecimal getTeamOrigineId() {
        return teamOrigineId;
    }
    
    public void setTeamOrigineId(BigDecimal teamOrigineId) {
        this.teamOrigineId = teamOrigineId;
    }
    
    public String getTeamOrigineLibelle() {
        return teamOrigineLibelle;
    }
    
    public void setTeamOrigineLibelle(String teamOrigineLibelle) {
        this.teamOrigineLibelle = teamOrigineLibelle;
    }
    
    public String getTeamSaison1Libelle() {
        return teamSaison1Libelle;
    }
    
    public void setTeamSaison1Libelle(String teamSaison1Libelle) {
        this.teamSaison1Libelle = teamSaison1Libelle;
    }
    
    public String getLicenceNumOld() {
        return licenceNumOld;
    }
    
    public void setLicenceNumOld(String licenceNumOld) {
        this.licenceNumOld = licenceNumOld;
    }
    
    public BigDecimal getNumYearContract() {
        return numYearContract;
    }
    
    public void setNumYearContract(BigDecimal numYearContract) {
        this.numYearContract = numYearContract;
    }
    
    @Override
    public String toString() {
        return "DemandePlayersDTO{" +
                "demandeId=" + demandeId +
                ", name='" + name + '\'' +
                ", lastName='" + lastName + '\'' +
                ", teamId=" + teamId +
                ", seasonId=" + seasonId +
                '}';
    }
}