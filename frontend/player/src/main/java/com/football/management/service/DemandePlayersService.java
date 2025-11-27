package com.football.management.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;
import com.football.management.service.validation.ValidationResult;

import com.football.management.dto.DemandePlayersDTO;
import com.football.management.entity.DemandePlayers;
import com.football.management.repository.DemandePlayersRepository;
import com.football.management.mapper.DemandePlayersMapper;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DemandePlayersService {

    @Autowired
    private DemandePlayersRepository demandePlayersRepository;
    
    @Autowired
    private DemandePlayersMapper demandePlayersMapper;
    
    @Autowired
    private com.football.management.repository.TeamRepository teamRepository;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    


    // ========== MÉTHODES DE CONVERSION ==========
    
    private BigDecimal toBigDecimal(Long value) {
        return value != null ? new BigDecimal(value) : null;
    }

    private BigDecimal convertToBigDecimal(Object value) {
        return convertToBigDecimal(value, null);
    }

    private BigDecimal convertToBigDecimal(Object value, BigDecimal defaultValue) {
        if (value == null) return defaultValue;
        
        try {
            if (value instanceof BigDecimal) return (BigDecimal) value;
            if (value instanceof Long) return toBigDecimal((Long) value);
            if (value instanceof Integer) return new BigDecimal((Integer) value);
            if (value instanceof String) {
                String str = ((String) value).trim();
                return !str.isEmpty() ? new BigDecimal(str) : defaultValue;
            }
            if (value instanceof Double) return BigDecimal.valueOf((Double) value);
            if (value instanceof Float) return BigDecimal.valueOf(((Float) value).doubleValue());
            return defaultValue;
        } catch (NumberFormatException e) {
            System.err.println("Impossible de convertir en BigDecimal: " + value);
            return defaultValue;
        }
    }

    // ========== MÉTHODES CRUD DE BASE ==========

    public Page<DemandePlayersDTO> searchDemandes(
            Long demandeId, Long demandeStatuId, Long teamId, Long seasonId,
            String lastName, String name, String licenceNum, String cinNumber,
            Long regimeId, Long typeLicenceId, Long ctIntervenantTypeId, 
            Pageable pageable) {

        Page<DemandePlayers> entities = demandePlayersRepository.findByCriteria(
                toBigDecimal(demandeId), toBigDecimal(demandeStatuId), 
                toBigDecimal(teamId), toBigDecimal(seasonId),
                lastName, name, licenceNum, cinNumber,
                toBigDecimal(regimeId), toBigDecimal(typeLicenceId),
                toBigDecimal(ctIntervenantTypeId), pageable);

        return entities.map(demandePlayersMapper::toDTO);
    }

    public DemandePlayersDTO getById(Long id) {
        Optional<DemandePlayers> entity = demandePlayersRepository.findById(toBigDecimal(id));
        if (entity.isPresent()) {
            DemandePlayersDTO dto = demandePlayersMapper.toDTO(entity.get());
            
            // Ajouter le nom de l'équipe
            if (dto.getTeamId() != null) {
                Optional<com.football.management.entity.Team> team = teamRepository.findById(dto.getTeamId());
                if (team.isPresent()) {
                    dto.setTeamName(team.get().getName());
                }
            }
            return dto;
        }
        throw new RuntimeException("Demande non trouvée avec l'ID: " + id);
    }

    public List<DemandePlayersDTO> getDemandesByTeamAndSeason(Long teamId, Long seasonId) {
        List<DemandePlayers> entities = demandePlayersRepository.findByTeamIdAndSeasonId(
                toBigDecimal(teamId), toBigDecimal(seasonId));
        return demandePlayersMapper.toDTOList(entities);
    }

    public List<DemandePlayersDTO> getRenewalCandidates(Long teamId, Long seasonId) {
        List<DemandePlayers> entities = demandePlayersRepository.findRenewalCandidates(
                toBigDecimal(teamId), toBigDecimal(seasonId));
        return demandePlayersMapper.toDTOList(entities);
    }

    
    
    public DemandePlayersDTO createDemande(DemandePlayersDTO demandeDTO, Long userId) {
    	

    	
    	
        DemandePlayers entity = demandePlayersMapper.toEntity(demandeDTO);
        
        // ✅ GÉNÉRER L'ID AUTOMATIQUEMENT
        BigDecimal newId = demandePlayersRepository.getNextDemandeId();
        entity.setDemandeId(newId);
        
        entity.setDateEnregistrement(LocalDate.now());
        
        // S'assurer que le statut est défini
        if (entity.getDemandeStatuId() == null) {
            entity.setDemandeStatuId(BigDecimal.ONE);
        }
        
        DemandePlayers savedEntity = demandePlayersRepository.save(entity);
        return demandePlayersMapper.toDTO(savedEntity);
    }

    public DemandePlayersDTO updateDemande(Long id, DemandePlayersDTO demandeDTO, Long userId) {
        Optional<DemandePlayers> existingEntity = demandePlayersRepository.findById(toBigDecimal(id));
        
        if (existingEntity.isPresent()) {
            DemandePlayers entity = existingEntity.get();
            demandePlayersMapper.updateEntityFromDTO(demandeDTO, entity);
            DemandePlayers savedEntity = demandePlayersRepository.save(entity);
            return demandePlayersMapper.toDTO(savedEntity);
        }
        throw new RuntimeException("Demande non trouvée avec l'ID: " + id);
    }

    public void deleteDemande(Long id) {
        if (!demandePlayersRepository.existsById(toBigDecimal(id))) {
            throw new RuntimeException("Demande non trouvée avec l'ID: " + id);
        }
        demandePlayersRepository.deleteById(toBigDecimal(id));
    }

    public DemandePlayersDTO changeStatus(Long id, Long statusId, Long userId) {
        Optional<DemandePlayers> existingEntity = demandePlayersRepository.findById(toBigDecimal(id));
        
        if (existingEntity.isPresent()) {
            DemandePlayers entity = existingEntity.get();
            entity.setDemandeStatuId(toBigDecimal(statusId));
            DemandePlayers savedEntity = demandePlayersRepository.save(entity);
            return demandePlayersMapper.toDTO(savedEntity);
        }
        throw new RuntimeException("Demande non trouvée avec l'ID: " + id);
    }

    // ========== MÉTHODES DE RECHERCHE ==========

    public Optional<DemandePlayersDTO> getByLicenceNum(String licenceNum) {
        Optional<DemandePlayers> entity = demandePlayersRepository.findByLicenceNum(licenceNum);
        return entity.map(demandePlayersMapper::toDTO);
    }

    public Optional<DemandePlayersDTO> getByCinNumber(String cinNumber) {
        Optional<DemandePlayers> entity = demandePlayersRepository.findByCinNumber(cinNumber);
        return entity.map(demandePlayersMapper::toDTO);
    }

    public List<DemandePlayersDTO> getAllByStatus(Long statusId) {
        List<DemandePlayers> entities = demandePlayersRepository.findByDemandeStatuId(toBigDecimal(statusId));
        return demandePlayersMapper.toDTOList(entities);
    }

    // ========== MÉTHODES DE COMPTAGE ==========

    public Long countDemandes(Long teamId, Long seasonId, String licenceNum,
            String cinNumber, Long typeLicenceId, Long regimeId, 
            Long ctIntervenantTypeId) {
        return demandePlayersRepository.countByAttributes(
            toBigDecimal(teamId), toBigDecimal(seasonId), licenceNum, cinNumber,
            toBigDecimal(typeLicenceId), toBigDecimal(regimeId), 
            toBigDecimal(ctIntervenantTypeId));
    }

    public Long countCreatedAfter(LocalDate fromDate) {
        return demandePlayersRepository.countCreatedAfter(fromDate);
    }

    public Long countDemandesByTeamSeasonAndStatus(Long teamId, Long seasonId, Long statusId) {
        return demandePlayersRepository.countByTeamIdAndSeasonIdAndDemandeStatuId(
            toBigDecimal(teamId), toBigDecimal(seasonId), toBigDecimal(statusId));
    }

    
    public DemandePlayersDTO createNouveauJoueur(DemandePlayersDTO demandeDTO, Long userId) {
        validateNouveauJoueur(demandeDTO);
        
        DemandePlayers entity = new DemandePlayers();
        
        // Générer l'ID
        BigDecimal newId = demandePlayersRepository.getNextDemandeId();
        entity.setDemandeId(newId);
        
        // Informations personnelles
        entity.setName(demandeDTO.getName() != null ? demandeDTO.getName().toUpperCase() : null);
        entity.setLastName(demandeDTO.getLastName() != null ? demandeDTO.getLastName().toUpperCase() : null);
        entity.setAlias(demandeDTO.getAlias());
        entity.setDateOfBirth(demandeDTO.getDateOfBirth());
        entity.setPlaceOfBirth(demandeDTO.getPlaceOfBirth());
        
        // Documents
        entity.setCinNumber(demandeDTO.getCinNumber());
        entity.setCinNumberParent(demandeDTO.getCinNumberParent());
        entity.setPassportNum(demandeDTO.getPassportNum());
        entity.setLicenceNum(demandeDTO.getLicenceNum());
        
        // Informations géographiques et sportives
        entity.setPaysId(convertToBigDecimal(demandeDTO.getPaysId()));
        entity.setTeamId(convertToBigDecimal(demandeDTO.getTeamId()));
        entity.setSeasonId(convertToBigDecimal(demandeDTO.getSeasonId()));
        entity.setRegimeId(convertToBigDecimal(demandeDTO.getRegimeId()));
        entity.setPositionId(convertToBigDecimal(demandeDTO.getPositionId()));
        entity.setFeetId(convertToBigDecimal(demandeDTO.getFeetId()));
        entity.setTypeCompetitionId(convertToBigDecimal(demandeDTO.getTypeCompetitionId()));
        
        // Calcul automatique de la catégorie
        BigDecimal calculatedCategory = calculatePlayerCategoryByAge(demandeDTO.getDateOfBirth());
        entity.setPlayerCategoryId(calculatedCategory);
        
        entity.setTshirtNum(convertToBigDecimal(demandeDTO.getTshirtNum()));
        entity.setWeight(convertToBigDecimal(demandeDTO.getWeight(), BigDecimal.ZERO));
        entity.setHeight(convertToBigDecimal(demandeDTO.getHeight(), BigDecimal.ZERO));
        
        // Informations contractuelles
        entity.setContractDate(demandeDTO.getContractDate());
        entity.setContractDateFin(demandeDTO.getContractDateFin());
        entity.setDureePret(convertToBigDecimal(demandeDTO.getDureePret()));
        entity.setContratStatus(demandeDTO.getContratStatus());
        
        // Informations médicales
        entity.setNameDoctor(demandeDTO.getNameDoctor());
        entity.setLastNameDoctor(demandeDTO.getLastNameDoctor());
        entity.setDateConsultationDoctor(demandeDTO.getDateConsultationDoctor());
        
        // Informations administratives
        entity.setIntervenantId(convertToBigDecimal(demandeDTO.getIntervenantId()));
        entity.setCommissionId(convertToBigDecimal(demandeDTO.getCommissionId()));
        entity.setCtIntervenantTypeId(convertToBigDecimal(demandeDTO.getCtIntervenantTypeId(), BigDecimal.valueOf(1)));
        entity.setEtatCivilId(convertToBigDecimal(demandeDTO.getEtatCivilId()));
        
        // Informations bancaires
        entity.setTeamCoorBancaireId(convertToBigDecimal(demandeDTO.getTeamCoorBancaireId()));
        entity.setTeamSaison1CoorBancaireId(convertToBigDecimal(demandeDTO.getTeamSaison1CoorBancaireId()));
        entity.setSaison1Id(convertToBigDecimal(demandeDTO.getSaison1Id()));
        
        // Flags et statuts
        entity.setIsDemission(demandeDTO.getIsDemission());
        // ✅ SUPPRIMÉ : entity.setIsChild() - c'est une méthode calculée !
        
        // Configuration pour nouveau joueur
        entity.setTypeLicenceId(BigDecimal.ONE);
        entity.setDemandeStatuId(BigDecimal.ONE);
        entity.setDateEnregistrement(LocalDate.now());
        
        try {
            DemandePlayers savedEntity = demandePlayersRepository.save(entity);
            return demandePlayersMapper.toDTO(savedEntity);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'enregistrement: " + e.getMessage(), e);
        }
    }

    public DemandePlayersDTO createRenouvellement(Long previousDemandeId, Long newSeasonId, Long userId) {
        Optional<DemandePlayers> previousDemande = demandePlayersRepository.findById(toBigDecimal(previousDemandeId));
        
        if (!previousDemande.isPresent()) {
            throw new RuntimeException("Demande précédente non trouvée avec l'ID: " + previousDemandeId);
        }
        
        DemandePlayers previousEntity = previousDemande.get();
        DemandePlayers newEntity = new DemandePlayers();
        
        // Générer nouvel ID
        BigDecimal newId = demandePlayersRepository.getNextDemandeId();
        newEntity.setDemandeId(newId);
        
        // Copier les informations du joueur précédent
        copyPlayerInfoForRenewal(previousEntity, newEntity);
        
        // Configuration pour renouvellement
        newEntity.setSeasonId(toBigDecimal(newSeasonId));
        newEntity.setTypeLicenceId(BigDecimal.valueOf(2)); // RENOUVELLEMENT
        newEntity.setDemandeStatuId(BigDecimal.ONE);
        newEntity.setDateEnregistrement(LocalDate.now());
        
        // Recalculer la catégorie selon l'âge actuel
        BigDecimal categoryId = calculatePlayerCategoryByAge(previousEntity.getDateOfBirth());
        newEntity.setPlayerCategoryId(categoryId);
        
        DemandePlayers savedEntity = demandePlayersRepository.save(newEntity);
        return demandePlayersMapper.toDTO(savedEntity);
    }

    // ========== MÉTHODES UTILITAIRES PRIVÉES ==========

    private BigDecimal calculatePlayerCategoryByAge(LocalDate dateOfBirth) {
        if (dateOfBirth == null) {
            return BigDecimal.valueOf(7); // SENIORS par défaut
        }
        
        int year = dateOfBirth.getYear();
        
        // Logique basée sur ct_param_category
        if (year >= 2017) return BigDecimal.valueOf(9); // CP (2017-2018)
        if (year >= 2015) return BigDecimal.valueOf(1); // BENJAMINS (2015-2016)
        if (year >= 2013) return BigDecimal.valueOf(2); // ECOLES (2013-2014)
        if (year >= 2011) return BigDecimal.valueOf(3); // MINIMES (2011-2012)
        if (year >= 2009) return BigDecimal.valueOf(4); // CADETS (2009-2010)
        if (year >= 2007) return BigDecimal.valueOf(5); // JUNIORS (2007-2008)
        if (year >= 2005) return BigDecimal.valueOf(6); // ELITE (2005-2006)
        
        return BigDecimal.valueOf(7); // SENIORS (avant 2005)
    }

    private void validateNouveauJoueur(DemandePlayersDTO demandeDTO) {
        if (demandeDTO.getName() == null || demandeDTO.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Le nom est obligatoire");
        }
        if (demandeDTO.getLastName() == null || demandeDTO.getLastName().trim().isEmpty()) {
            throw new IllegalArgumentException("Le prénom est obligatoire");
        }
        if (demandeDTO.getDateOfBirth() == null) {
            throw new IllegalArgumentException("La date de naissance est obligatoire");
        }
        if (demandeDTO.getPaysId() == null) {
            throw new IllegalArgumentException("La nationalité est obligatoire");
        }
        
        // Vérifier CIN pour majeurs
        LocalDate birthDate = demandeDTO.getDateOfBirth();
        int age = LocalDate.now().getYear() - birthDate.getYear();
        if (age >= 18 && (demandeDTO.getCinNumber() == null || demandeDTO.getCinNumber().trim().isEmpty())) {
            throw new IllegalArgumentException("Le numéro CIN est obligatoire pour les joueurs majeurs");
        }
    }

    private void copyPlayerInfoForRenewal(DemandePlayers source, DemandePlayers target) {
        // Informations personnelles
        target.setName(source.getName());
        target.setLastName(source.getLastName());
        target.setDateOfBirth(source.getDateOfBirth());
        target.setPlaceOfBirth(source.getPlaceOfBirth());
        target.setPaysId(source.getPaysId());
        target.setCinNumber(source.getCinNumber());
        target.setPassportNum(source.getPassportNum());
        target.setCinNumberParent(source.getCinNumberParent());
        
        // Informations sportives
        target.setTeamId(source.getTeamId());
        target.setRegimeId(source.getRegimeId());
        target.setPositionId(source.getPositionId());
        target.setFeetId(source.getFeetId());
        target.setTypeCompetitionId(source.getTypeCompetitionId());
        target.setCtIntervenantTypeId(source.getCtIntervenantTypeId());
        
        // Informations physiques
        target.setWeight(source.getWeight());
        target.setHeight(source.getHeight());
        target.setTshirtNum(source.getTshirtNum());
        
        // Informations administratives
        target.setIntervenantId(source.getIntervenantId());
    }

    // ========== MÉTHODES STATISTIQUES ==========

    public List<Map<String, Object>> getRegimeStatistics() {
        List<Object[]> results = demandePlayersRepository.countByRegime();
        return results.stream()
            .map(result -> {
                Map<String, Object> stat = new HashMap<>();
                stat.put("regimeId", result[0]);
                stat.put("count", result[1]);
                if (result[0] != null) {
                    BigDecimal regimeId = (BigDecimal) result[0];
                    stat.put("label", getRegimeLabel(regimeId));
                }
                return stat;
            })
            .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getTypeLicenceStatistics() {
        List<Object[]> results = demandePlayersRepository.countByTypeLicence();
        return results.stream()
            .map(result -> {
                Map<String, Object> stat = new HashMap<>();
                stat.put("typeLicenceId", result[0]);
                stat.put("count", result[1]);
                if (result[0] != null) {
                    BigDecimal typeId = (BigDecimal) result[0];
                    stat.put("label", getTypeLicenceLabel(typeId));
                }
                return stat;
            })
            .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getStatusStatistics() {
        List<Object[]> results = demandePlayersRepository.countByStatus();
        return results.stream()
            .map(result -> {
                Map<String, Object> stat = new HashMap<>();
                stat.put("statusId", result[0]);
                stat.put("count", result[1]);
                if (result[0] != null) {
                    BigDecimal statusId = (BigDecimal) result[0];
                    stat.put("label", getStatusLabel(statusId));
                }
                return stat;
            })
            .collect(Collectors.toList());
    }

    public Map<String, Object> getTeamSeasonStats(Long teamId, Long seasonId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalDemandes", countDemandes(teamId, seasonId, null, null, null, null, null));
        stats.put("enAttente", countDemandesByTeamSeasonAndStatus(teamId, seasonId, 1L));
        stats.put("validees", countDemandesByTeamSeasonAndStatus(teamId, seasonId, 8L));
        stats.put("imprimees", countDemandesByTeamSeasonAndStatus(teamId, seasonId, 9L));
        return stats;
    }

    public List<Map<String, Object>> getJoueursEligiblesRenouvellement(Long teamId, Long regimeId, Long currentSeasonId) {
        try {
            String sql = """
                SELECT 
                    i.ct_intervenant_id as id,
                    i.name as nom, 
                    i.last_name as prenom,
                    i.licence_num as licenceNum,
                    ti.ct_team_id as teamId,
                    MAX(ti.ct_season_id) as seasonId,
                    ti.ct_regime_id as regimeId
                FROM sss_competition_db.ct_intervenants i 
                INNER JOIN sss_competition_db.ct_team_intervenants ti ON i.ct_intervenant_id = ti.ct_intervenant_id 
                WHERE ti.ct_team_id = ? AND ti.ct_intervenant_type_id = 1
                GROUP BY i.ct_intervenant_id, i.name, i.last_name, i.licence_num, ti.ct_team_id, ti.ct_regime_id
                ORDER BY i.last_name, i.name
                """;
            
            List<Object[]> results = jdbcTemplate.query(sql,
                (rs, rowNum) -> new Object[] {
                    rs.getBigDecimal("id"),
                    rs.getString("nom"),
                    rs.getString("prenom"),
                    rs.getString("licenceNum"),
                    rs.getBigDecimal("teamId"),
                    rs.getBigDecimal("seasonId"),
                    rs.getBigDecimal("regimeId")
                },
                toBigDecimal(teamId));
            
            return results.stream()
                .map(row -> {
                    Map<String, Object> joueur = new HashMap<>();
                    joueur.put("id", row[0] != null ? row[0] : 0);
                    joueur.put("nom", row[1] != null ? row[1] : "Nom masqué");
                    joueur.put("prenom", row[2] != null ? row[2] : "Prénom masqué");
                    joueur.put("licenceNum", row[3] != null ? row[3] : "Licence masquée");
                    joueur.put("teamId", row[4]);
                    joueur.put("seasonId", row[5]);
                    joueur.put("regimeId", row[6] != null ? row[6] : 1);
                    return joueur;
                })
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            System.err.println("ERREUR: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    // ========== MÉTHODES UTILITAIRES POUR LABELS ==========

    private String getRegimeLabel(BigDecimal regimeId) {
        if (regimeId == null) return "Non défini";
        int id = regimeId.intValue();
        switch (id) {
            case 1: return "Amateur";
            case 2: return "Professionnel";
            case 3: return "Semi-Professionnel";
            case 4: return "Stagiaire";
            case 5: return "CP";
            default: return "Régime " + id;
        }
    }

    private String getTypeLicenceLabel(BigDecimal typeLicenceId) {
        if (typeLicenceId == null) return "Non défini";
        int id = typeLicenceId.intValue();
        switch (id) {
            case 1: return "Nouvelle";
            case 2: return "Renouvellement";
            case 3: return "Transfert National";
            case 4: return "Transfert International";
            case 5: return "Prêt";
            case 6: return "Renouvellement Spécial";
            default: return "Type " + id;
        }
    }

    private String getStatusLabel(BigDecimal statusId) {
        if (statusId == null) return "Non défini";
        int id = statusId.intValue();
        switch (id) {
            case 1: return "En attente";
            case 2: return "En cours";
            case 8: return "Validée par club";
            case 9: return "Imprimée";
            case 10: return "Rejetée";
            default: return "Statut " + id;
        }
    }
}