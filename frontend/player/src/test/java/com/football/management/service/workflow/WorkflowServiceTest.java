package com.football.management.service.workflow;

import com.football.management.dto.DemandePlayersDTO;
import com.football.management.entity.DemandePlayers;
import com.football.management.entity.StatusHistory;
import com.football.management.enums.DemandeStatus;
import com.football.management.mapper.DemandePlayersMapper;
import com.football.management.repository.DemandePlayersRepository;
import com.football.management.repository.StatusHistoryRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests WorkflowService - Gestion des transitions d'états")
class WorkflowServiceTest {

    @Mock
    private DemandePlayersRepository demandeRepository;

    @Mock
    private StatusHistoryRepository historyRepository;

    @Mock
    private DemandePlayersMapper mapper;

    @InjectMocks
    private WorkflowService workflowService;

    private DemandePlayers demande;
    private DemandePlayersDTO demandeDTO;

    @BeforeEach
    void setUp() {
        // Préparer une demande de test
        demande = new DemandePlayers();
        demande.setDemandeId(BigDecimal.valueOf(123));
        demande.setName("TEST");
        demande.setLastName("Workflow");
        demande.setDemandeStatuId(BigDecimal.valueOf(1)); // INITIAL

        demandeDTO = new DemandePlayersDTO();
        demandeDTO.setDemandeId(BigDecimal.valueOf(123));
        demandeDTO.setName("TEST");
        demandeDTO.setLastName("Workflow");
    }

    // ==================== TESTS TRANSITIONS VALIDES ====================

    @Test
    @DisplayName("Transition valide : INITIAL → EN_ATTENTE")
    void testChangeStatus_InitialToEnAttente_ShouldSucceed() {
        // Given
        demande.setDemandeStatuId(DemandeStatus.INITIAL.getBigDecimalId());
        
        when(demandeRepository.findById(BigDecimal.valueOf(123L)))
                .thenReturn(Optional.of(demande));
        when(demandeRepository.save(any(DemandePlayers.class)))
                .thenReturn(demande);
        when(mapper.toDTO(any(DemandePlayers.class)))
                .thenReturn(demandeDTO);
        when(historyRepository.save(any(StatusHistory.class)))
                .thenReturn(new StatusHistory());

        // When
        DemandePlayersDTO result = workflowService.changeStatus(
            123L, 
            DemandeStatus.EN_ATTENTE.getId(), 
            1L, 
            "Mise en traitement"
        );

        // Then
        assertNotNull(result);
        verify(demandeRepository).save(any(DemandePlayers.class));
        verify(historyRepository).save(any(StatusHistory.class));
    }

    @Test
    @DisplayName("Transition valide : EN_ATTENTE → VALIDEE_CLUB")
    void testChangeStatus_EnAttenteToValidee_ShouldSucceed() {
        // Given
        demande.setDemandeStatuId(DemandeStatus.EN_ATTENTE.getBigDecimalId());
        
        when(demandeRepository.findById(BigDecimal.valueOf(123L)))
                .thenReturn(Optional.of(demande));
        when(demandeRepository.save(any(DemandePlayers.class)))
                .thenReturn(demande);
        when(mapper.toDTO(any(DemandePlayers.class)))
                .thenReturn(demandeDTO);

        // When
        DemandePlayersDTO result = workflowService.changeStatus(
            123L, 
            DemandeStatus.VALIDEE_CLUB.getId(), 
            1L, 
            "Validation OK"
        );

        // Then
        assertNotNull(result);
        verify(demandeRepository).save(demande);
        verify(historyRepository).save(any(StatusHistory.class));
    }

