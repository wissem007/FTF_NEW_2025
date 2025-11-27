package com.football.management.service.notification;

import com.football.management.dto.NotificationRequest;
import com.football.management.entity.NotificationHistory;
import com.football.management.repository.NotificationHistoryRepository;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.time.LocalDateTime;

@Service
public class EmailNotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailNotificationService.class);
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private SpringTemplateEngine templateEngine;
    
    @Autowired
    private NotificationHistoryRepository notificationHistoryRepository;
    
    @Value("${notification.email.from}")
    private String fromEmail;
    
    @Value("${notification.email.enabled:true}")
    private boolean emailEnabled;
    
    /**
     * Envoyer une notification par email de manière asynchrone
     */
    @Async
    public void sendNotification(NotificationRequest request) {
        if (!emailEnabled) {
            logger.info("Les emails sont désactivés. Notification ignorée.");
            return;
        }
        
        NotificationHistory history = new NotificationHistory(
            request.getDemandeId(),
            request.getRecipientEmail(),
            request.getNotificationType()
        );
        
        try {
            String subject = buildSubject(request);
            String content = buildEmailContent(request);
            
            history.setSubject(subject);
            history.setMessage(content);
            
            sendEmail(request.getRecipientEmail(), subject, content);
            
            history.setStatus("SUCCESS");
            history.setSentAt(LocalDateTime.now());
            
            logger.info("Email envoyé avec succès à {} pour la demande {}", 
                       request.getRecipientEmail(), request.getDemandeId());
            
        } catch (Exception e) {
            history.setStatus("FAILED");
            history.setErrorMessage(e.getMessage());
            history.setRetryCount(history.getRetryCount() + 1);
            
            logger.error("Erreur lors de l'envoi de l'email à {}: {}", 
                        request.getRecipientEmail(), e.getMessage());
        } finally {
            notificationHistoryRepository.save(history);
        }
    }
    
    /**
     * Construire le sujet de l'email selon le type
     */
    private String buildSubject(NotificationRequest request) {
        return switch (request.getNotificationType()) {
            case "STATUS_CHANGE" -> "Changement de statut de votre demande de licence";
            case "VALIDATED" -> "✅ Votre demande de licence a été validée";
            case "REJECTED" -> "❌ Votre demande de licence a été rejetée";
            case "PRINTED" -> "📄 Votre licence est prête";
            case "REMINDER" -> "🔔 Rappel concernant votre demande";
            default -> "Notification - Demande de licence FTF";
        };
    }
    
    /**
     * Construire le contenu HTML de l'email
     */
    private String buildEmailContent(NotificationRequest request) {
        Context context = new Context();
        context.setVariable("recipientName", request.getRecipientName());
        context.setVariable("demandeId", request.getDemandeId());
        context.setVariable("oldStatus", request.getOldStatus());
        context.setVariable("newStatus", request.getNewStatus());
        context.setVariable("comment", request.getComment());
        context.setVariable("additionalData", request.getAdditionalData());
        
        String templateName = getTemplateName(request.getNotificationType());
        
        return templateEngine.process(templateName, context);
    }
    
    /**
     * Obtenir le nom du template selon le type
     */
    private String getTemplateName(String notificationType) {
        return switch (notificationType) {
            case "VALIDATED" -> "email/demande-validee";
            case "REJECTED" -> "email/demande-rejetee";
            case "PRINTED" -> "email/licence-prete";
            case "STATUS_CHANGE" -> "email/changement-statut";
            default -> "email/notification-generique";
        };
    }
    
    /**
     * Envoyer l'email via JavaMailSender
     */
    private void sendEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        
        mailSender.send(message);
    }
}