package com.football.management.repository;

import com.football.management.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, BigDecimal> {
    Optional<Team> findByAcUserId(String acUserId);
    Optional<Team> findByName(String name);
}