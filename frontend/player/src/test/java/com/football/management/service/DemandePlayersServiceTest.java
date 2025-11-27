package com.football.management.service;

import com.football.management.dto.DemandePlayersDTO;
import com.football.management.entity.DemandePlayers;
import com.football.management.entity.Team;
import com.football.management.mapper.DemandePlayersMapper;
import com.football.management.repository.DemandePlayersRepository;
import com.football.management.repository.TeamRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests DemandePlayersService - Logique métier")
class DemandePlayersServiceTest {

    @Mock
    private DemandePlayersRepository demandePlayersRepository;

    @Mock
    private DemandePlayersMapper demandePlayersMapper;

    @Mock
    private TeamRepository teamRepository; // ✅ AJOUTÉ

    @InjectMocks
    private DemandePlayersService demandePlayersService;

    private DemandePlayersDTO demandeDTO;
    private DemandePlayers demandeEntity;
    private Team team;

    @BeforeEach
    void setUp() {
        // Préparer un DTO de test
        demandeDTO = new DemandePlayersDTO();
        demandeDTO.setName("DUPONT");
        demandeDTO.setLastName("Jean");
        demandeDTO.setDateOfBirth(LocalDate.of(2010, 10, 10));
        demandeDTO.setPaysId(BigDecimal.valueOf(193));
        demandeDTO.setTeamId(BigDecimal.valueOf(102));
        demandeDTO.setSeasonId(BigDecimal.valueOf(2025));
        demandeDTO.setRegimeId(BigDecimal.valueOf(1));
        demandeDTO.setTypeLicenceId(BigDecimal.valueOf(1));

        // Préparer une entité de test
        demandeEntity = new DemandePlayers();
        demandeEntity.setDemandeId(BigDecimal.valueOf(123));
        demandeEntity.setName("DUPONT");
        demandeEntity.setLastName("Jean");
        demandeEntity.setTeamId(BigDecimal.valueOf(102));

        // Préparer une équipe de test
        team = new Team();
        team.setTeamId(BigDecimal.valueOf(102));
        team.setName("Espérance Sportive de Tunis");
    }

    @Test
    @DisplayName("Récupérer une demande existante par ID")
    void testGetById_ExistingDemande_ShouldReturnDTO() {
        // Given
        Long demandeId = 123L;
        when(demandePlayersRepository.findById(BigDecimal.valueOf(demandeId)))
                .thenReturn(Optional.of(demandeEntity));
        when(demandePlayersMapper.toDTO(demandeEntity))
                .thenReturn(demandeDTO);
        when(teamRepository.findById(BigDecimal.valueOf(102)))
                .thenReturn(Optional.of(team)); // ✅ AJOUTÉ

        // When
        DemandePlayersDTO result = demandePlayersService.getById(demandeId);

        // Then
        assertNotNull(result);
        assertEquals("DUPONT", result.getName());
        assertEquals("Jean", result.getLastName());
        verify(demandePlayersRepository).findById(BigDecimal.valueOf(demandeId));
        verify(demandePlayersMapper).toDTO(demandeEntity);
    }

    @Test
    @DisplayName("Récupérer une demande inexistante - Doit lever une exception")
    void testGetById_NonExistingDemande_ShouldThrowException() {
        // Given
        Long demandeId = 999L;
        when(demandePlayersRepository.findById(BigDecimal.valueOf(demandeId)))
                .thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> demandePlayersService.getById(demandeId));
        
