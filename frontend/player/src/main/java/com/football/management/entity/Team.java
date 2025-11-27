package com.football.management.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "ct_teams", schema = "sss_competition_db")
public class Team {

    @Id
    @Column(name = "ct_team_id", columnDefinition = "NUMERIC")
    private BigDecimal teamId;

    @Column(name = "name")
    private String name;

    @Column(name = "ac_user_id")
    private String acUserId;

    // Constructeur
    public Team() {}

    // Getters et Setters
    public BigDecimal getTeamId() { return teamId; }
    public void setTeamId(BigDecimal teamId) { this.teamId = teamId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAcUserId() { return acUserId; }
    public void setAcUserId(String acUserId) { this.acUserId = acUserId; }
}