    @Test
    @DisplayName("Transition valide : VALIDEE_CLUB → IMPRIMEE")
    void testChangeStatus_ValideeToImprimee_ShouldSucceed() {
        // Given
        demande.setDemandeStatuId(DemandeStatus.VALIDEE_CLUB.getBigDecimalId());
        
        when(demandeRepository.findById(BigDecimal.valueOf(123L)))
                .thenReturn(Optional.of(demande));
        when(demandeRepository.save(any(DemandePlayers.class)))
                .thenReturn(demande);
        when(mapper.toDTO(any(DemandePlayers.class)))
                .thenReturn(demandeDTO);

        // When
        DemandePlayersDTO result = workflowService.changeStatus(
            123L, 
            DemandeStatus.IMPRIMEE.getId(), 
            1L, 
            "Licence imprimée"
        );

        // Then
        assertNotNull(result);
        verify(demandeRepository).save(demande);
    }

    // ==================== TESTS TRANSITIONS INVALIDES ====================

    @Test
    @DisplayName("Transition invalide : IMPRIMEE → INITIAL (état final)")
    void testChangeStatus_ImprimeeToInitial_ShouldFail() {
        // Given
        demande.setDemandeStatuId(DemandeStatus.IMPRIMEE.getBigDecimalId());
        
        when(demandeRepository.findById(BigDecimal.valueOf(123L)))
                .thenReturn(Optional.of(demande));

        // When & Then
        IllegalStateException exception = assertThrows(
            IllegalStateException.class,
            () -> workflowService.changeStatus(
                123L, 
                DemandeStatus.INITIAL.getId(), 
                1L, 
                "Tentative invalide"
            )
        );

        assertTrue(exception.getMessage().contains("état final"));
        verify(demandeRepository, never()).save(any());
        verify(historyRepository, never()).save(any());
    }

    @Test
    @DisplayName("Transition invalide : INITIAL → IMPRIMEE (saut d'étapes)")
    void testChangeStatus_InitialToImprimee_ShouldFail() {
        // Given
        demande.setDemandeStatuId(DemandeStatus.INITIAL.getBigDecimalId());
        
        when(demandeRepository.findById(BigDecimal.valueOf(123L)))
                .thenReturn(Optional.of(demande));

        // When & Then
        IllegalStateException exception = assertThrows(
            IllegalStateException.class,
            () -> workflowService.changeStatus(
                123L, 
                DemandeStatus.IMPRIMEE.getId(), 
                1L, 
                "Tentative de saut"
            )
        );

        assertTrue(exception.getMessage().contains("non autorisée"));
        verify(demandeRepository, never()).save(any());
    }

    @Test
    @DisplayName("Transition invalide : REJETEE → VALIDEE_CLUB")
    void testChangeStatus_RejeteeToValidee_ShouldFail() {
        // Given
        demande.setDemandeStatuId(DemandeStatus.REJETEE.getBigDecimalId());
        
        when(demandeRepository.findById(BigDecimal.valueOf(123L)))
                .thenReturn(Optional.of(demande));

        // When & Then
        IllegalStateException exception = assertThrows(
            IllegalStateException.class,
            () -> workflowService.changeStatus(
                123L, 
                DemandeStatus.VALIDEE_CLUB.getId(), 
                1L, 
                "Tentative invalide"
            )
        );

        assertTrue(exception.getMessage().contains("non autorisée"));
    }

    // ==================== TESTS MÉTHODES RACCOURCIES ====================

    @Test
    @DisplayName("validateDemande() - Doit changer vers VALIDEE_CLUB")
    void testValidateDemande_ShouldChangeToValidee() {
        // Given
        demande.setDemandeStatuId(DemandeStatus.EN_ATTENTE.getBigDecimalId());
        
        when(demandeRepository.findById(BigDecimal.valueOf(123L)))
                .thenReturn(Optional.of(demande));
        when(demandeRepository.save(any(DemandePlayers.class)))
                .thenReturn(demande);
        when(mapper.toDTO(any(DemandePlayers.class)))
                .thenReturn(demandeDTO);

        // When
        DemandePlayersDTO result = workflowService.validateDemande(
            123L, 
            1L, 
            "Validation rapide"
        );

        // Then
        assertNotNull(result);
        
        // Vérifier que le statut a été changé vers VALIDEE_CLUB (2)
        ArgumentCaptor<DemandePlayers> captor = ArgumentCaptor.forClass(DemandePlayers.class);
        verify(demandeRepository).save(captor.capture());
        assertEquals(DemandeStatus.VALIDEE_CLUB.getBigDecimalId(), 
                     captor.getValue().getDemandeStatuId());
    }

