package com.football.management.mapper;

import org.springframework.stereotype.Component;
import com.football.management.dto.DemandePlayersDTO;
import com.football.management.entity.DemandePlayers;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class DemandePlayersMapper {

    public DemandePlayersDTO toDTO(DemandePlayers entity) {
        if (entity == null) {
            return null;
        }

        DemandePlayersDTO dto = new DemandePlayersDTO();
        dto.setDemandeId(entity.getDemandeId());
        dto.setDemandeStatuId(entity.getDemandeStatuId());
        dto.setEtatCivilId(entity.getEtatCivilId());
        dto.setAlias(entity.getAlias());
        dto.setLastName(entity.getLastName());
        dto.setName(entity.getName());
        dto.setPaysId(entity.getPaysId());
        dto.setTeamId(entity.getTeamId());
        dto.setSeasonId(entity.getSeasonId());
        dto.setPlayerCategoryId(entity.getPlayerCategoryId());
        dto.setRegimeId(entity.getRegimeId());
        dto.setTypeLicenceId(entity.getTypeLicenceId());
        dto.setLicenceNum(entity.getLicenceNum());
        dto.setCinNumber(entity.getCinNumber());
        dto.setCinNumberParent(entity.getCinNumberParent());
        dto.setPassportNum(entity.getPassportNum());
        dto.setDateOfBirth(entity.getDateOfBirth());
        dto.setContractDate(entity.getContractDate());
        dto.setContractDateFin(entity.getContractDateFin());
        dto.setDureePret(entity.getDureePret());
        dto.setContratStatus(entity.getContratStatus());
        dto.setIsDemission(entity.getIsDemission());
        dto.setSaison1Id(entity.getSaison1Id());
        dto.setTeamCoorBancaireId(entity.getTeamCoorBancaireId());
        dto.setTeamSaison1CoorBancaireId(entity.getTeamSaison1CoorBancaireId());
        dto.setPositionId(entity.getPositionId());
        dto.setFeetId(entity.getFeetId());
        dto.setTypeCompetitionId(entity.getTypeCompetitionId());
        dto.setIntervenantId(entity.getIntervenantId());
        dto.setCtIntervenantTypeId(entity.getCtIntervenantTypeId());
        
        // ✅ isChild est calculé automatiquement par l'entité
        dto.setIsChild(entity.getIsChild());

        // Ajout des champs manquants
        dto.setPlaceOfBirth(entity.getPlaceOfBirth());
        dto.setWeight(entity.getWeight());
        dto.setHeight(entity.getHeight());
        dto.setCommissionId(entity.getCommissionId());
        dto.setDateEnregistrement(entity.getDateEnregistrement());

        // Champs de compatibilité
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setUpdatedBy(entity.getUpdatedBy());

        dto.setNameDoctor(entity.getNameDoctor());
        dto.setLastNameDoctor(entity.getLastNameDoctor());
        dto.setDateConsultationDoctor(entity.getDateConsultationDoctor());
        dto.setTshirtNum(entity.getTshirtNum());
        dto.setEmail(entity.getEmail());


        // Gérer la relation avec Pays
        try {
            if (entity.getPays() != null) {
                dto.setPaysLibelle(entity.getPays().getLibelle());
            }
        } catch (Exception e) {
            System.out.println("Pays non chargé pour la demande: " + entity.getDemandeId());
        }

        // Toujours setter l'ID
        dto.setPaysId(entity.getPaysId());

        return dto;
    }

    public DemandePlayers toEntity(DemandePlayersDTO dto) {
        if (dto == null) {
            return null;
        }

        DemandePlayers entity = new DemandePlayers();
        entity.setDemandeId(dto.getDemandeId());
        entity.setDemandeStatuId(dto.getDemandeStatuId());
        entity.setEtatCivilId(dto.getEtatCivilId());
        entity.setAlias(dto.getAlias());
        entity.setLastName(dto.getLastName());
        entity.setName(dto.getName());
        entity.setPaysId(dto.getPaysId());
        entity.setTeamId(dto.getTeamId());
        entity.setSeasonId(dto.getSeasonId());
        entity.setPlayerCategoryId(dto.getPlayerCategoryId());
        entity.setRegimeId(dto.getRegimeId());
        entity.setTypeLicenceId(dto.getTypeLicenceId());
        entity.setLicenceNum(dto.getLicenceNum());
        entity.setCinNumber(dto.getCinNumber());
        entity.setCinNumberParent(dto.getCinNumberParent());
        entity.setPassportNum(dto.getPassportNum());
        entity.setDateOfBirth(dto.getDateOfBirth());
        entity.setContractDate(dto.getContractDate());
        entity.setContractDateFin(dto.getContractDateFin());
        entity.setDureePret(dto.getDureePret());
        entity.setContratStatus(dto.getContratStatus());
        entity.setIsDemission(dto.getIsDemission());
        entity.setSaison1Id(dto.getSaison1Id());
        entity.setTeamCoorBancaireId(dto.getTeamCoorBancaireId());
        entity.setTeamSaison1CoorBancaireId(dto.getTeamSaison1CoorBancaireId());
        entity.setPositionId(dto.getPositionId());
        entity.setFeetId(dto.getFeetId());
        entity.setTypeCompetitionId(dto.getTypeCompetitionId());
        entity.setIntervenantId(dto.getIntervenantId());
        // ✅ SUPPRIMÉ : entity.setIsChild() - c'est calculé automatiquement !
        entity.setCtIntervenantTypeId(dto.getCtIntervenantTypeId());
        
        // Ajout des champs manquants
        entity.setPlaceOfBirth(dto.getPlaceOfBirth());
        entity.setWeight(dto.getWeight());
        entity.setHeight(dto.getHeight());
        entity.setCommissionId(dto.getCommissionId());
        entity.setDateEnregistrement(dto.getDateEnregistrement());

        entity.setNameDoctor(dto.getNameDoctor());
        entity.setLastNameDoctor(dto.getLastNameDoctor());
        entity.setDateConsultationDoctor(dto.getDateConsultationDoctor());
        entity.setTshirtNum(dto.getTshirtNum());
        entity.setEmail(dto.getEmail());


        return entity;
    }

    public void updateEntityFromDTO(DemandePlayersDTO dto, DemandePlayers entity) {
        if (dto == null || entity == null) {
            return;
        }

        // Ne pas modifier l'ID de la demande
        entity.setDemandeStatuId(dto.getDemandeStatuId());
        entity.setEtatCivilId(dto.getEtatCivilId());
        entity.setAlias(dto.getAlias());
        entity.setLastName(dto.getLastName());
        entity.setName(dto.getName());
        entity.setPaysId(dto.getPaysId());
        entity.setTeamId(dto.getTeamId());
        entity.setSeasonId(dto.getSeasonId());
        entity.setPlayerCategoryId(dto.getPlayerCategoryId());
        entity.setRegimeId(dto.getRegimeId());
        entity.setTypeLicenceId(dto.getTypeLicenceId());
        entity.setLicenceNum(dto.getLicenceNum());
        entity.setCinNumber(dto.getCinNumber());
        entity.setCinNumberParent(dto.getCinNumberParent());
        entity.setPassportNum(dto.getPassportNum());
        entity.setDateOfBirth(dto.getDateOfBirth());
        entity.setContractDate(dto.getContractDate());
        entity.setContractDateFin(dto.getContractDateFin());
        entity.setDureePret(dto.getDureePret());
        entity.setContratStatus(dto.getContratStatus());
        entity.setIsDemission(dto.getIsDemission());
        entity.setSaison1Id(dto.getSaison1Id());
        entity.setTeamCoorBancaireId(dto.getTeamCoorBancaireId());
        entity.setTeamSaison1CoorBancaireId(dto.getTeamSaison1CoorBancaireId());
        entity.setPositionId(dto.getPositionId());
        entity.setFeetId(dto.getFeetId());
        entity.setTypeCompetitionId(dto.getTypeCompetitionId());
        entity.setIntervenantId(dto.getIntervenantId());
        // ✅ SUPPRIMÉ : entity.setIsChild() - c'est calculé automatiquement !
        entity.setCtIntervenantTypeId(dto.getCtIntervenantTypeId());

        entity.setNameDoctor(dto.getNameDoctor());
        entity.setLastNameDoctor(dto.getLastNameDoctor());
        entity.setDateConsultationDoctor(dto.getDateConsultationDoctor());
        entity.setTshirtNum(dto.getTshirtNum());
        entity.setEmail(dto.getEmail());


        // Ajout des champs manquants
        entity.setPlaceOfBirth(dto.getPlaceOfBirth());
        entity.setWeight(dto.getWeight());
        entity.setHeight(dto.getHeight());
        entity.setCommissionId(dto.getCommissionId());

        // La date d'enregistrement ne devrait pas être modifiée lors des mises à jour
        if (dto.getDateEnregistrement() != null) {
            entity.setDateEnregistrement(dto.getDateEnregistrement());
        }
    }

    public List<DemandePlayersDTO> toDTOList(List<DemandePlayers> entities) {
        if (entities == null) {
            return null;
        }
        return entities.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<DemandePlayers> toEntityList(List<DemandePlayersDTO> dtos) {
        if (dtos == null) {
            return null;
        }
        return dtos.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());
    }
}