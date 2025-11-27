package com.football.management.repository;

import com.football.management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    @Query("SELECT u FROM User u WHERE (u.userName = :identifier OR u.displayName = :identifier) AND u.isActive = true")
    Optional<User> findActiveUserByIdentifier(@Param("identifier") String identifier);

    Optional<User> findByUserName(String userName);
}