    @Test
    @DisplayName("rejectDemande() - Doit changer vers REJETEE")
    void testRejectDemande_ShouldChangeToRejetee() {
        // Given
        demande.setDemandeStatuId(DemandeStatus.INITIAL.getBigDecimalId());
        
        when(demandeRepository.findById(BigDecimal.valueOf(123L)))
                .thenReturn(Optional.of(demande));
        when(demandeRepository.save(any(DemandePlayers.class)))
                .thenReturn(demande);
        when(mapper.toDTO(any(DemandePlayers.class)))
                .thenReturn(demandeDTO);

        // When
        DemandePlayersDTO result = workflowService.rejectDemande(
            123L, 
            1L, 
            "Documents incomplets"
        );

        // Then
        assertNotNull(result);
        
        ArgumentCaptor<DemandePlayers> captor = ArgumentCaptor.forClass(DemandePlayers.class);
        verify(demandeRepository).save(captor.capture());
        assertEquals(DemandeStatus.REJETEE.getBigDecimalId(), 
                     captor.getValue().getDemandeStatuId());
    }

    @Test
    @DisplayName("markAsPrinted() - Doit changer vers IMPRIMEE")
    void testMarkAsPrinted_ShouldChangeToImprimee() {
        // Given
        demande.setDemandeStatuId(DemandeStatus.VALIDEE_CLUB.getBigDecimalId());
        
        when(demandeRepository.findById(BigDecimal.valueOf(123L)))
                .thenReturn(Optional.of(demande));
        when(demandeRepository.save(any(DemandePlayers.class)))
                .thenReturn(demande);
        when(mapper.toDTO(any(DemandePlayers.class)))
                .thenReturn(demandeDTO);

        // When
        DemandePlayersDTO result = workflowService.markAsPrinted(123L, 1L);

        // Then
        assertNotNull(result);
        
        ArgumentCaptor<DemandePlayers> captor = ArgumentCaptor.forClass(DemandePlayers.class);
        verify(demandeRepository).save(captor.capture());
        assertEquals(DemandeStatus.IMPRIMEE.getBigDecimalId(), 
                     captor.getValue().getDemandeStatuId());
    }

    // ==================== TESTS HISTORIQUE ====================

    @Test
    @DisplayName("changeStatus() - Doit enregistrer dans l'historique")
    void testChangeStatus_ShouldSaveHistory() {
        // Given
        demande.setDemandeStatuId(DemandeStatus.INITIAL.getBigDecimalId());
        
        when(demandeRepository.findById(BigDecimal.valueOf(123L)))
                .thenReturn(Optional.of(demande));
        when(demandeRepository.save(any(DemandePlayers.class)))
                .thenReturn(demande);
        when(mapper.toDTO(any(DemandePlayers.class)))
                .thenReturn(demandeDTO);

        // When
        workflowService.changeStatus(
            123L, 
            DemandeStatus.EN_ATTENTE.getId(), 
            1L, 
            "Test historique"
        );

        // Then
        ArgumentCaptor<StatusHistory> captor = ArgumentCaptor.forClass(StatusHistory.class);
        verify(historyRepository).save(captor.capture());
        
        StatusHistory savedHistory = captor.getValue();
        assertEquals(BigDecimal.valueOf(123), savedHistory.getDemandeId());
        assertEquals(DemandeStatus.INITIAL.getBigDecimalId(), savedHistory.getOldStatusId());
        assertEquals(DemandeStatus.EN_ATTENTE.getBigDecimalId(), savedHistory.getNewStatusId());
        assertEquals("Test historique", savedHistory.getComment());
        assertEquals(1L, savedHistory.getChangedBy());
    }

