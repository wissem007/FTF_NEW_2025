package com.football.management.service;

import com.football.management.entity.DemandePieceJointe;
import com.football.management.repository.DemandePieceJointeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@Service
public class PieceJointeService {
    
    @Autowired
    private DemandePieceJointeRepository pieceJointeRepository;
    
    /**
     * Uploader une pièce jointe
     */
    public DemandePieceJointe uploadPieceJointe(
        MultipartFile file,
        BigDecimal demandeId,
        BigDecimal modeleFileDemandId
    ) throws IOException {
        
        // Valider le fichier
        validateFile(file);
        
        // Vérifier si une pièce existe déjà pour ce type
        DemandePieceJointe existing = pieceJointeRepository
            .findByDemandeIdAndModeleFileDemandId(demandeId, modeleFileDemandId);
        
        DemandePieceJointe pieceJointe;
        
        if (existing != null) {
            // Mettre à jour l'existant
            pieceJointe = existing;
        } else {
            // Créer un nouveau
            pieceJointe = new DemandePieceJointe();
            pieceJointe.setDemandeId(demandeId);
            pieceJointe.setModeleFileDemandId(modeleFileDemandId);
        }
        
        // Remplir les données
        pieceJointe.setFileDemandeName(file.getOriginalFilename());
        pieceJointe.setFileDemandeContentType(file.getContentType());
        pieceJointe.setFileDemandeBdata(file.getBytes());
        
        // Optionnel : stocker aussi le chemin si vous voulez sauvegarder sur disque
        // pieceJointe.setFileDemandeSdata("/uploads/" + file.getOriginalFilename());
        
        return pieceJointeRepository.save(pieceJointe);
    }
    
    /**
     * Obtenir toutes les pièces jointes d'une demande
     */
    public List<DemandePieceJointe> getPiecesJointesByDemande(BigDecimal demandeId) {
        return pieceJointeRepository.findByDemandeId(demandeId);
    }
    
    /**
     * Obtenir une pièce jointe par ID
     */
    public DemandePieceJointe getPieceJointeById(BigDecimal pieceJointeId) {
        return pieceJointeRepository.findById(pieceJointeId)
            .orElseThrow(() -> new IllegalArgumentException("Pièce jointe non trouvée"));
    }
    
    /**
     * Télécharger une pièce jointe
     */
    public byte[] downloadPieceJointe(BigDecimal pieceJointeId) {
        DemandePieceJointe pieceJointe = getPieceJointeById(pieceJointeId);
        return pieceJointe.getFileDemandeBdata();
    }
    
    /**
     * Supprimer une pièce jointe
     */
    public void deletePieceJointe(BigDecimal pieceJointeId) {
        pieceJointeRepository.deleteById(pieceJointeId);
    }
    
    /**
     * Vérifier si une demande a toutes les pièces requises
     */
    public boolean hasAllRequiredDocuments(BigDecimal demandeId) {
        Long count = pieceJointeRepository.countDistinctDocumentTypesByDemandeId(demandeId);
        
        // Types de documents requis :
        // 1 = Photo
        // 2 = CIN ou Passeport
        // 3 = Certificat médical
        // 4 = Extrait de naissance (pour mineurs)
        
        return count >= 3; // Au minimum 3 types de documents
    }
    
    /**
     * Obtenir le statut des documents d'une demande
     */
    public DocumentsStatus getDocumentsStatus(BigDecimal demandeId) {
        List<DemandePieceJointe> pieces = getPiecesJointesByDemande(demandeId);
        
        DocumentsStatus status = new DocumentsStatus();
        status.setTotalDocuments(pieces.size());
        status.setHasPhoto(pieces.stream().anyMatch(p -> p.getModeleFileDemandId().intValue() == 1));
        status.setHasIdentity(pieces.stream().anyMatch(p -> p.getModeleFileDemandId().intValue() == 2));
        status.setHasMedical(pieces.stream().anyMatch(p -> p.getModeleFileDemandId().intValue() == 3));
        status.setComplete(hasAllRequiredDocuments(demandeId));
        
        return status;
    }
    
    /**
     * Valider le fichier
     */
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier est vide");
        }
        
        // Taille maximale : 5MB
        long maxSize = 5 * 1024 * 1024;
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("Le fichier est trop volumineux (max 5MB)");
        }
        
        // Types autorisés
        String contentType = file.getContentType();
        if (!isAllowedContentType(contentType)) {
            throw new IllegalArgumentException("Type de fichier non autorisé. Formats acceptés : PDF, JPEG, PNG");
        }
    }
    
    private boolean isAllowedContentType(String contentType) {
        return contentType != null && (
            contentType.equals("application/pdf") ||
            contentType.equals("image/jpeg") ||
            contentType.equals("image/jpg") ||
            contentType.equals("image/png")
        );
    }
    
    /**
     * Classe interne pour le statut des documents
     */
    public static class DocumentsStatus {
        private int totalDocuments;
        private boolean hasPhoto;
        private boolean hasIdentity;
        private boolean hasMedical;
        private boolean complete;
        
        // Getters et Setters
        public int getTotalDocuments() {
            return totalDocuments;
        }
        
        public void setTotalDocuments(int totalDocuments) {
            this.totalDocuments = totalDocuments;
        }
        
        public boolean isHasPhoto() {
            return hasPhoto;
        }
        
        public void setHasPhoto(boolean hasPhoto) {
            this.hasPhoto = hasPhoto;
        }
        
        public boolean isHasIdentity() {
            return hasIdentity;
        }
        
        public void setHasIdentity(boolean hasIdentity) {
            this.hasIdentity = hasIdentity;
        }
        
        public boolean isHasMedical() {
            return hasMedical;
        }
        
        public void setHasMedical(boolean hasMedical) {
            this.hasMedical = hasMedical;
        }
        
        public boolean isComplete() {
            return complete;
        }
        
        public void setComplete(boolean complete) {
            this.complete = complete;
        }
    }
}