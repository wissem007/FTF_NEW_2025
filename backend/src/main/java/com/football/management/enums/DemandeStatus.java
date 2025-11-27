package com.football.management.enums;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Optional;

/**
 * États possibles d'une demande de licence
 */
public enum DemandeStatus {
    
    INITIAL(1L, "Initial", "Demande créée, en attente de validation", "info"),
    VALIDEE_CLUB(2L, "Validée par club", "Demande validée par le club", "success"),
    EN_ATTENTE(8L, "En attente", "Demande en cours de traitement", "warning"),
    IMPRIMEE(9L, "Imprimée", "Licence imprimée", "success"),
    REJETEE(10L, "Rejetée", "Demande rejetée", "danger");
    
    private final Long id;
    private final String libelle;
    private final String description;
    private final String colorClass;
    
    DemandeStatus(Long id, String libelle, String description, String colorClass) {
        this.id = id;
        this.libelle = libelle;
        this.description = description;
        this.colorClass = colorClass;
    }
    
    public Long getId() {
        return id;
    }
    
    public BigDecimal getBigDecimalId() {
        return BigDecimal.valueOf(id);
    }
    
    public String getLibelle() {
        return libelle;
    }
    
    public String getDescription() {
        return description;
    }
    
    public String getColorClass() {
        return colorClass;
    }
    
    public static Optional<DemandeStatus> fromId(Long id) {
        return Arrays.stream(values())
                .filter(status -> status.id.equals(id))
                .findFirst();
    }
    
    public static Optional<DemandeStatus> fromBigDecimal(BigDecimal id) {
        if (id == null) return Optional.empty();
        return fromId(id.longValue());
    }
    
    public boolean isFinalState() {
        return this == IMPRIMEE || this == REJETEE;
    }
    
    public boolean isInitialState() {
        return this == INITIAL;
    }
    
    public boolean isValidated() {
        return this == VALIDEE_CLUB || this == IMPRIMEE;
    }
    
    @Override
    public String toString() {
        return libelle;
    }
}