    @Test
    @DisplayName("getStatusHistory() - Doit retourner l'historique")
    void testGetStatusHistory_ShouldReturnHistory() {
        // Given
        StatusHistory history1 = new StatusHistory(
            BigDecimal.valueOf(123),
            DemandeStatus.INITIAL.getBigDecimalId(),
            DemandeStatus.EN_ATTENTE.getBigDecimalId(),
            1L
        );
        history1.setComment("Premier changement");
        
        StatusHistory history2 = new StatusHistory(
            BigDecimal.valueOf(123),
            DemandeStatus.EN_ATTENTE.getBigDecimalId(),
            DemandeStatus.VALIDEE_CLUB.getBigDecimalId(),
            1L
        );
        history2.setComment("Validation");
        
        // L'historique est retourné du plus récent au plus ancien
        when(historyRepository.findByDemandeId(BigDecimal.valueOf(123)))
                .thenReturn(Arrays.asList(history2, history1));

        // When
        List<Map<String, Object>> result = workflowService.getStatusHistory(123L);

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        
        // ✅ CORRIGÉ : Premier élément = plus récent
        assertEquals("Validée par club", result.get(0).get("newStatus"));
        assertEquals("En attente", result.get(1).get("newStatus"));
    }
    @Test
    @DisplayName("getAvailableTransitions() - Doit retourner transitions possibles")
    void testGetAvailableTransitions_ShouldReturnAllowedStates() {
        // Given
        demande.setDemandeStatuId(DemandeStatus.INITIAL.getBigDecimalId());
        
        when(demandeRepository.findById(BigDecimal.valueOf(123L)))
                .thenReturn(Optional.of(demande));

        // When
        Map<String, Object> result = workflowService.getAvailableTransitions(123L);

        // Then
        assertNotNull(result);
        assertTrue(result.containsKey("currentStatus"));
        assertTrue(result.containsKey("allowedTransitions"));
        
        @SuppressWarnings("unchecked")
        Map<String, Object> currentStatus = (Map<String, Object>) result.get("currentStatus");
        assertEquals("Initial", currentStatus.get("libelle"));
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> transitions = (List<Map<String, Object>>) result.get("allowedTransitions");
        assertEquals(3, transitions.size()); // EN_ATTENTE, VALIDEE_CLUB, REJETEE
    }

    // ==================== TESTS ERREURS ====================

    @Test
    @DisplayName("changeStatus() - Demande inexistante doit lever exception")
    void testChangeStatus_DemandeNotFound_ShouldThrowException() {
        // Given
        when(demandeRepository.findById(BigDecimal.valueOf(999L)))
                .thenReturn(Optional.empty());

        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> workflowService.changeStatus(999L, 2L, 1L, "Test")
        );

        assertTrue(exception.getMessage().contains("non trouvée"));
    }

    @Test
    @DisplayName("changeStatus() - Statut invalide doit lever exception")
    void testChangeStatus_InvalidStatus_ShouldThrowException() {
        // Given
        demande.setDemandeStatuId(DemandeStatus.INITIAL.getBigDecimalId());
        
        when(demandeRepository.findById(BigDecimal.valueOf(123L)))
                .thenReturn(Optional.of(demande));

        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> workflowService.changeStatus(123L, 999L, 1L, "Test")
        );

        assertTrue(exception.getMessage().contains("invalide"));
    }

    @Test
    @DisplayName("Transition même état - Doit réussir sans changement")
    void testChangeStatus_SameStatus_ShouldSucceed() {
        // Given
        demande.setDemandeStatuId(DemandeStatus.INITIAL.getBigDecimalId());
        
        when(demandeRepository.findById(BigDecimal.valueOf(123L)))
                .thenReturn(Optional.of(demande));
        when(demandeRepository.save(any(DemandePlayers.class)))
                .thenReturn(demande);
        when(mapper.toDTO(any(DemandePlayers.class)))
                .thenReturn(demandeDTO);

        // When
        DemandePlayersDTO result = workflowService.changeStatus(
            123L, 
            DemandeStatus.INITIAL.getId(), 
            1L, 
            "Même état"
        );

        // Then
        assertNotNull(result);
        verify(demandeRepository).save(any());
        verify(historyRepository).save(any());
    }
}