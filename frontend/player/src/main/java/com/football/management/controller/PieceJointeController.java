package com.football.management.controller;

import com.football.management.entity.DemandePieceJointe;
import com.football.management.service.PieceJointeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/pieces-jointes")
@Tag(name = "Pièces Jointes", description = "Gestion des pièces jointes des demandes")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:8082"})
public class PieceJointeController {
    
    @Autowired
    private PieceJointeService pieceJointeService;
    
    /**
     * Uploader une pièce jointe
     */
    @PostMapping("/upload")
    @Operation(
        summary = "Uploader une pièce jointe",
        description = "Upload d'une pièce jointe pour une demande. Types: 1=Photo, 2=CIN/Passeport, 3=Certificat médical, 4=Extrait naissance"
    )
    public ResponseEntity<?> uploadPieceJointe(
        @RequestParam("file") MultipartFile file,
        @RequestParam("demandeId") Long demandeId,
        @RequestParam("typeDocument") Integer typeDocument
    ) {
        try {
            DemandePieceJointe pieceJointe = pieceJointeService.uploadPieceJointe(
                file,
                BigDecimal.valueOf(demandeId),
                BigDecimal.valueOf(typeDocument)
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Fichier uploadé avec succès");
            response.put("pieceJointeId", pieceJointe.getPieceJointeId());
            response.put("fileName", pieceJointe.getFileDemandeName());
            response.put("fileSize", pieceJointe.getFileSize());
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "error", e.getMessage()));
                
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", "Erreur lors de l'upload: " + e.getMessage()));
        }
    }
    
    /**
     * Obtenir toutes les pièces jointes d'une demande
     */
    @GetMapping("/demande/{demandeId}")
    @Operation(summary = "Obtenir les pièces jointes d'une demande")
    public ResponseEntity<?> getPiecesJointes(
        @Parameter(description = "ID de la demande") @PathVariable Long demandeId
    ) {
        try {
            List<DemandePieceJointe> pieces = pieceJointeService.getPiecesJointesByDemande(
                BigDecimal.valueOf(demandeId)
            );
            
            // Retourner sans les données binaires (trop lourd)
            List<Map<String, Object>> simplifiedList = pieces.stream()
                .map(p -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("pieceJointeId", p.getPieceJointeId());
                    map.put("fileName", p.getFileDemandeName());
                    map.put("contentType", p.getFileDemandeContentType());
                    map.put("fileSize", p.getFileSize());
                    map.put("typeDocument", p.getModeleFileDemandId());
                    map.put("dateUpload", p.getDateFile());
                    return map;
                })
                .toList();
            
            return ResponseEntity.ok(simplifiedList);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Télécharger une pièce jointe
     */
    @GetMapping("/{pieceJointeId}/download")
    @Operation(summary = "Télécharger une pièce jointe")
    public ResponseEntity<byte[]> downloadPieceJointe(
        @Parameter(description = "ID de la pièce jointe") @PathVariable Long pieceJointeId
    ) {
        try {
            DemandePieceJointe pieceJointe = pieceJointeService.getPieceJointeById(
                BigDecimal.valueOf(pieceJointeId)
            );
            
            byte[] fileContent = pieceJointe.getFileDemandeBdata();
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(
                pieceJointe.getFileDemandeContentType()
            ));
            headers.setContentDisposition(
                ContentDisposition.attachment()
                    .filename(pieceJointe.getFileDemandeName())
                    .build()
            );
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(fileContent);
                
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
    
    /**
     * Supprimer une pièce jointe
     */
    @DeleteMapping("/{pieceJointeId}")
    @Operation(summary = "Supprimer une pièce jointe")
    public ResponseEntity<?> deletePieceJointe(
        @Parameter(description = "ID de la pièce jointe") @PathVariable Long pieceJointeId
    ) {
        try {
            pieceJointeService.deletePieceJointe(BigDecimal.valueOf(pieceJointeId));
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Pièce jointe supprimée avec succès"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    /**
     * Obtenir le statut des documents d'une demande
     */
    @GetMapping("/demande/{demandeId}/status")
    @Operation(summary = "Obtenir le statut des documents d'une demande")
    public ResponseEntity<?> getDocumentsStatus(
        @Parameter(description = "ID de la demande") @PathVariable Long demandeId
    ) {
        try {
            PieceJointeService.DocumentsStatus status = 
                pieceJointeService.getDocumentsStatus(BigDecimal.valueOf(demandeId));
            
            return ResponseEntity.ok(status);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
}