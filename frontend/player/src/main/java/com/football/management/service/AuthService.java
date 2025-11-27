package com.football.management.service;

import com.football.management.dto.LoginRequest;
import com.football.management.dto.LoginResponse;
import com.football.management.entity.User;
import com.football.management.entity.Team;
import com.football.management.repository.UserRepository;
import com.football.management.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private DefaultPasswordHashing passwordHashing;

    public LoginResponse authenticate(LoginRequest loginRequest) {
        try {
            String identifier = loginRequest.getUsername();
            String password = loginRequest.getPassword();

            if (identifier == null || identifier.trim().isEmpty()) {
                return new LoginResponse(false, "Nom d'utilisateur requis");
            }
            if (password == null || password.trim().isEmpty()) {
                return new LoginResponse(false, "Mot de passe requis");
            }

            Optional<User> userOpt = userRepository.findByUserName(identifier.trim());

            if (userOpt.isPresent()) {
                User user = userOpt.get();
                
                if (!user.getIsActive()) {
                    return new LoginResponse(false, "Compte désactivé");
                }
                
                // Utiliser isPasswordValid au lieu de encryptPassword
                if (passwordHashing.isPasswordValid(password, user.getPasseWord())) {
                    
                    // Récupérer l'équipe associée
                    Optional<Team> teamOpt = teamRepository.findByAcUserId(user.getAcUserId());
                    
                    if (teamOpt.isPresent()) {
                        Team team = teamOpt.get();
                        
                        LoginResponse response = new LoginResponse();
                        response.setSuccess(true);
                        response.setMessage("Connexion réussie");
                        response.setUsername(user.getUserName());
                        response.setClubName(team.getName());
                        response.setTeamId(team.getTeamId());
                        response.setSeasonId(BigDecimal.valueOf(2025));
                        
                        return response;
                    } else {
                        // Pas d'équipe associée
                        LoginResponse response = new LoginResponse();
                        response.setSuccess(true);
                        response.setMessage("Connexion réussie");
                        response.setUsername(user.getUserName());
                        response.setClubName(user.getDisplayName());
                        response.setTeamId(null);
                        response.setSeasonId(BigDecimal.valueOf(2025));
                        
                        return response;
                    }
                } else {
                    return new LoginResponse(false, "Mot de passe incorrect");
                }
            } else {
                return new LoginResponse(false, "Utilisateur non trouvé");
            }

        } catch (Exception e) {
            e.printStackTrace();
            return new LoginResponse(false, "Erreur serveur: " + e.getMessage());
        }
    } // ← Cette accolade ferme la méthode authenticate
} // ← Cette accolade ferme la classe AuthService