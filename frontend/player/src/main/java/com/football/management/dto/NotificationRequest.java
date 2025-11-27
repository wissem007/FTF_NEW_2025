package com.football.management.dto;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

public class NotificationRequest {
    
    private BigDecimal demandeId;
    private String recipientEmail;
    private String recipientName;
    private String notificationType;
    private String newStatus;
    private String oldStatus;
    private String comment;
    private Map<String, Object> additionalData;
    
    public NotificationRequest() {
        this.additionalData = new HashMap<>();
    }
    
    public NotificationRequest(BigDecimal demandeId, String recipientEmail, String notificationType) {
        this();
        this.demandeId = demandeId;
        this.recipientEmail = recipientEmail;
        this.notificationType = notificationType;
    }
    
    // Getters et Setters
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
    
    public String getRecipientName() {
        return recipientName;
    }
    
    public void setRecipientName(String recipientName) {
        this.recipientName = recipientName;
    }
    
    public String getNotificationType() {
        return notificationType;
    }
    
    public void setNotificationType(String notificationType) {
        this.notificationType = notificationType;
    }
    
    public String getNewStatus() {
        return newStatus;
    }
    
    public void setNewStatus(String newStatus) {
        this.newStatus = newStatus;
    }
    
    public String getOldStatus() {
        return oldStatus;
    }
    
    public void setOldStatus(String oldStatus) {
        this.oldStatus = oldStatus;
    }
    
    public String getComment() {
        return comment;
    }
    
    public void setComment(String comment) {
        this.comment = comment;
    }
    
    public Map<String, Object> getAdditionalData() {
        return additionalData;
    }
    
    public void setAdditionalData(Map<String, Object> additionalData) {
        this.additionalData = additionalData;
    }
    
    public void addData(String key, Object value) {
        this.additionalData.put(key, value);
    }
}