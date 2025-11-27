package com.football.management.service.workflow;

import com.football.management.dto.DemandePlayersDTO;
import com.football.management.entity.DemandePlayers;
import com.football.management.entity.StatusHistory;
import com.football.management.enums.DemandeStatus;
import com.football.management.enums.TransitionRule;
import com.football.management.repository.DemandePlayersRepository;
import com.football.management.repository.StatusHistoryRepository;
import com.football.management.mapper.DemandePlayersMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

import com.football.management.dto.NotificationRequest;
import com.football.management.service.notification.EmailNotificationService;
import org.springframework.beans.factory.annotation.Autowired;

@Service
public class WorkflowService {
    
    @Autowired
    private DemandePlayersRepository demandeRepository;
    
    @Autowired
    private StatusHistoryRepository historyRepository;
    
    @Autowired
    private DemandePlayersMapper mapper;
    
    @Autowired
    private EmailNotificationService emailNotificationService;
    
    @Transactional
    public DemandePlayersDTO changeStatus(
        Long demandeId, 
        Long newStatusId, 
        Long userId,
        String comment
    ) {
        // Récupérer la demande
        DemandePlayers demande = demandeRepository.findById(BigDecimal.valueOf(demandeId))
            .orElseThrow(() -> new IllegalArgumentException("Demande non trouvée avec l'ID: " + demandeId));
        
        // Récupérer les statuts
        BigDecimal oldStatusId = demande.getDemandeStatuId();
        DemandeStatus oldStatus = DemandeStatus.fromBigDecimal(oldStatusId)
            .orElseThrow(() -> new IllegalStateException("Statut actuel invalide: " + oldStatusId));
        
        DemandeStatus newStatus = DemandeStatus.fromId(newStatusId)
            .orElseThrow(() -> new IllegalArgumentException("Nouveau statut invalide: " + newStatusId));
        
        // Vérifier si la transition est autorisée
        if (!TransitionRule.isTransitionAllowed(oldStatus, newStatus)) {
            throw new IllegalStateException(
                TransitionRule.getTransitionErrorMessage(oldStatus, newStatus)
            );
        }
        
        // Effectuer la transition
        demande.setDemandeStatuId(BigDecimal.valueOf(newStatusId));
        DemandePlayers savedDemande = demandeRepository.save(demande);
        
        // Enregistrer dans l'historique
        StatusHistory history = new StatusHistory(
            BigDecimal.valueOf(demandeId),
            oldStatusId,
            BigDecimal.valueOf(newStatusId),
            userId
        );
        history.setComment(comment);
        historyRepository.save(history);
        
        // ✅ NOUVEAU : Envoyer une notification email
        sendStatusChangeNotification(savedDemande, oldStatus, newStatus, comment);
        
        return mapper.toDTO(savedDemande);
    }
    
    public Map<String, Object> getAvailableTransitions(Long demandeId) {
        DemandePlayers demande = demandeRepository.findById(BigDecimal.valueOf(demandeId))
            .orElseThrow(() -> new IllegalArgumentException("Demande non trouvée"));
        
        DemandeStatus currentStatus = DemandeStatus.fromBigDecimal(demande.getDemandeStatuId())
            .orElse(DemandeStatus.INITIAL);
        
        Set<DemandeStatus> allowedNextStates = TransitionRule.getAllowedNextStates(currentStatus);
        
        Map<String, Object> result = new HashMap<>();
        result.put("currentStatus", Map.of(
            "id", currentStatus.getId(),
            "libelle", currentStatus.getLibelle(),
            "description", currentStatus.getDescription()
        ));
        
        result.put("allowedTransitions", allowedNextStates.stream()
            .map(status -> Map.of(
                "id", status.getId(),
                "libelle", status.getLibelle(),
                "description", status.getDescription(),
                "colorClass", status.getColorClass()
            ))
            .collect(Collectors.toList())
        );
        
        return result;
    }
    
