package com.football.management.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ct_status_history", schema = "sss_competition_db")
public class StatusHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "status_history_seq")
    @SequenceGenerator(name = "status_history_seq", sequenceName = "ct_status_history_seq", allocationSize = 1, schema = "sss_competition_db")
    @Column(name = "ct_status_history_id")
    private BigDecimal id;
    
    @Column(name = "ct_demande_id", nullable = false)
    private BigDecimal demandeId;
    
    @Column(name = "old_status_id")
    private BigDecimal oldStatusId;
    
    @Column(name = "new_status_id", nullable = false)
    private BigDecimal newStatusId;
    
    @Column(name = "changed_by")
    private Long changedBy;
    
    @Column(name = "changed_at")
    private LocalDateTime changedAt;
    
    @Column(name = "comment", length = 500)
    private String comment;
    
    @Column(name = "ip_address", length = 45)
    private String ipAddress;
    
    // Constructeurs
    public StatusHistory() {
        this.changedAt = LocalDateTime.now();
    }
    
    public StatusHistory(BigDecimal demandeId, BigDecimal oldStatusId, BigDecimal newStatusId, Long changedBy) {
        this();
        this.demandeId = demandeId;
        this.oldStatusId = oldStatusId;
        this.newStatusId = newStatusId;
        this.changedBy = changedBy;
    }
    
    // Getters et Setters
    public BigDecimal getId() {
        return id;
    }
    
    public void setId(BigDecimal id) {
        this.id = id;
    }
    
    public BigDecimal getDemandeId() {
        return demandeId;
    }
    
    public void setDemandeId(BigDecimal demandeId) {
        this.demandeId = demandeId;
    }
    
    public BigDecimal getOldStatusId() {
        return oldStatusId;
    }
    
    public void setOldStatusId(BigDecimal oldStatusId) {
        this.oldStatusId = oldStatusId;
    }
    
    public BigDecimal getNewStatusId() {
        return newStatusId;
    }
    
    public void setNewStatusId(BigDecimal newStatusId) {
        this.newStatusId = newStatusId;
    }
    
    public Long getChangedBy() {
        return changedBy;
    }
    
    public void setChangedBy(Long changedBy) {
        this.changedBy = changedBy;
    }
    
    public LocalDateTime getChangedAt() {
        return changedAt;
    }
    
    public void setChangedAt(LocalDateTime changedAt) {
        this.changedAt = changedAt;
    }
    
    public String getComment() {
        return comment;
    }
    
    public void setComment(String comment) {
        this.comment = comment;
    }
    
    public String getIpAddress() {
        return ipAddress;
    }
    
    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
}