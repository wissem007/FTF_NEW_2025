package com.football.management.dto;

import java.math.BigDecimal;

public class LoginResponse {
    private String username;
    private String clubName;
    private BigDecimal teamId;
    private BigDecimal seasonId;
    private String message;
    private boolean success;

    public LoginResponse() {}

    public LoginResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    // Getters et Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getClubName() { return clubName; }
    public void setClubName(String clubName) { this.clubName = clubName; }

    public BigDecimal getTeamId() { return teamId; }
    public void setTeamId(BigDecimal teamId) { this.teamId = teamId; }

    public BigDecimal getSeasonId() { return seasonId; }
    public void setSeasonId(BigDecimal seasonId) { this.seasonId = seasonId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
}