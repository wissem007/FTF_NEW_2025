package com.football.management.repository;



import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.football.management.entity.DemandePlayers;
import java.math.BigDecimal;  // Ajoutez cette ligne

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DemandePlayersRepository extends JpaRepository<DemandePlayers, BigDecimal> {
	
	
	// ========== NOUVELLES MÉTHODES POUR LE DASHBOARD ==========
		    
		    @Query("SELECT COUNT(d) FROM DemandePlayers d WHERE d.demandeStatuId = :statusId")
		    Long countByDemandeStatuId(@Param("statusId") BigDecimal statusId);
		    
		    @Query("SELECT COUNT(d) FROM DemandePlayers d WHERE d.dateEnregistrement >= :date")
		    Long countByDateEnregistrementAfter(@Param("date") LocalDate date);
		    
		    @Query("SELECT COUNT(d) FROM DemandePlayers d WHERE d.playerCategoryId = :categoryId")
		    Long countByPlayerCategoryId(@Param("categoryId") BigDecimal categoryId);
		    
		    @Query("SELECT d.seasonId, COUNT(d) FROM DemandePlayers d GROUP BY d.seasonId ORDER BY d.seasonId DESC")
		    List<Object[]> countBySeasonGrouped();
		    
		    @Query("SELECT t.name, COUNT(d) FROM DemandePlayers d JOIN Team t ON d.teamId = t.teamId GROUP BY t.name ORDER BY COUNT(d) DESC")
		    List<Object[]> findTop5TeamsByDemandesCount();
		    
		    @Query("SELECT COUNT(d) FROM DemandePlayers d WHERE d.teamId = :teamId")
		    Long countByTeamId(@Param("teamId") BigDecimal teamId);
		    
		    @Query("SELECT COUNT(d) FROM DemandePlayers d WHERE d.teamId = :teamId AND d.demandeStatuId = :statusId")
		    Long countByTeamIdAndStatus(@Param("teamId") BigDecimal teamId, @Param("statusId") BigDecimal statusId);
		

		


    // Recherche basique par critères (version simplifiée)
	@Query("""
		    SELECT d FROM DemandePlayers d 
		    WHERE 1=1
		    AND (:demandeId IS NULL OR d.demandeId = :demandeId)
		    AND (:demandeStatuId IS NULL OR d.demandeStatuId = :demandeStatuId)
		    AND (:teamId IS NULL OR d.teamId = :teamId)
		    AND (:seasonId IS NULL OR d.seasonId = :seasonId)
		    AND (:lastName IS NULL OR :lastName = '' OR UPPER(d.lastName) LIKE UPPER(CONCAT('%', :lastName, '%')))
		    AND (:name IS NULL OR :name = '' OR UPPER(d.name) LIKE UPPER(CONCAT('%', :name, '%')))
		    AND (:licenceNum IS NULL OR :licenceNum = '' OR d.licenceNum = :licenceNum)
		    AND (:cinNumber IS NULL OR :cinNumber = '' OR d.cinNumber = :cinNumber)
		    AND (:regimeId IS NULL OR d.regimeId = :regimeId)
		    AND (:typeLicenceId IS NULL OR d.typeLicenceId = :typeLicenceId)
		    AND (:ctIntervenantTypeId IS NULL OR d.ctIntervenantTypeId = :ctIntervenantTypeId)
		    ORDER BY d.dateEnregistrement DESC NULLS LAST, d.demandeId DESC
		    """)
		Page<DemandePlayers> findByCriteria(
		    @Param("demandeId") BigDecimal demandeId,
		    @Param("demandeStatuId") BigDecimal demandeStatuId,
		    @Param("teamId") BigDecimal teamId,
		    @Param("seasonId") BigDecimal seasonId,
		    @Param("lastName") String lastName,
		    @Param("name") String name,
		    @Param("licenceNum") String licenceNum,
		    @Param("cinNumber") String cinNumber,
		    @Param("regimeId") BigDecimal regimeId,
		    @Param("typeLicenceId") BigDecimal typeLicenceId,
		    @Param("ctIntervenantTypeId") BigDecimal ctIntervenantTypeId, // Nouveau paramètre
		    Pageable pageable
		);

    // Compter les demandes par critères
	@Query("""
		    SELECT COUNT(d) FROM DemandePlayers d 
		    WHERE 1=1
		    AND (:teamId IS NULL OR d.teamId = :teamId)
		    AND (:seasonId IS NULL OR d.seasonId = :seasonId)
		    AND (:licenceNum IS NULL OR :licenceNum = '' OR d.licenceNum = :licenceNum)
		    AND (:cinNumber IS NULL OR :cinNumber = '' OR d.cinNumber = :cinNumber)
		    AND (:typeLicenceId IS NULL OR d.typeLicenceId = :typeLicenceId)
		    AND (:regimeId IS NULL OR d.regimeId = :regimeId)
		    AND (:ctIntervenantTypeId IS NULL OR d.ctIntervenantTypeId = :ctIntervenantTypeId)
		    """)
		Long countByAttributes(
		    @Param("teamId") BigDecimal teamId,
		    @Param("seasonId") BigDecimal seasonId,
		    @Param("licenceNum") String licenceNum,
		    @Param("cinNumber") String cinNumber,
		    @Param("typeLicenceId") BigDecimal typeLicenceId,
		    @Param("regimeId") BigDecimal regimeId,
		    @Param("ctIntervenantTypeId") BigDecimal ctIntervenantTypeId
		);

    // Méthodes de recherche simples
	List<DemandePlayers> findByTeamIdAndSeasonId(BigDecimal teamId, BigDecimal seasonId);
    List<DemandePlayers> findByDemandeStatuId(BigDecimal statusId);
    Optional<DemandePlayers> findByLicenceNum(String licenceNum);
    Optional<DemandePlayers> findByCinNumber(String cinNumber);
    Optional<DemandePlayers> findByPassportNum(String passportNum);

    // Recherche pour renouvellements
    @Query("""
            SELECT d FROM DemandePlayers d 
            WHERE d.teamId = :teamId 
            AND d.seasonId = :seasonId 
            AND d.typeLicenceId IN (2, 6) 
            AND (d.isDemission IS NULL OR d.isDemission = false)
            ORDER BY d.lastName, d.name
            """)
        List<DemandePlayers> findRenewalCandidates(
            @Param("teamId") BigDecimal teamId, 
            @Param("seasonId") BigDecimal seasonId
        );
    
    
 // Ajoutez ces méthodes à votre DemandePlayersRepository existant

    /**
     * Compter par équipe, saison et statut
     */
    @Query("""
        SELECT COUNT(d) FROM DemandePlayers d 
        WHERE d.teamId = :teamId 
        AND d.seasonId = :seasonId 
        AND d.demandeStatuId = :statusId
        """)
    Long countByTeamIdAndSeasonIdAndDemandeStatuId(
        @Param("teamId") BigDecimal teamId,
        @Param("seasonId") BigDecimal seasonId,
        @Param("statusId") BigDecimal statusId
    );

    /**
     * Récupérer les demandes récentes (dernières 30 jours par exemple)
     */
    @Query("""
        SELECT d FROM DemandePlayers d 
        WHERE d.dateEnregistrement >= :fromDate
        ORDER BY d.dateEnregistrement DESC
        """)
    List<DemandePlayers> findRecentDemandes(@Param("fromDate") LocalDate fromDate);

    /**
     * Recherche par nom complet (nom + prénom)
     */
    @Query("""
        SELECT d FROM DemandePlayers d 
        WHERE UPPER(CONCAT(d.name, ' ', d.lastName)) LIKE UPPER(CONCAT('%', :fullName, '%'))
        ORDER BY d.lastName, d.name
        """)
    List<DemandePlayers> findByFullNameContaining(@Param("fullName") String fullName);

    /**
     * Statistiques détaillées par équipe et saison
     */
    @Query("""
        SELECT d.demandeStatuId, d.regimeId, d.typeLicenceId, COUNT(d) 
        FROM DemandePlayers d 
        WHERE d.teamId = :teamId 
        AND d.seasonId = :seasonId 
        GROUP BY d.demandeStatuId, d.regimeId, d.typeLicenceId
        ORDER BY d.demandeStatuId, d.regimeId, d.typeLicenceId
        """)
    List<Object[]> getDetailedStatsByTeamAndSeason(
        @Param("teamId") BigDecimal teamId, 
        @Param("seasonId") BigDecimal seasonId
    );
    
 // Ajouter cette méthode dans DemandePlayersRepository

    /**
     * Récupère les joueurs éligibles pour le renouvellement d'une équipe spécifique
     * avec un régime donné pour la saison courante
     */
    @Query(value = """
        SELECT DISTINCT 
            i.ct_intervenant_id as id,
            i.name as nom, 
            i.last_name as prenom,
            i.date_of_birth as dateNaissance,
            i.licence_num as licenceNum,
            ti.ct_regime_id as regimeId
        FROM ct_intervenants i 
        INNER JOIN ct_team_intervenants ti ON i.ct_intervenant_id = ti.ct_intervenant_id 
        WHERE ti.ct_team_id = :teamId 
        AND ti.ct_regime_id = :regimeId
        AND ti.ct_season_id = :currentSeasonId
        AND ti.ct_intervenant_type_id = 1
        AND i.ct_intervenant_id NOT IN (
            SELECT DISTINCT dp.ct_intervenant_id 
            FROM ct_demandes dp 
            WHERE dp.ct_team_id = :teamId 
            AND dp.ct_season_id = :newSeasonId
            AND dp.ct_type_licence_id = 2
            AND dp.ct_intervenant_id IS NOT NULL
        )
        ORDER BY i.last_name, i.name
        """, nativeQuery = true)
    List<Object[]> findJoueursEligiblesRenouvellement(
        @Param("teamId") BigDecimal teamId,
        @Param("regimeId") BigDecimal regimeId, 
        @Param("currentSeasonId") BigDecimal currentSeasonId,
        @Param("newSeasonId") BigDecimal newSeasonId
    );
    
    // Statistiques simples
    @Query("SELECT COUNT(d) FROM DemandePlayers d WHERE d.dateEnregistrement >= :fromDate")
    Long countCreatedAfter(@Param("fromDate") LocalDate fromDate);

    @Query("SELECT d.regimeId, COUNT(d) FROM DemandePlayers d GROUP BY d.regimeId")
    List<Object[]> countByRegime();

    @Query("SELECT d.typeLicenceId, COUNT(d) FROM DemandePlayers d GROUP BY d.typeLicenceId")
    List<Object[]> countByTypeLicence();

    @Query("SELECT d.demandeStatuId, COUNT(d) FROM DemandePlayers d GROUP BY d.demandeStatuId")
    List<Object[]> countByStatus();
    
    @Query(value = "SELECT COALESCE(MAX(ct_demande_id), 0) + 1 FROM sss_competition_db.ct_demandes", nativeQuery = true)
    BigDecimal getNextDemandeId();
    
 // ============================================================
 // MÉTHODES POUR LES VALIDATEURS
 // ============================================================

 /**
  * Compte les demandes par intervenant, équipe et saison avec statuts donnés
  * Utilisé par: DuplicateDemandeValidator
  */
 @Query("""
     SELECT COUNT(d) FROM DemandePlayers d 
     WHERE d.intervenantId = :intervenantId 
     AND d.teamId = :teamId 
     AND d.seasonId = :seasonId 
     AND d.demandeStatuId IN :statusIds
     """)
 Long countByIntervenantAndTeamAndSeasonAndStatus(
     @Param("intervenantId") BigDecimal intervenantId,
     @Param("teamId") BigDecimal teamId,
     @Param("seasonId") BigDecimal seasonId,
     @Param("statusIds") List<BigDecimal> statusIds
 );

 /**
  * Compte les demandes par CIN avec statuts donnés
  * Utilisé par: DuplicateDemandeValidator
  */
 @Query("""
     SELECT COUNT(d) FROM DemandePlayers d 
     WHERE d.cinNumber = :cinNumber 
     AND d.demandeStatuId IN :statusIds
     """)
 Long countByCinAndStatus(
     @Param("cinNumber") String cinNumber,
     @Param("statusIds") List<BigDecimal> statusIds
 );

 /**
  * Compte les demandes par passeport avec statuts donnés
  * Utilisé par: DuplicateDemandeValidator
  */
 @Query("""
     SELECT COUNT(d) FROM DemandePlayers d 
     WHERE d.passportNum = :passportNum 
     AND d.demandeStatuId IN :statusIds
     """)
 Long countByPassportAndStatus(
     @Param("passportNum") String passportNum,
     @Param("statusIds") List<BigDecimal> statusIds
 );

 /**
  * Compte les demandes par équipe, saison et statuts donnés
  * Utilisé par: PlayerQuotaValidator (quota total)
  */
 @Query("""
     SELECT COUNT(d) FROM DemandePlayers d 
     WHERE d.teamId = :teamId 
     AND d.seasonId = :seasonId 
     AND d.demandeStatuId IN :statusIds
     AND d.ctIntervenantTypeId = :intervenantTypeId
     """)
 Long countByTeamAndSeasonAndStatusAndType(
     @Param("teamId") BigDecimal teamId,
     @Param("seasonId") BigDecimal seasonId,
     @Param("statusIds") List<BigDecimal> statusIds,
     @Param("intervenantTypeId") BigDecimal intervenantTypeId
 );

 /**
  * Compte les demandes par équipe, saison, pays (différent de) et statuts
  * Utilisé par: PlayerQuotaValidator (quota étrangers)
  */
 @Query("""
     SELECT COUNT(d) FROM DemandePlayers d 
     WHERE d.teamId = :teamId 
     AND d.seasonId = :seasonId 
     AND d.paysId <> :paysId
     AND d.demandeStatuId IN :statusIds
     AND d.ctIntervenantTypeId = :intervenantTypeId
     """)
 Long countByTeamAndSeasonAndPaysNotAndStatus(
     @Param("teamId") BigDecimal teamId,
     @Param("seasonId") BigDecimal seasonId,
     @Param("paysId") BigDecimal paysId,
     @Param("statusIds") List<BigDecimal> statusIds,
     @Param("intervenantTypeId") BigDecimal intervenantTypeId
 );

 /**
  * Compte les demandes par équipe, saison, régimes et statuts
  * Utilisé par: PlayerQuotaValidator (quota professionnels)
  */
 @Query("""
     SELECT COUNT(d) FROM DemandePlayers d 
     WHERE d.teamId = :teamId 
     AND d.seasonId = :seasonId 
     AND d.regimeId IN :regimeIds
     AND d.demandeStatuId IN :statusIds
     AND d.ctIntervenantTypeId = :intervenantTypeId
     """)
 Long countByTeamAndSeasonAndRegimesAndStatus(
     @Param("teamId") BigDecimal teamId,
     @Param("seasonId") BigDecimal seasonId,
     @Param("regimeIds") List<BigDecimal> regimeIds,
     @Param("statusIds") List<BigDecimal> statusIds,
     @Param("intervenantTypeId") BigDecimal intervenantTypeId
 );

 /**
  * Recherche de doublon par nom, prénom, date de naissance et saison
  * Utilisé par: DuplicateDemandeValidator (pour les jeunes sans CIN)
  */
 @Query("""
     SELECT COUNT(d) FROM DemandePlayers d 
     WHERE d.name = :name 
     AND d.lastName = :lastName 
     AND d.dateOfBirth = :dateOfBirth
     AND d.seasonId = :seasonId
     AND d.demandeStatuId IN :statusIds
     """)
 Long countByNameAndBirthDateAndSeasonAndStatus(
     @Param("name") String name,
     @Param("lastName") String lastName,
     @Param("dateOfBirth") LocalDate dateOfBirth,
     @Param("seasonId") BigDecimal seasonId,
     @Param("statusIds") List<BigDecimal> statusIds
 );
 
 /**
  * Compter par équipe et saison (utilise l'index composite)
  */
 @Query("SELECT COUNT(d) FROM DemandePlayers d WHERE d.teamId = :teamId AND d.seasonId = :seasonId")
 Long countByTeamIdAndSeasonId(
     @Param("teamId") BigDecimal teamId, 
     @Param("seasonId") BigDecimal seasonId
 );
 
 /**
  * Compter par équipe, saison et statut
  */
 @Query("SELECT COUNT(d) FROM DemandePlayers d " +
        "WHERE d.teamId = :teamId AND d.seasonId = :seasonId AND d.demandeStatuId = :statusId")
 Long countByTeamIdAndSeasonIdAndStatus(
     @Param("teamId") BigDecimal teamId,
     @Param("seasonId") BigDecimal seasonId,
     @Param("statusId") BigDecimal statusId
 );
 
 /**
  * Compter par équipe, saison et catégorie
  */
 @Query("SELECT COUNT(d) FROM DemandePlayers d " +
        "WHERE d.teamId = :teamId AND d.seasonId = :seasonId AND d.playerCategoryId = :categoryId")
 Long countByTeamIdAndSeasonIdAndCategory(
     @Param("teamId") BigDecimal teamId,
     @Param("seasonId") BigDecimal seasonId,
     @Param("categoryId") BigDecimal categoryId
 );
 
 /**
  * Trouver avec pagination optimisée (projection)
  */
 @Query("SELECT d.demandeId, d.name, d.lastName, d.dateOfBirth, d.demandeStatuId, d.licenceNum " +
        "FROM DemandePlayers d " +
        "WHERE d.teamId = :teamId AND d.seasonId = :seasonId " +
        "ORDER BY d.dateEnregistrement DESC")
 Page<Object[]> findByTeamIdAndSeasonIdProjected(
     @Param("teamId") BigDecimal teamId,
     @Param("seasonId") BigDecimal seasonId,
     Pageable pageable
 );
}
