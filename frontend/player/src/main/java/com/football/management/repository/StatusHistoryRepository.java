package com.football.management.repository;

import com.football.management.entity.StatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface StatusHistoryRepository extends JpaRepository<StatusHistory, BigDecimal> {
    
    @Query("SELECT h FROM StatusHistory h WHERE h.demandeId = :demandeId ORDER BY h.changedAt DESC")
    List<StatusHistory> findByDemandeId(@Param("demandeId") BigDecimal demandeId);
    
    @Query("SELECT h FROM StatusHistory h WHERE h.demandeId = :demandeId ORDER BY h.changedAt DESC")
    List<StatusHistory> findTop10ByDemandeIdOrderByChangedAtDesc(@Param("demandeId") BigDecimal demandeId);
}