        assertTrue(exception.getMessage().contains("non trouvée"));
        verify(demandePlayersRepository).findById(BigDecimal.valueOf(demandeId));
    }

    @Test
    @DisplayName("Créer une nouvelle demande - Doit générer un ID")
    void testCreateDemande_ShouldGenerateId() {
        // Given
        BigDecimal generatedId = BigDecimal.valueOf(456);
        when(demandePlayersRepository.getNextDemandeId()).thenReturn(generatedId);
        when(demandePlayersMapper.toEntity(demandeDTO)).thenReturn(demandeEntity);
        when(demandePlayersRepository.save(any(DemandePlayers.class))).thenReturn(demandeEntity);
        when(demandePlayersMapper.toDTO(demandeEntity)).thenReturn(demandeDTO);

        // When
        DemandePlayersDTO result = demandePlayersService.createDemande(demandeDTO, 1L);

        // Then
        assertNotNull(result);
        verify(demandePlayersRepository).getNextDemandeId();
        verify(demandePlayersRepository).save(any(DemandePlayers.class));
    }

    @Test
    @DisplayName("Mettre à jour une demande existante")
    void testUpdateDemande_ExistingDemande_ShouldUpdate() {
        // Given
        Long demandeId = 123L;
        when(demandePlayersRepository.findById(BigDecimal.valueOf(demandeId)))
                .thenReturn(Optional.of(demandeEntity));
        when(demandePlayersRepository.save(demandeEntity)).thenReturn(demandeEntity);
        when(demandePlayersMapper.toDTO(demandeEntity)).thenReturn(demandeDTO);
        doNothing().when(demandePlayersMapper).updateEntityFromDTO(demandeDTO, demandeEntity);

        // When
        DemandePlayersDTO result = demandePlayersService.updateDemande(demandeId, demandeDTO, 1L);

        // Then
        assertNotNull(result);
        verify(demandePlayersRepository).findById(BigDecimal.valueOf(demandeId));
        verify(demandePlayersMapper).updateEntityFromDTO(demandeDTO, demandeEntity);
        verify(demandePlayersRepository).save(demandeEntity);
    }

    @Test
    @DisplayName("Supprimer une demande existante")
    void testDeleteDemande_ExistingDemande_ShouldDelete() {
        // Given
        Long demandeId = 123L;
        when(demandePlayersRepository.existsById(BigDecimal.valueOf(demandeId)))
                .thenReturn(true);
        doNothing().when(demandePlayersRepository).deleteById(BigDecimal.valueOf(demandeId));

        // When
        demandePlayersService.deleteDemande(demandeId);

        // Then
        verify(demandePlayersRepository).existsById(BigDecimal.valueOf(demandeId));
        verify(demandePlayersRepository).deleteById(BigDecimal.valueOf(demandeId));
    }

    @Test
    @DisplayName("Supprimer une demande inexistante - Doit lever une exception")
    void testDeleteDemande_NonExistingDemande_ShouldThrowException() {
        // Given
        Long demandeId = 999L;
        when(demandePlayersRepository.existsById(BigDecimal.valueOf(demandeId)))
                .thenReturn(false);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
            () -> demandePlayersService.deleteDemande(demandeId));
        
        assertTrue(exception.getMessage().contains("non trouvée"));
        verify(demandePlayersRepository).existsById(BigDecimal.valueOf(demandeId));
        verify(demandePlayersRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("Changer le statut d'une demande")
    void testChangeStatus_ShouldUpdateStatus() {
        // Given
        Long demandeId = 123L;
        Long newStatusId = 8L; // VALIDÉE
        
        when(demandePlayersRepository.findById(BigDecimal.valueOf(demandeId)))
                .thenReturn(Optional.of(demandeEntity));
        when(demandePlayersRepository.save(demandeEntity)).thenReturn(demandeEntity);
        when(demandePlayersMapper.toDTO(demandeEntity)).thenReturn(demandeDTO);

        // When
        DemandePlayersDTO result = demandePlayersService.changeStatus(demandeId, newStatusId, 1L);

        // Then
        assertNotNull(result);
        verify(demandePlayersRepository).findById(BigDecimal.valueOf(demandeId));
        verify(demandePlayersRepository).save(demandeEntity);
    }

    @Test
    @DisplayName("Créer nouveau joueur Cadet avec tous les champs requis")
    void testCreateNouveauJoueur_Cadet_ShouldSucceed() {
        // Given - Joueur Cadet (né en 2010)
        DemandePlayersDTO demande = new DemandePlayersDTO();
        demande.setName("TEST");
        demande.setLastName("Cadet");
        demande.setDateOfBirth(LocalDate.of(2010, 5, 15));
        demande.setPaysId(BigDecimal.valueOf(193));
        demande.setCinNumber("12345678"); // ✅ CIN fourni pour Cadet
        
        BigDecimal generatedId = BigDecimal.valueOf(999);
        when(demandePlayersRepository.getNextDemandeId()).thenReturn(generatedId);
        
        DemandePlayers savedEntity = new DemandePlayers();
        savedEntity.setDemandeId(generatedId);
        savedEntity.setName("TEST");
        savedEntity.setLastName("Cadet");
        savedEntity.setPlayerCategoryId(BigDecimal.valueOf(4)); // CADETS
        
        when(demandePlayersRepository.save(any(DemandePlayers.class))).thenReturn(savedEntity);
        
        DemandePlayersDTO savedDTO = new DemandePlayersDTO();
        savedDTO.setDemandeId(generatedId);
        savedDTO.setPlayerCategoryId(BigDecimal.valueOf(4));
        when(demandePlayersMapper.toDTO(savedEntity)).thenReturn(savedDTO);

        // When
        DemandePlayersDTO result = demandePlayersService.createNouveauJoueur(demande, 1L);

        // Then
        assertNotNull(result);
        assertEquals(BigDecimal.valueOf(4), result.getPlayerCategoryId());
        verify(demandePlayersRepository).getNextDemandeId();
        verify(demandePlayersRepository).save(any(DemandePlayers.class));
    }

    @Test
    @DisplayName("Créer nouveau joueur Senior avec CIN obligatoire")
    void testCreateNouveauJoueur_Senior_WithCIN_ShouldSucceed() {
        // Given - Joueur Senior (né en 2000) avec CIN
        DemandePlayersDTO demande = new DemandePlayersDTO();
        demande.setName("TEST");
        demande.setLastName("Senior");
        demande.setDateOfBirth(LocalDate.of(2000, 5, 15));
        demande.setPaysId(BigDecimal.valueOf(193));
        demande.setCinNumber("12345678"); // ✅ CIN OBLIGATOIRE pour majeur
        
        BigDecimal generatedId = BigDecimal.valueOf(999);
        when(demandePlayersRepository.getNextDemandeId()).thenReturn(generatedId);
        
        DemandePlayers savedEntity = new DemandePlayers();
        savedEntity.setDemandeId(generatedId);
        savedEntity.setName("TEST");
        savedEntity.setLastName("Senior");
        savedEntity.setPlayerCategoryId(BigDecimal.valueOf(7)); // SENIORS
        
        when(demandePlayersRepository.save(any(DemandePlayers.class))).thenReturn(savedEntity);
        
        DemandePlayersDTO savedDTO = new DemandePlayersDTO();
        savedDTO.setDemandeId(generatedId);
        savedDTO.setPlayerCategoryId(BigDecimal.valueOf(7));
        when(demandePlayersMapper.toDTO(savedEntity)).thenReturn(savedDTO);

        // When
        DemandePlayersDTO result = demandePlayersService.createNouveauJoueur(demande, 1L);

        // Then
        assertNotNull(result);
        assertEquals(BigDecimal.valueOf(7), result.getPlayerCategoryId());
        verify(demandePlayersRepository).getNextDemandeId();
        verify(demandePlayersRepository).save(any(DemandePlayers.class));
    }

    @Test
    @DisplayName("Créer nouveau joueur Senior SANS CIN - Doit échouer")
    void testCreateNouveauJoueur_Senior_WithoutCIN_ShouldFail() {
        // Given - Joueur Senior SANS CIN
        DemandePlayersDTO demande = new DemandePlayersDTO();
        demande.setName("TEST");
        demande.setLastName("Senior");
        demande.setDateOfBirth(LocalDate.of(2000, 5, 15));
        demande.setPaysId(BigDecimal.valueOf(193));
        demande.setCinNumber(null); // ❌ CIN manquant

        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> demandePlayersService.createNouveauJoueur(demande, 1L)
        );
        
        assertTrue(exception.getMessage().contains("CIN est obligatoire"));
    }

    @Test
    @DisplayName("Validation champs obligatoires - Nom manquant")
    void testValidateNouveauJoueur_MissingName_ShouldFail() {
        // Given
        DemandePlayersDTO demande = new DemandePlayersDTO();
        demande.setName(null); // ❌ Nom manquant
        demande.setLastName("Test");
        demande.setDateOfBirth(LocalDate.of(2010, 5, 15));
        demande.setPaysId(BigDecimal.valueOf(193));

        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> demandePlayersService.createNouveauJoueur(demande, 1L)
        );
        
        assertTrue(exception.getMessage().contains("nom est obligatoire"));
    }

    @Test
    @DisplayName("Validation champs obligatoires - Prénom manquant")
    void testValidateNouveauJoueur_MissingLastName_ShouldFail() {
        // Given
        DemandePlayersDTO demande = new DemandePlayersDTO();
        demande.setName("Test");
        demande.setLastName(null); // ❌ Prénom manquant
        demande.setDateOfBirth(LocalDate.of(2010, 5, 15));
        demande.setPaysId(BigDecimal.valueOf(193));

        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> demandePlayersService.createNouveauJoueur(demande, 1L)
        );
        
        assertTrue(exception.getMessage().contains("prénom est obligatoire"));
    }
}