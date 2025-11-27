package com.football.management.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ct_notification_history", schema = "sss_competition_db")
public class NotificationHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "notification_seq")
    @SequenceGenerator(name = "notification_seq", sequenceName = "ct_notification_history_seq", allocationSize = 1, schema = "sss_competition_db")
    @Column(name = "notification_id")
    private BigDecimal id;
    
    @Column(name = "ct_demande_id", nullable = false)
    private BigDecimal demandeId;
    
    @Column(name = "recipient_email", nullable = false, length = 255)
    private String recipientEmail;
    
    @Column(name = "notification_type", length = 50)
    private String notificationType;
    
    @Column(name = "subject", length = 255)
    private String subject;
    
    @Column(name = "message", columnDefinition = "TEXT")
    private String message;
    
    @Column(name = "sent_at")
    private LocalDateTime sentAt;
    
    @Column(name = "status", length = 20)
    private String status; // SUCCESS, FAILED, PENDING
    
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
    
    @Column(name = "retry_count")
    private Integer retryCount = 0;
    
    // Constructeurs
    public NotificationHistory() {
        this.sentAt = LocalDateTime.now();
        this.status = "PENDING";
    }
    
    public NotificationHistory(BigDecimal demandeId, String recipientEmail, String notificationType) {
        this();
        this.demandeId = demandeId;
        this.recipientEmail = recipientEmail;
        this.notificationType = notificationType;
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
    
    public String getRecipientEmail() {
        return recipientEmail;
    }
    
    public void setRecipientEmail(String recipientEmail) {
        this.recipientEmail = recipientEmail;
    }
    
    public String getNotificationType() {
        return notificationType;
    }
    
    public void setNotificationType(String notificationType) {
        this.notificationType = notificationType;
    }
    
    public String getSubject() {
        return subject;
    }
    
    public void setSubject(String subject) {
        this.subject = subject;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public LocalDateTime getSentAt() {
        return sentAt;
    }
    
    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    
    public Integer getRetryCount() {
        return retryCount;
    }
    
    public void setRetryCount(Integer retryCount) {
        this.retryCount = retryCount;
    }
}