package com.football.management.service.validation;

import java.util.ArrayList;
import java.util.List;

/**
 * Résultat d'une validation avec erreurs et avertissements
 */
public class ValidationResult {
    
    private boolean valid = true;
    private List<String> errors = new ArrayList<>();
    private List<String> warnings = new ArrayList<>();
    private String playerCategory;
    private String regime;
    private Integer age;
    private Long categoryId;
    private Long divisionId;

    public void addError(String error) {
        this.errors.add(error);
        this.valid = false;
    }

    public void addWarning(String warning) {
        this.warnings.add(warning);
    }

    // Getters
    public boolean isValid() { 
        return valid; 
    }
    
    public List<String> getErrors() { 
        return errors; 
    }
    
    public List<String> getWarnings() { 
        return warnings; 
    }
    
    public String getPlayerCategory() { 
        return playerCategory; 
    }
    
    public String getRegime() { 
        return regime; 
    }
    
    public Integer getAge() { 
        return age; 
    }
    
    public Long getCategoryId() { 
        return categoryId; 
    }
    
    public Long getDivisionId() { 
        return divisionId; 
    }

    // Setters
    public void setPlayerCategory(String playerCategory) { 
        this.playerCategory = playerCategory; 
    }
    
    public void setRegime(String regime) { 
        this.regime = regime; 
    }
    
    public void setAge(Integer age) { 
        this.age = age; 
    }
    
    public void setCategoryId(Long categoryId) { 
        this.categoryId = categoryId; 
    }
    
    public void setDivisionId(Long divisionId) { 
        this.divisionId = divisionId; 
    }
}