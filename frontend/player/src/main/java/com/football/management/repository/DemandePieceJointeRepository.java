package com.football.management.repository;

import com.football.management.entity.DemandePieceJointe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface DemandePieceJointeRepository extends JpaRepository<DemandePieceJointe, BigDecimal> {
    
    /**
     * Trouver toutes les pièces jointes d'une demande
     */
    List<DemandePieceJointe> findByDemandeId(BigDecimal demandeId);
    
    /**
     * Trouver une pièce jointe par demande et modèle
     */
    DemandePieceJointe findByDemandeIdAndModeleFileDemandId(
        BigDecimal demandeId, 
        BigDecimal modeleFileDemandId
    );
    
    /**
     * Compter les pièces jointes d'une demande
     */
    @Query("SELECT COUNT(p) FROM DemandePieceJointe p WHERE p.demandeId = :demandeId")
    Long countByDemandeId(@Param("demandeId") BigDecimal demandeId);
    
    /**
     * Vérifier si une demande a toutes les pièces requises
     */
    @Query("SELECT COUNT(DISTINCT p.modeleFileDemandId) FROM DemandePieceJointe p WHERE p.demandeId = :demandeId")
    Long countDistinctDocumentTypesByDemandeId(@Param("demandeId") BigDecimal demandeId);
}