    public List<Map<String, Object>> getStatusHistory(Long demandeId) {
        List<StatusHistory> history = historyRepository.findByDemandeId(BigDecimal.valueOf(demandeId));
        
        return history.stream()
            .map(h -> {
                Map<String, Object> item = new HashMap<>();
                item.put("id", h.getId());
                item.put("oldStatus", DemandeStatus.fromBigDecimal(h.getOldStatusId())
                    .map(DemandeStatus::getLibelle).orElse("N/A"));
                item.put("newStatus", DemandeStatus.fromBigDecimal(h.getNewStatusId())
                    .map(DemandeStatus::getLibelle).orElse("N/A"));
                item.put("changedBy", h.getChangedBy());
                item.put("changedAt", h.getChangedAt());
                item.put("comment", h.getComment());
                return item;
            })
            .collect(Collectors.toList());
    }
    
    @Transactional
    public DemandePlayersDTO validateDemande(Long demandeId, Long userId, String comment) {
        return changeStatus(demandeId, DemandeStatus.VALIDEE_CLUB.getId(), userId, comment);
    }
    
    @Transactional
    public DemandePlayersDTO rejectDemande(Long demandeId, Long userId, String reason) {
        return changeStatus(demandeId, DemandeStatus.REJETEE.getId(), userId, reason);
    }
    
    @Transactional
    public DemandePlayersDTO markAsPrinted(Long demandeId, Long userId) {
        return changeStatus(demandeId, DemandeStatus.IMPRIMEE.getId(), userId, "Licence imprimée");
    }
    
    /**
     * Envoyer une notification lors d'un changement de statut
     */
    private void sendStatusChangeNotification(
        DemandePlayers demande, 
        DemandeStatus oldStatus, 
        DemandeStatus newStatus,
        String comment
    ) {
        try {
            // Créer la requête de notification
            NotificationRequest notificationRequest = new NotificationRequest();
            notificationRequest.setDemandeId(demande.getDemandeId());
            
            // Email du joueur (à adapter selon votre structure)
            String recipientEmail = getPlayerEmail(demande);
            if (recipientEmail == null || recipientEmail.isEmpty()) {
                return; // Pas d'email, pas de notification
            }
            
            notificationRequest.setRecipientEmail(recipientEmail);
            notificationRequest.setRecipientName(demande.getName() + " " + demande.getLastName());
            notificationRequest.setOldStatus(oldStatus.getLibelle());
            notificationRequest.setNewStatus(newStatus.getLibelle());
            notificationRequest.setComment(comment);
            
            // Déterminer le type de notification selon le nouveau statut
            String notificationType = determineNotificationType(newStatus);
            notificationRequest.setNotificationType(notificationType);
            
            // Ajouter des données supplémentaires
            notificationRequest.addData("demandeUrl", "http://licencesftf.com/demandes/" + demande.getDemandeId());
            
            // Envoyer la notification de manière asynchrone
            emailNotificationService.sendNotification(notificationRequest);
            
        } catch (Exception e) {
            // Ne pas bloquer le workflow si l'email échoue
            System.err.println("Erreur lors de l'envoi de la notification : " + e.getMessage());
        }
    }

    /**
     * Déterminer le type de notification selon le statut
     */
    private String determineNotificationType(DemandeStatus status) {
        return switch (status) {
            case VALIDEE_CLUB -> "VALIDATED";
            case REJETEE -> "REJECTED";
            case IMPRIMEE -> "PRINTED";
            default -> "STATUS_CHANGE";
        };
    }

    /**
     * Récupérer l'email du joueur
     */
    private String getPlayerEmail(DemandePlayers demande) {
        // TODO: Adapter selon votre structure de données
        // Si vous avez un champ email dans DemandePlayers :
        // return demande.getEmail();
        
        // Pour l'instant, retourner un email de test
        // En production, récupérez l'email depuis la base de données
        return "joueur.test@example.com";
    }
}