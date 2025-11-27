package com.football.management.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ct_demande_piece_jointes", schema = "sss_competition_db")
public class DemandePieceJointe {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ct_piece_jointe_id")
    private BigDecimal pieceJointeId;
    
    @Column(name = "ct_demande_id", nullable = false)
    private BigDecimal demandeId;
    
    @Column(name = "ct_modele_file_demande_id")
    private BigDecimal modeleFileDemandId;
    
    @Column(name = "file_demande_ctype", length = 100)
    private String fileDemandeContentType;
    
    @Column(name = "file_demande_sdata", length = 255)
    private String fileDemandeSdata; // Chemin du fichier ou référence
    
    @Lob
    @Column(name = "file_demande_bdata")
    private byte[] fileDemandeBdata; // Données binaires du fichier
    
    @Column(name = "file_demande_name", length = 255)
    private String fileDemandeName;
    
    @Column(name = "date_file")
    private LocalDateTime dateFile;
    
    @PrePersist
    protected void onCreate() {
        if (dateFile == null) {
            dateFile = LocalDateTime.now();
        }
    }
    
    // Getters et Setters
    public BigDecimal getPieceJointeId() {
        return pieceJointeId;
    }
    
    public void setPieceJointeId(BigDecimal pieceJointeId) {
        this.pieceJointeId = pieceJointeId;
    }
    
    public BigDecimal getDemandeId() {
        return demandeId;
    }
    
    public void setDemandeId(BigDecimal demandeId) {
        this.demandeId = demandeId;
    }
    
    public BigDecimal getModeleFileDemandId() {
        return modeleFileDemandId;
    }
    
    public void setModeleFileDemandId(BigDecimal modeleFileDemandId) {
        this.modeleFileDemandId = modeleFileDemandId;
    }
    
    public String getFileDemandeContentType() {
        return fileDemandeContentType;
    }
    
    public void setFileDemandeContentType(String fileDemandeContentType) {
        this.fileDemandeContentType = fileDemandeContentType;
    }
    
    public String getFileDemandeSdata() {
        return fileDemandeSdata;
    }
    
    public void setFileDemandeSdata(String fileDemandeSdata) {
        this.fileDemandeSdata = fileDemandeSdata;
    }
    
    public byte[] getFileDemandeBdata() {
        return fileDemandeBdata;
    }
    
    public void setFileDemandeBdata(byte[] fileDemandeBdata) {
        this.fileDemandeBdata = fileDemandeBdata;
    }
    
    public String getFileDemandeName() {
        return fileDemandeName;
    }
    
    public void setFileDemandeName(String fileDemandeName) {
        this.fileDemandeName = fileDemandeName;
    }
    
    public LocalDateTime getDateFile() {
        return dateFile;
    }
    
    public void setDateFile(LocalDateTime dateFile) {
        this.dateFile = dateFile;
    }
    
    // Méthode utilitaire pour obtenir la taille du fichier
    @Transient
    public Long getFileSize() {
        return fileDemandeBdata != null ? (long) fileDemandeBdata.length : 0L;
    }
}