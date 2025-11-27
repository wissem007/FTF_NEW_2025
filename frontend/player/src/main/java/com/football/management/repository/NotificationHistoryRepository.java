package com.football.management.repository;

import com.football.management.entity.NotificationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface NotificationHistoryRepository extends JpaRepository<NotificationHistory, BigDecimal> {
    
    @Query("SELECT n FROM NotificationHistory n WHERE n.demandeId = :demandeId ORDER BY n.sentAt DESC")
    List<NotificationHistory> findByDemandeId(@Param("demandeId") BigDecimal demandeId);
    
    @Query("SELECT n FROM NotificationHistory n WHERE n.status = :status")
    List<NotificationHistory> findByStatus(@Param("status") String status);
    
    @Query("SELECT n FROM NotificationHistory n WHERE n.status = 'FAILED' AND n.retryCount < 3")
    List<NotificationHistory> findFailedNotificationsForRetry();
}