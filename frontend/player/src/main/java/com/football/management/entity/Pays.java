package com.football.management.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "cr_pays", schema = "sss_config_general_db")
public class Pays {

    @Id
    @Column(name = "cr_pays_id", columnDefinition = "NUMERIC")
    private BigDecimal paysId;

    @Column(name = "libelle")
    private String libelle;

    @Column(name = "libelle_arabe")
    private String libelleArabe;

    @Column(name = "nationalite")
    private String nationalite;

    @Column(name = "code_iso")
    private String codeIso;

    @Column(name = "indicatif_tel", columnDefinition = "NUMERIC")
    private BigDecimal indicatifTel;

    // Constructeurs
    public Pays() {}

    public Pays(BigDecimal paysId, String libelle, String nationalite) {
        this.paysId = paysId;
        this.libelle = libelle;
        this.nationalite = nationalite;
    }

    // Getters et Setters
    public BigDecimal getPaysId() { return paysId; }
    public void setPaysId(BigDecimal paysId) { this.paysId = paysId; }

    public String getLibelle() { return libelle; }
    public void setLibelle(String libelle) { this.libelle = libelle; }

    public String getLibelleArabe() { return libelleArabe; }
    public void setLibelleArabe(String libelleArabe) { this.libelleArabe = libelleArabe; }

    public String getNationalite() { return nationalite; }
    public void setNationalite(String nationalite) { this.nationalite = nationalite; }

    public String getCodeIso() { return codeIso; }
    public void setCodeIso(String codeIso) { this.codeIso = codeIso; }

    public BigDecimal getIndicatifTel() { return indicatifTel; }
    public void setIndicatifTel(BigDecimal indicatifTel) { this.indicatifTel = indicatifTel; }

    @Override
    public String toString() {
        return "Pays{" +
                "paysId=" + paysId +
                ", libelle='" + libelle + '\'' +
                ", nationalite='" + nationalite + '\'' +
                '}';
    }
}