package com.football.management.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "ac_users", schema = "sss_config_general_db")
public class User {

    @Id
    @Column(name = "ac_user_id")
    private String acUserId;

    @Column(name = "user_name")
    private String userName;

    @Column(name = "passe_word")
    private String passeWord;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "user_type")
    private String role; // ADMIN, CLUB, ARBITRE, JOUEUR

    // Constructeur
    public User() {
        this.isActive = true;
    }

    // Getters et Setters
    public String getAcUserId() { 
        return acUserId; 
    }
    
    public void setAcUserId(String acUserId) { 
        this.acUserId = acUserId; 
    }

    public String getUserName() { 
        return userName; 
    }
    
    public void setUserName(String userName) { 
        this.userName = userName; 
    }

    public String getPasseWord() { 
        return passeWord; 
    }
    
    public void setPasseWord(String passeWord) { 
        this.passeWord = passeWord; 
    }

    public String getDisplayName() { 
        return displayName; 
    }
    
    public void setDisplayName(String displayName) { 
        this.displayName = displayName; 
    }

    public Boolean getIsActive() { 
        return isActive; 
    }
    
    public void setIsActive(Boolean isActive) { 
        this.isActive = isActive; 
    }

    public String getRole() { 
        return role; 
    }
    
    public void setRole(String role) { 
        this.role = role; 
    }
}