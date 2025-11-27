package com.football.management.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import java.time.LocalDate;
import java.util.Map;
import com.football.management.service.validation.RenewalValidator;

import com.football.management.service.validation.ValidationResult;
import com.football.management.service.validation.CinPassportValidator;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ContentDisposition;

import com.football.management.dto.DemandePlayersDTO;
import com.football.management.service.DemandePlayersService;
import com.football.management.service.PdfGenerationService;
import com.football.management.service.validation.ValidationOrchestrator;

//========== IMPORTS SWAGGER/OPENAPI (AJOUTEZ CES LIGNES) ==========
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;

import java.util.HashMap; // AJOUTER CET IMPORT

import com.football.management.service.workflow.WorkflowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import com.football.management.entity.NotificationHistory;
import com.football.management.repository.NotificationHistoryRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.Period;

import java.util.List;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/demandes-players")
//@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Demandes de Licences", description = "Gestion complète des demandes de licences pour les joueurs de football")
public class DemandePlayersController {

	private static final Logger logger = LoggerFactory.getLogger(DemandePlayersController.class);

	@Autowired
	private DemandePlayersService demandePlayersService;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Autowired
	private ValidationOrchestrator validationOrchestrator;

	@Autowired
	private WorkflowService workflowService;

	// ✅ AJOUTER CETTE LIGNE
	@Autowired
	private CinPassportValidator cinPassportValidator;

	@Autowired
	private NotificationHistoryRepository notificationHistoryRepository;
	
	@Autowired
	private PdfGenerationService pdfGenerationService;
	
	@Autowired
	private RenewalValidator renewalValidator;

	/**
	 * Recherche des demandes avec critères et pagination
	 */
	@GetMapping

	@Operation(summary = "Rechercher des demandes", description = "Recherche des demandes avec filtres multiples (équipe, saison, nom, CIN, etc.) et pagination")
	@ApiResponses({ @ApiResponse(responseCode = "200", description = "Liste des demandes retournée avec succès"),
			@ApiResponse(responseCode = "500", description = "Erreur serveur") })
	public ResponseEntity<Page<DemandePlayersDTO>> searchDemandes(@RequestParam(required = false) Long demandeId,
			@RequestParam(required = false) Long demandeStatuId, @RequestParam(required = false) Long teamId,
			@RequestParam(required = false) Long seasonId, @RequestParam(required = false) String lastName,
			@RequestParam(required = false) String name, @RequestParam(required = false) String licenceNum,
			@RequestParam(required = false) String cinNumber, @RequestParam(required = false) Long regimeId,
			@RequestParam(required = false) Long typeLicenceId,
			@RequestParam(required = false) Long ctIntervenantTypeId, // Nouveau paramètre ajouté
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
			@RequestParam(defaultValue = "dateEnregistrement") String sortBy,
			@RequestParam(defaultValue = "desc") String sortDir) {

		try {
			Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;

			Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

			Page<DemandePlayersDTO> result = demandePlayersService.searchDemandes(demandeId, demandeStatuId, teamId,
					seasonId, lastName, name, licenceNum, cinNumber, regimeId, typeLicenceId, ctIntervenantTypeId,
					pageable); // Paramètre passé au service

			return ResponseEntity.ok(result);

		} catch (Exception e) {
			e.printStackTrace(); // Pour debug - à retirer en production
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	/**
	 * Obtenir une demande par ID
	 */
	@GetMapping("/{id:[0-9]+}")  // ⬅️ AJOUTEZ :[0-9]+ ICI


	@Operation(summary = "Récupérer une demande par ID", description = "Retourne les détails complets d'une demande de licence avec toutes les informations du joueur")
	@ApiResponses({
			@ApiResponse(responseCode = "200", description = "Demande trouvée avec succès", content = @Content(schema = @Schema(implementation = DemandePlayersDTO.class))),
			@ApiResponse(responseCode = "404", description = "Demande non trouvée") })
	public ResponseEntity<DemandePlayersDTO> getDemandeById(@PathVariable Long id) {
		try {
			DemandePlayersDTO demande = demandePlayersService.getById(id);
			return ResponseEntity.ok(demande);
		} catch (RuntimeException e) {
			return ResponseEntity.notFound().build();
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	/**
	 * Obtenir les demandes par équipe et saison
	 */
	@GetMapping("/team/{teamId}/season/{seasonId}")
	public ResponseEntity<List<DemandePlayersDTO>> getDemandesByTeamAndSeason(@PathVariable Long teamId,
			@PathVariable Long seasonId) {
		try {
			List<DemandePlayersDTO> demandes = demandePlayersService.getDemandesByTeamAndSeason(teamId, seasonId);
			return ResponseEntity.ok(demandes);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	/**
	 * Obtenir les candidats pour renouvellement
	 */
	@GetMapping("/renewals/team/{teamId}/season/{seasonId}")
	public ResponseEntity<List<DemandePlayersDTO>> getRenewalCandidates(@PathVariable Long teamId,
			@PathVariable Long seasonId) {
		try {
			List<DemandePlayersDTO> candidates = demandePlayersService.getRenewalCandidates(teamId, seasonId);
			return ResponseEntity.ok(candidates);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	/**
	 * Créer une nouvelle demande
	 */
	@PostMapping
	@Operation(summary = "Créer une nouvelle demande de licence", description = "Crée une demande avec validation complète : CIN/Passeport, quotas équipe, dates médicales, détection doublons")
	@ApiResponses({
			@ApiResponse(responseCode = "201", description = "Demande créée avec succès", content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "Succès avec exception Cadet", value = """
					{
					    "success": true,
					    "demande": {
					        "demandeId": 981532,
					        "name": "DUPONT",
					        "lastName": "Jean",
					        "dateOfBirth": "2010-10-10"
					    },
					    "warnings": [
					        "Joueur bénéficie de l'exception Cadet (né entre 01/09/2010 et 31/12/2010)"
					    ]
					}
					"""))),
			@ApiResponse(responseCode = "400", description = "Erreur de validation", content = @Content(mediaType = "application/json", examples = {
					@ExampleObject(name = "CIN manquant", value = """
							{
							    "success": false,
							    "errors": ["N° CIN obligatoire à partir de la catégorie cadets pour les joueurs tunisiens"]
							}
							"""),
					@ExampleObject(name = "Quota atteint", value = """
							{
							    "success": false,
							    "errors": ["Nombre maximum de joueurs atteint pour cette équipe (80)"]
							}
							""") })) })
	public ResponseEntity<?> createDemande(
			@io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Données complètes de la demande", required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = DemandePlayersDTO.class), examples = {
					@ExampleObject(name = "Joueur avec exception Cadet (sans CIN)", description = "Joueur né entre 01/09/2010 et 31/12/2010 bénéficiant de l'exception Cadet", value = """
							{
							    "name": "DUPONT",
							    "lastName": "Jean",
							    "dateOfBirth": "2010-10-10",
							    "paysId": 193,
							    "teamId": 102,
							    "seasonId": 2025,
							    "regimeId": 1,
							    "typeLicenceId": 1,
							    "nameDoctor": "Dr. GHARBI",
							    "lastNameDoctor": "Amira",
							    "dateConsultationDoctor": "2025-10-10",
							    "ctIntervenantTypeId": 1
							}
							"""),
					@ExampleObject(name = "Joueur avec CIN", description = "Joueur standard avec CIN obligatoire", value = """
							{
							    "name": "BEN AHMED",
							    "lastName": "Mohamed",
							    "dateOfBirth": "2005-03-15",
							    "paysId": 193,
							    "cinNumber": "12345678",
							    "teamId": 102,
							    "seasonId": 2025,
							    "regimeId": 2,
							    "typeLicenceId": 1,
							    "positionId": 5,
							    "nameDoctor": "Dr. GHARBI",
							    "lastNameDoctor": "Amira",
							    "dateConsultationDoctor": "2025-10-10",
							    "ctIntervenantTypeId": 1
							}
							"""),
					@ExampleObject(name = "Joueur étranger avec passeport", description = "Joueur étranger nécessitant un passeport", value = """
							{
							    "name": "MARTIN",
							    "lastName": "Pierre",
							    "dateOfBirth": "2000-06-20",
							    "paysId": 75,
							    "passportNum": "FR123456",
							    "teamId": 102,
							    "seasonId": 2025,
							    "regimeId": 2,
							    "typeLicenceId": 4,
							    "nameDoctor": "Dr. MARTIN",
							    "lastNameDoctor": "Jacques",
							    "dateConsultationDoctor": "2025-10-10",
							    "ctIntervenantTypeId": 1
							}
							""") })) @RequestBody DemandePlayersDTO demandeDTO,

			@Parameter(description = "ID de l'utilisateur créateur", example = "1") @RequestParam(required = false, defaultValue = "1") Long userId) {
		try {
			// VALIDATION AVANT CRÉATION ⬅️ CETTE PARTIE DOIT ÊTRE PRÉSENTE
			var validationResult = validationOrchestrator.validateDemandeComplete(demandeDTO);

			if (!validationResult.isValid()) {
				Map<String, Object> errorResponse = new HashMap<>();
				errorResponse.put("success", false);
				errorResponse.put("errors", validationResult.getErrors());
				errorResponse.put("warnings", validationResult.getWarnings());
				return ResponseEntity.badRequest().body(errorResponse);
			}

			// Si validation OK, créer la demande
			DemandePlayersDTO createdDemande = demandePlayersService.createDemande(demandeDTO, userId);

			Map<String, Object> response = new HashMap<>();
			response.put("success", true);
			response.put("demande", createdDemande);

			if (!validationResult.getWarnings().isEmpty()) {
				response.put("warnings", validationResult.getWarnings());
			}

			return ResponseEntity.status(HttpStatus.CREATED).body(response);

		} catch (Exception e) {
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("success", false);
			errorResponse.put("error", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
		}
	}

	/**
	 * Mettre à jour une demande
	 */
	@PutMapping("/{id}")
	@Operation(summary = "Mettre à jour une demande", description = "Met à jour les informations d'une demande existante avec validation complète")
	@ApiResponses({ @ApiResponse(responseCode = "200", description = "Demande mise à jour avec succès"),
			@ApiResponse(responseCode = "400", description = "Erreur de validation"),
			@ApiResponse(responseCode = "404", description = "Demande non trouvée") })
	public ResponseEntity<?> updateDemande(
			@Parameter(description = "ID de la demande", required = true, example = "123") @PathVariable Long id,
			@RequestBody DemandePlayersDTO demandeDTO,
			@Parameter(description = "ID de l'utilisateur", example = "1") @RequestParam(required = false, defaultValue = "1") Long userId) {
		try {
			// VALIDATION AVANT MISE À JOUR
			var validationResult = validationOrchestrator.validateDemandeComplete(demandeDTO);

			if (!validationResult.isValid()) {
				Map<String, Object> errorResponse = new HashMap<>();
				errorResponse.put("success", false);
				errorResponse.put("errors", validationResult.getErrors());
				return ResponseEntity.badRequest().body(errorResponse);
			}

			DemandePlayersDTO updatedDemande = demandePlayersService.updateDemande(id, demandeDTO, userId);
			return ResponseEntity.ok(updatedDemande);

		} catch (RuntimeException e) {
			return ResponseEntity.notFound().build();
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	/**
	 * Supprimer une demande
	 */
	@DeleteMapping("/{id}")

	@Operation(summary = "Supprimer une demande", description = "Supprime définitivement une demande de licence")
	@ApiResponses({ @ApiResponse(responseCode = "204", description = "Demande supprimée avec succès"),
			@ApiResponse(responseCode = "404", description = "Demande non trouvée") })
	public ResponseEntity<Void> deleteDemande(
			@Parameter(description = "ID de la demande à supprimer", required = true, example = "123") @PathVariable Long id) {
		try {
			demandePlayersService.deleteDemande(id);
			return ResponseEntity.noContent().build();
		} catch (RuntimeException e) {
			return ResponseEntity.notFound().build();
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	/**
	 * Changer le statut d'une demande
	 */
	@PatchMapping("/{id}/status/{statusId}")
	@Operation(summary = "Changer le statut d'une demande", description = "Modifie le statut d'une demande (Ex: En attente → Validée)")
	@ApiResponses({ @ApiResponse(responseCode = "200", description = "Statut modifié avec succès"),
			@ApiResponse(responseCode = "404", description = "Demande non trouvée") })
	public ResponseEntity<DemandePlayersDTO> changeStatus(
			@Parameter(description = "ID de la demande", required = true, example = "123") @PathVariable Long id,

			@Parameter(description = "Nouveau statut (1=En attente, 8=Validée, 9=Imprimée)", required = true, example = "8") @PathVariable Long statusId,

			@Parameter(description = "ID de l'utilisateur", example = "1") @RequestParam(required = false, defaultValue = "1") Long userId) {
		try {
			DemandePlayersDTO updatedDemande = demandePlayersService.changeStatus(id, statusId, userId);
			return ResponseEntity.ok(updatedDemande);
		} catch (RuntimeException e) {
			return ResponseEntity.notFound().build();
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	/**
	 * Compter les demandes selon critères
	 */
	@GetMapping("/count")
	public ResponseEntity<Long> countDemandes(@RequestParam(required = false) Long teamId,
			@RequestParam(required = false) Long seasonId, @RequestParam(required = false) String licenceNum,
			@RequestParam(required = false) String cinNumber, @RequestParam(required = false) Long typeLicenceId,
			@RequestParam(required = false) Long regimeId, @RequestParam(required = false) Long ctIntervenantTypeId) { // ⬅️
																														// AJOUTÉ
		try {
			Long count = demandePlayersService.countDemandes(teamId, seasonId, licenceNum, cinNumber, typeLicenceId,
					regimeId, ctIntervenantTypeId); // ⬅️ AJOUTÉ
			return ResponseEntity.ok(count);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	/**
	 * Obtenir les demandes par statut
	 */
	@GetMapping("/status/{statusId}")
	public ResponseEntity<List<DemandePlayersDTO>> getDemandesByStatus(@PathVariable Long statusId) {
		try {
			List<DemandePlayersDTO> demandes = demandePlayersService.getAllByStatus(statusId);
			return ResponseEntity.ok(demandes);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	/**
	 * Rechercher par numéro de licence
	 */
	@GetMapping("/licence/{licenceNum}")
	public ResponseEntity<DemandePlayersDTO> getByLicenceNum(@PathVariable String licenceNum) {
		try {
			Optional<DemandePlayersDTO> demande = demandePlayersService.getByLicenceNum(licenceNum);
			return demande.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	/**
	 * Rechercher par numéro CIN
	 */
	@GetMapping("/cin/{cinNumber}")
	public ResponseEntity<DemandePlayersDTO> getByCinNumber(@PathVariable String cinNumber) {
		try {
			Optional<DemandePlayersDTO> demande = demandePlayersService.getByCinNumber(cinNumber);
			return demande.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	/**
	 * Rechercher un joueur par numéro de licence (pour pré-remplissage formulaire)
	 */
	@GetMapping("/search-by-licence/{licenceNum}")
	public ResponseEntity<Map<String, Object>> searchPlayerByLicence(@PathVariable String licenceNum) {
		try {
			String sql = """
					SELECT i.ct_intervenant_id, i.name, i.last_name, i.date_of_birth,
					       i.place_of_birth, i.cin_number, i.passport_num, i.cr_pays_id,
					       ti.ct_player_category_id
					FROM ct_intervenants i
					LEFT JOIN ct_team_intervenants ti ON i.ct_intervenant_id = ti.ct_intervenant_id
					WHERE i.licence_num = ?
					ORDER BY ti.ct_season_id DESC
					LIMIT 1
					""";

			List<Map<String, Object>> results = jdbcTemplate.query(sql, (rs, rowNum) -> {
				Map<String, Object> player = new HashMap<>();
				player.put("id", rs.getBigDecimal("ct_intervenant_id"));
				player.put("name", rs.getString("name"));
				player.put("lastName", rs.getString("last_name"));
				player.put("dateOfBirth", rs.getDate("date_of_birth"));
				player.put("placeOfBirth", rs.getString("place_of_birth"));
				player.put("cinNumber", rs.getString("cin_number"));
				player.put("passportNum", rs.getString("passport_num"));
				player.put("paysId", rs.getBigDecimal("cr_pays_id"));
				player.put("category", rs.getBigDecimal("ct_player_category_id"));
				return player;
			}, licenceNum);

			if (results.isEmpty()) {
				return ResponseEntity.notFound().build();
			}

			return ResponseEntity.ok(results.get(0));

		} catch (Exception e) {
			logger.error("Erreur lors de la recherche par licence", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	/**
	 * Créer une demande pour nouveau joueur
	 */
	@PostMapping("/nouveau-joueur")
	@Operation(summary = "Créer un nouveau joueur", description = "Crée une demande pour un tout nouveau joueur (première licence)")
	@ApiResponses({ @ApiResponse(responseCode = "201", description = "Joueur créé avec succès"),
			@ApiResponse(responseCode = "400", description = "Erreur de validation") })
	public ResponseEntity<?> createNouveauJoueur(@RequestBody DemandePlayersDTO demandeDTO,
			@Parameter(description = "ID de l'utilisateur", example = "1") @RequestParam(required = false, defaultValue = "1") Long userId) {
		try {
			// Validation CIN/Passeport
			ValidationResult validationResult = new ValidationResult();
			Long categoryId = calculateCategoryFromBirthDate(demandeDTO.getDateOfBirth());

			if (!cinPassportValidator.validate(demandeDTO, validationResult, categoryId)) {
				return ResponseEntity.badRequest()
						.body(Map.of("success", false, "errors", validationResult.getErrors()));
			}

			DemandePlayersDTO createdDemande = demandePlayersService.createNouveauJoueur(demandeDTO, userId);
			return ResponseEntity.status(HttpStatus.CREATED).body(createdDemande);

		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("success", false, "error", "Erreur serveur"));
		}
	}

	/**
	 * Créer une demande de prêt
	 */
	@PostMapping("/pret/joueur/{joueurId}")
	public ResponseEntity<?> createPret(@PathVariable BigDecimal joueurId, @RequestBody DemandePlayersDTO demandeDTO,
			@RequestParam(required = false, defaultValue = "1") Long userId) {
		try {
			demandeDTO.setIntervenantId(joueurId);
			demandeDTO.setTypeLicenceId(BigDecimal.valueOf(5)); // Type = PRÊT

			ValidationResult validationResult = new ValidationResult();
			Long categoryId = calculateCategoryFromBirthDate(demandeDTO.getDateOfBirth());

			if (!cinPassportValidator.validate(demandeDTO, validationResult, categoryId)) {
				return ResponseEntity.badRequest()
						.body(Map.of("success", false, "errors", validationResult.getErrors()));
			}

			DemandePlayersDTO createdDemande = demandePlayersService.createDemande(demandeDTO, userId);
			return ResponseEntity.status(HttpStatus.CREATED).body(createdDemande);

		} catch (Exception e) {
			logger.error("Erreur lors du prêt pour joueur {}", joueurId, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("success", false, "error", "Erreur serveur: " + e.getMessage()));
		}
	}

	/**
	 * Créer une demande de transfert
	 */
	@PostMapping("/transfert/joueur/{joueurId}")
	public ResponseEntity<?> createTransfert(@PathVariable BigDecimal joueurId,
			@RequestBody DemandePlayersDTO demandeDTO,
			@RequestParam(required = false, defaultValue = "1") Long userId) {
		try {
			demandeDTO.setIntervenantId(joueurId);
			demandeDTO.setTypeLicenceId(BigDecimal.valueOf(8)); // Type = TRANSFERT

			ValidationResult validationResult = new ValidationResult();
			Long categoryId = calculateCategoryFromBirthDate(demandeDTO.getDateOfBirth());

			if (!cinPassportValidator.validate(demandeDTO, validationResult, categoryId)) {
				return ResponseEntity.badRequest()
						.body(Map.of("success", false, "errors", validationResult.getErrors()));
			}

			DemandePlayersDTO createdDemande = demandePlayersService.createDemande(demandeDTO, userId);
			return ResponseEntity.status(HttpStatus.CREATED).body(createdDemande);

		} catch (Exception e) {
			logger.error("Erreur lors du transfert pour joueur {}", joueurId, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("success", false, "error", "Erreur serveur: " + e.getMessage()));
		}
	}

	/**
	 * Créer une demande de mutation
	 */
	@PostMapping("/mutation/joueur/{joueurId}")
	public ResponseEntity<?> createMutation(@PathVariable BigDecimal joueurId,
			@RequestBody DemandePlayersDTO demandeDTO,
			@RequestParam(required = false, defaultValue = "1") Long userId) {
		try {
			demandeDTO.setIntervenantId(joueurId);
			demandeDTO.setTypeLicenceId(BigDecimal.valueOf(4)); // Type = MUTATION

			ValidationResult validationResult = new ValidationResult();
			Long categoryId = calculateCategoryFromBirthDate(demandeDTO.getDateOfBirth());

			if (!cinPassportValidator.validate(demandeDTO, validationResult, categoryId)) {
				return ResponseEntity.badRequest()
						.body(Map.of("success", false, "errors", validationResult.getErrors()));
			}

			DemandePlayersDTO createdDemande = demandePlayersService.createDemande(demandeDTO, userId);
			return ResponseEntity.status(HttpStatus.CREATED).body(createdDemande);

		} catch (Exception e) {
			logger.error("Erreur lors de la mutation pour joueur {}", joueurId, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("success", false, "error", "Erreur serveur: " + e.getMessage()));
		}
	}

	/**
	 * Calcule la catégorie d'un joueur selon sa date de naissance
	 * Aligné avec la table ct_param_category
	 */
	private Long calculateCategoryFromBirthDate(LocalDate dateOfBirth) {
	    if (dateOfBirth == null) return null;
	    
	    try {
	        // ✅ Définition des plages selon ct_param_category
	        // CP (id=9): 2017-01-01 à 2018-12-31
	        if (!dateOfBirth.isBefore(LocalDate.of(2017, 1, 1))) {
	            return 9L; // CP
	        }
	        
	        // BENJAMINS (id=1): 2015-01-01 à 2016-12-31
	        if (!dateOfBirth.isBefore(LocalDate.of(2015, 1, 1)) && 
	            !dateOfBirth.isAfter(LocalDate.of(2016, 12, 31))) {
	            return 1L; // BENJAMINS
	        }
	        
	        // ECOLES (id=2): 2013-01-01 à 2014-12-31
	        if (!dateOfBirth.isBefore(LocalDate.of(2013, 1, 1)) && 
	            !dateOfBirth.isAfter(LocalDate.of(2014, 12, 31))) {
	            return 2L; // ECOLES
	        }
	        
	        // MINIMES (id=3): 2011-01-01 à 2012-12-31
	        if (!dateOfBirth.isBefore(LocalDate.of(2011, 1, 1)) && 
	            !dateOfBirth.isAfter(LocalDate.of(2012, 12, 31))) {
	            return 3L; // MINIMES
	        }
	        
	        // CADETS (id=4): 2009-01-01 à 2010-12-31
	        if (!dateOfBirth.isBefore(LocalDate.of(2009, 1, 1)) && 
	            !dateOfBirth.isAfter(LocalDate.of(2010, 12, 31))) {
	            return 4L; // CADETS
	        }
	        
	        // JUNIORS (id=5): 2007-01-01 à 2008-12-31
	        if (!dateOfBirth.isBefore(LocalDate.of(2007, 1, 1)) && 
	            !dateOfBirth.isAfter(LocalDate.of(2008, 12, 31))) {
	            return 5L; // JUNIORS
	        }
	        
	        // ELITE (id=6): 2005-01-01 à 2006-12-31
	        if (!dateOfBirth.isBefore(LocalDate.of(2005, 1, 1)) && 
	            !dateOfBirth.isAfter(LocalDate.of(2006, 12, 31))) {
	            return 6L; // ELITE
	        }
	        
	        // SENIORS (id=7): avant 2005
	        return 7L; // SENIORS
	        
	    } catch (Exception e) {
	        logger.error("Erreur calcul catégorie pour date {}", dateOfBirth, e);
	        return 7L; // Par défaut: SENIORS
	    }
	}

	/**
	 * Créer une demande de renouvellement
	 */
	@PostMapping("/renouvellement/{previousDemandeId}/season/{newSeasonId}")
	public ResponseEntity<DemandePlayersDTO> createRenouvellement(@PathVariable Long previousDemandeId,
			@PathVariable Long newSeasonId, @RequestParam(required = false, defaultValue = "1") Long userId) {
		try {
			DemandePlayersDTO renewalDemande = demandePlayersService.createRenouvellement(previousDemandeId,
					newSeasonId, userId);
			return ResponseEntity.status(HttpStatus.CREATED).body(renewalDemande);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().build();
		} catch (RuntimeException e) {
			return ResponseEntity.notFound().build();
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	/**
	 * Valider une demande
	 */
	@PatchMapping("/{id}/validate")
	public ResponseEntity<DemandePlayersDTO> validateDemande(@PathVariable Long id,
			@RequestParam(required = false, defaultValue = "1") Long userId) {
		try {
			DemandePlayersDTO validatedDemande = demandePlayersService.changeStatus(id, 8L, userId);
			return ResponseEntity.ok(validatedDemande);
		} catch (RuntimeException e) {
			return ResponseEntity.notFound().build();
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	/**
	 * Rejeter une demande
	 */
	@PatchMapping("/{id}/reject")
	public ResponseEntity<DemandePlayersDTO> rejectDemande(@PathVariable Long id,
			@RequestBody(required = false) java.util.Map<String, Object> requestBody,
			@RequestParam(required = false, defaultValue = "1") Long userId) {
		try {
			// Récupérer le motif de rejet s'il est fourni
			String motif = null;
			if (requestBody != null && requestBody.containsKey("motif")) {
				motif = (String) requestBody.get("motif");
			}

			// Changer le statut à "Rejetée" (ID = 5)
			DemandePlayersDTO rejectedDemande = demandePlayersService.changeStatus(id, 5L, userId);

			// TODO: Si vous voulez sauvegarder le motif, ajoutez-le dans votre service
			// demandePlayersService.setMotifRejet(id, motif);

			return ResponseEntity.ok(rejectedDemande);
		} catch (RuntimeException e) {
			return ResponseEntity.notFound().build();
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@PostMapping("/renouvellement/joueur/{joueurId}/season/{newSeasonId}")
	@Operation(summary = "Créer un renouvellement de licence", description = "Crée une demande de renouvellement pour un joueur existant")
	@ApiResponses({ @ApiResponse(responseCode = "201", description = "Renouvellement créé avec succès"),
			@ApiResponse(responseCode = "400", description = "Données invalides"),
			@ApiResponse(responseCode = "404", description = "Joueur non trouvé") })
	public ResponseEntity<?> createRenouvellementFromJoueur(
			@Parameter(description = "ID du joueur", required = true, example = "12345") @PathVariable BigDecimal joueurId,

			@Parameter(description = "ID de la nouvelle saison", required = true, example = "2025") @PathVariable Long newSeasonId,

			@RequestBody DemandePlayersDTO demandeDTO) {
		try {
			// Récupérer les informations du joueur
			String sql = """
					SELECT i.name, i.last_name, i.date_of_birth, i.place_of_birth,
					       i.cin_number, i.passport_num, i.cr_pays_id,
					       ti.ct_regime_id, ti.ct_type_competition_id, ti.ct_player_category_id
					FROM ct_intervenants i
					INNER JOIN ct_team_intervenants ti ON i.ct_intervenant_id = ti.ct_intervenant_id
					WHERE i.ct_intervenant_id = ?
					ORDER BY ti.ct_season_id DESC
					LIMIT 1
					""";

			List<Object[]> results = jdbcTemplate.query(sql,
					(rs, rowNum) -> new Object[] { rs.getString("name"), rs.getString("last_name"),
							rs.getDate("date_of_birth"), rs.getString("place_of_birth"), rs.getString("cin_number"),
							rs.getString("passport_num"), rs.getBigDecimal("cr_pays_id"),
							rs.getBigDecimal("ct_regime_id"), rs.getBigDecimal("ct_type_competition_id"),
							rs.getBigDecimal("ct_player_category_id") },
					joueurId);

			if (results.isEmpty()) {
				return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Joueur non trouvé"));
			}

			Object[] playerData = results.get(0);

			// Déclarer dateOfBirth
			LocalDate dateOfBirth = playerData[2] != null ? ((java.sql.Date) playerData[2]).toLocalDate() : null;

			// Remplir les données du joueur
			demandeDTO.setName((String) playerData[0]);
			demandeDTO.setLastName((String) playerData[1]);
			demandeDTO.setDateOfBirth(dateOfBirth);
			demandeDTO.setPlaceOfBirth((String) playerData[3]);
			// Garder le CIN/Passeport du formulaire s'ils sont fournis, sinon utiliser ceux de la base
			if (demandeDTO.getCinNumber() == null || demandeDTO.getCinNumber().trim().isEmpty()) {
			    demandeDTO.setCinNumber((String) playerData[4]);
			}
			if (demandeDTO.getPassportNum() == null || demandeDTO.getPassportNum().trim().isEmpty()) {
			    demandeDTO.setPassportNum((String) playerData[5]);
			}
			demandeDTO.setPassportNum((String) playerData[5]);
			demandeDTO.setPaysId((BigDecimal) playerData[6]);

			BigDecimal regimeId = (BigDecimal) playerData[7];
			demandeDTO.setRegimeId(regimeId);
			// Validation spécifique selon le régime
			if (regimeId.intValue() == 2 || regimeId.intValue() == 3 || regimeId.intValue() == 4) {// PROFESSIONNEL
				if (demandeDTO.getContractDate() == null) {
					return ResponseEntity.badRequest().body(Map.of("success", false, "error",
							"Date de début de contrat obligatoire pour les professionnels"));
				}
				if (demandeDTO.getContractDateFin() == null) {
					return ResponseEntity.badRequest().body(Map.of("success", false, "error",
							"Date de fin de contrat obligatoire pour les professionnels"));
				}
			}
			demandeDTO.setTypeCompetitionId((BigDecimal) playerData[8]);

			// Recalculer la catégorie selon la date de naissance
			Long categoryId = calculateCategoryFromBirthDate(dateOfBirth);
			demandeDTO.setPlayerCategoryId(BigDecimal.valueOf(categoryId));

			// Validation CIN/Passeport (réutiliser categoryId déjà calculée)
			ValidationResult validationResult = new ValidationResult();

			if (!cinPassportValidator.validate(demandeDTO, validationResult, categoryId)) {
				return ResponseEntity.badRequest()
						.body(Map.of("success", false, "errors", validationResult.getErrors()));
			}

			// Configuration commune
			demandeDTO.setIntervenantId(joueurId);
			demandeDTO.setSeasonId(BigDecimal.valueOf(newSeasonId));
			demandeDTO.setTypeLicenceId(BigDecimal.valueOf(2)); // RENOUVELLEMENT
			demandeDTO.setCtIntervenantTypeId(BigDecimal.valueOf(1));
			demandeDTO.setDemandeStatuId(BigDecimal.valueOf(1));

			// Créer la demande
			DemandePlayersDTO createdDemande = demandePlayersService.createDemande(demandeDTO, 1L);

			return ResponseEntity.status(HttpStatus.CREATED).body(createdDemande);

		} catch (Exception e) {
			logger.error("Erreur renouvellement joueur {}", joueurId, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("success", false, "error", e.getMessage()));
		}
	}

	// ✅ REMPLACEZ CETTE MÉTHODE DANS DemandePlayersController.java

	@GetMapping("/categories/calculate")
	public ResponseEntity<Map<String, Object>> calculateCategory(@RequestParam String dateOfBirth) {
	    try {
	        LocalDate birthDate = LocalDate.parse(dateOfBirth);
	        
	        // ✅ REQUÊTE CORRIGÉE : Utilise la date complète au lieu de l'année
	        String sql = """
	                SELECT pc.ct_player_category_id,
	                       CASE pc.ct_player_category_id
	                           WHEN 1 THEN 'BENJAMINS'
	                           WHEN 2 THEN 'ECOLES'
	                           WHEN 3 THEN 'MINIMES'
	                           WHEN 4 THEN 'CADETS'
	                           WHEN 5 THEN 'JUNIORS'
	                           WHEN 6 THEN 'ELITE'
	                           WHEN 7 THEN 'SENIORS'
	                           WHEN 9 THEN 'CP'
	                           ELSE 'SENIORS'
	                       END as libelle,
	                       pcat.annee_debut,
	                       pcat.annee_fin
	                FROM ct_param_category pcat
	                INNER JOIN (
	                    SELECT DISTINCT ct_player_category_id 
	                    FROM ct_param_category
	                ) pc ON pc.ct_player_category_id = pcat.ct_player_category_id
	                WHERE ? BETWEEN DATE(pcat.annee_debut) AND DATE(pcat.annee_fin)
	                ORDER BY pcat.annee_debut DESC
	                LIMIT 1
	                """;

	        List<Map<String, Object>> results = jdbcTemplate.query(sql, (rs, rowNum) -> {
	            Map<String, Object> category = new HashMap<>();
	            category.put("id", rs.getLong("ct_player_category_id"));
	            category.put("label", rs.getString("libelle"));
	            
	            // Debug: afficher les plages de dates utilisées
	            logger.info("Catégorie trouvée pour {} : {} (plage: {} - {})", 
	                birthDate, 
	                rs.getString("libelle"),
	                rs.getDate("annee_debut"),
	                rs.getDate("annee_fin")
	            );
	            
	            return category;
	        }, birthDate);

	        if (!results.isEmpty()) {
	            return ResponseEntity.ok(results.get(0));
	        }

	        // Par défaut : SENIORS
	        logger.warn("Aucune catégorie trouvée pour la date {}, retour SENIORS par défaut", birthDate);
	        Map<String, Object> defaultCategory = new HashMap<>();
	        defaultCategory.put("id", 7L);
	        defaultCategory.put("label", "SENIORS");
	        return ResponseEntity.ok(defaultCategory);

	    } catch (Exception e) {
	        logger.error("Erreur calcul catégorie pour date {}", dateOfBirth, e);
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	            .body(Map.of("error", e.getMessage()));
	    }
	}

	@GetMapping("/player-info/{playerId}")
	public ResponseEntity<DemandePlayersDTO> getInfoPlayer(@PathVariable BigDecimal playerId,
			@RequestParam BigDecimal regimeId, @RequestParam BigDecimal seasonId, @RequestParam BigDecimal teamId) {
		try {
			String sql = "SELECT i.name, i.last_name, i.date_of_birth, i.place_of_birth, "
					+ "i.cin_number, i.passport_num, i.cr_pays_id " + "FROM ct_intervenants i "
					+ "WHERE i.ct_intervenant_id = ?";

			List<Object[]> results = jdbcTemplate.query(sql,
					(rs, rowNum) -> new Object[] { rs.getString("name"), rs.getString("last_name"),
							rs.getDate("date_of_birth"), rs.getString("place_of_birth"), rs.getString("cin_number"),
							rs.getString("passport_num"), rs.getBigDecimal("cr_pays_id") },
					playerId);

			if (results.isEmpty()) {
				return ResponseEntity.notFound().build();
			}

			Object[] data = results.get(0);
			DemandePlayersDTO playerInfo = new DemandePlayersDTO();
			playerInfo.setName((String) data[0]);
			playerInfo.setLastName((String) data[1]);
			playerInfo.setDateOfBirth(data[2] != null ? ((java.sql.Date) data[2]).toLocalDate() : null);
			playerInfo.setPlaceOfBirth((String) data[3]);
			playerInfo.setCinNumber((String) data[4]);
			playerInfo.setPassportNum((String) data[5]);
			playerInfo.setPaysId((BigDecimal) data[6]);

			return ResponseEntity.ok(playerInfo);

		} catch (Exception e) {
			logger.error("Erreur lors de la récupération des infos joueur", e);
			return ResponseEntity.internalServerError().build();
		}
	}

	// DANS VOTRE CONTRÔLEUR, REMPLACEZ LA MÉTHODE PAR CELLE-CI :

	@GetMapping("/joueurs-eligibles-renouvellement")
	public ResponseEntity<List<Map<String, Object>>> getJoueursEligiblesRenouvellement(@RequestParam Long teamId,
			@RequestParam Long regimeId, @RequestParam Long currentSeasonId) {
		try {
			// UTILISER LE SERVICE AU LIEU DU REPOSITORY DIRECTEMENT
			List<Map<String, Object>> joueurs = demandePlayersService.getJoueursEligiblesRenouvellement(teamId,
					regimeId, currentSeasonId);

			return ResponseEntity.ok(joueurs);

		} catch (Exception e) {
			logger.error("Erreur lors de la récupération des joueurs éligibles", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@PostMapping("/{id}/validate-complete")
	public ResponseEntity<Map<String, Object>> validateComplete(@PathVariable Long id) {
		Map<String, Object> response = new HashMap<>();

		try {
			DemandePlayersDTO demande = demandePlayersService.getById(id);

			var result = validationOrchestrator.validateDemandeComplete(demande);

			if (result.isValid()) {
				DemandePlayersDTO updated = demandePlayersService.changeStatus(id, 8L, 1L);
				response.put("success", true);
				response.put("message", "Demande validée avec succès");
				response.put("playerCategory", result.getPlayerCategory());
				response.put("regime", result.getRegime());

				if (!result.getWarnings().isEmpty()) {
					response.put("warnings", result.getWarnings());
				}
			} else {
				response.put("success", false);
				response.put("errors", result.getErrors());
				response.put("playerCategory", result.getPlayerCategory());

				if (!result.getWarnings().isEmpty()) {
					response.put("warnings", result.getWarnings());
				}
			}

			return ResponseEntity.ok(response);

		} catch (Exception e) {
			response.put("success", false);
			response.put("error", "Erreur : " + e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	// ==================== ENDPOINTS WORKFLOW ====================

	/**
	 * Changer le statut avec validation des transitions
	 */
	@PatchMapping("/{id}/workflow/change-status")
	@Operation(summary = "Changer le statut avec validation du workflow", description = "Change le statut en vérifiant que la transition est autorisée selon les règles métier")
	@ApiResponses({ @ApiResponse(responseCode = "200", description = "Statut changé avec succès"),
			@ApiResponse(responseCode = "400", description = "Transition non autorisée"),
			@ApiResponse(responseCode = "404", description = "Demande non trouvée") })
	public ResponseEntity<?> changeStatusWithWorkflow(
			@Parameter(description = "ID de la demande", required = true, example = "981532") @PathVariable Long id,

			@Parameter(description = "Nouveau statut (1=Initial, 2=Validée, 8=En attente, 9=Imprimée, 10=Rejetée)", required = true, example = "2") @RequestParam Long newStatusId,

			@Parameter(description = "Commentaire du changement", example = "Validation après vérification des documents") @RequestParam(required = false) String comment,

			@Parameter(description = "ID de l'utilisateur", example = "1") @RequestParam(required = false, defaultValue = "1") Long userId) {
		try {
			DemandePlayersDTO result = workflowService.changeStatus(id, newStatusId, userId, comment);

			Map<String, Object> response = new HashMap<>();
			response.put("success", true);
			response.put("demande", result);
			response.put("message", "Statut changé avec succès");

			return ResponseEntity.ok(response);

		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "error", e.getMessage()));

		} catch (IllegalStateException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body(Map.of("success", false, "error", e.getMessage()));
		}
	}

	/**
	 * Obtenir les transitions possibles pour une demande
	 */
	@GetMapping("/{id}/workflow/available-transitions")
	@Operation(summary = "Obtenir les transitions possibles", description = "Retourne les états vers lesquels la demande peut transitionner depuis son état actuel")
	@ApiResponses({ @ApiResponse(responseCode = "200", description = "Liste des transitions retournée"),
			@ApiResponse(responseCode = "404", description = "Demande non trouvée") })
	public ResponseEntity<?> getAvailableTransitions(
			@Parameter(description = "ID de la demande", required = true, example = "981532") @PathVariable Long id) {
		try {
			Map<String, Object> transitions = workflowService.getAvailableTransitions(id);
			return ResponseEntity.ok(transitions);

		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
		}
	}

	/**
	 * Obtenir l'historique des changements de statut
	 */
	@GetMapping("/{id}/workflow/history")
	@Operation(summary = "Obtenir l'historique des changements", description = "Retourne tous les changements de statut de la demande avec dates et commentaires")
	@ApiResponses({ @ApiResponse(responseCode = "200", description = "Historique retourné"),
			@ApiResponse(responseCode = "500", description = "Erreur serveur") })
	public ResponseEntity<?> getStatusHistory(
			@Parameter(description = "ID de la demande", required = true, example = "981532") @PathVariable Long id) {
		try {
			List<Map<String, Object>> history = workflowService.getStatusHistory(id);
			return ResponseEntity.ok(history);

		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
		}
	}

	/**
	 * Valider une demande via workflow
	 */
	@PostMapping("/{id}/workflow/validate")
	@Operation(summary = "Valider une demande via workflow", description = "Fait transitionner la demande vers l'état VALIDEE_CLUB (statut 2)")
	@ApiResponses({ @ApiResponse(responseCode = "200", description = "Demande validée avec succès"),
			@ApiResponse(responseCode = "400", description = "Transition non autorisée") })
	public ResponseEntity<?> validateDemandeWorkflow( // ✅ NOM CHANGÉ
			@Parameter(description = "ID de la demande", required = true, example = "981532") @PathVariable Long id,

			@io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Commentaire de validation (optionnel)", content = @Content(examples = @ExampleObject(value = "{\"comment\": \"Tous les documents sont conformes\"}"))) @RequestBody(required = false) Map<String, String> body,

			@Parameter(description = "ID de l'utilisateur", example = "1") @RequestParam(required = false, defaultValue = "1") Long userId) {
		try {
			String comment = body != null ? body.get("comment") : "Demande validée";
			DemandePlayersDTO result = workflowService.validateDemande(id, userId, comment);

			return ResponseEntity
					.ok(Map.of("success", true, "demande", result, "message", "Demande validée avec succès"));

		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body(Map.of("success", false, "error", e.getMessage()));
		}
	}

	/**
	 * Rejeter une demande via workflow
	 */
	@PostMapping("/{id}/workflow/reject")
	@Operation(summary = "Rejeter une demande via workflow", description = "Fait transitionner la demande vers l'état REJETEE (statut 10)")
	@ApiResponses({ @ApiResponse(responseCode = "200", description = "Demande rejetée"),
			@ApiResponse(responseCode = "400", description = "Transition non autorisée") })
	public ResponseEntity<?> rejectDemandeWorkflow( // ✅ NOM CHANGÉ
			@Parameter(description = "ID de la demande", required = true, example = "981532") @PathVariable Long id,

			@io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Raison du rejet", required = true, content = @Content(examples = @ExampleObject(value = "{\"reason\": \"Documents incomplets\"}"))) @RequestBody Map<String, String> body,

			@Parameter(description = "ID de l'utilisateur", example = "1") @RequestParam(required = false, defaultValue = "1") Long userId) {
		try {
			String reason = body.getOrDefault("reason", "Demande rejetée");
			DemandePlayersDTO result = workflowService.rejectDemande(id, userId, reason);

			return ResponseEntity.ok(Map.of("success", true, "demande", result, "message", "Demande rejetée"));

		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body(Map.of("success", false, "error", e.getMessage()));
		}
	}

	/**
	 * Marquer comme imprimée
	 */
	@PostMapping("/{id}/workflow/print")
	@Operation(summary = "Marquer comme imprimée", description = "Fait transitionner la demande vers l'état IMPRIMEE (statut 9)")
	@ApiResponses({ @ApiResponse(responseCode = "200", description = "Licence marquée comme imprimée"),
			@ApiResponse(responseCode = "400", description = "Transition non autorisée") })
	public ResponseEntity<?> markAsPrinted(
			@Parameter(description = "ID de la demande", required = true, example = "981532") @PathVariable Long id,

			@Parameter(description = "ID de l'utilisateur", example = "1") @RequestParam(required = false, defaultValue = "1") Long userId) {
		try {
			DemandePlayersDTO result = workflowService.markAsPrinted(id, userId);

			return ResponseEntity
					.ok(Map.of("success", true, "demande", result, "message", "Licence marquée comme imprimée"));

		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body(Map.of("success", false, "error", e.getMessage()));
		}
	}

	/**
	 * Obtenir l'historique des notifications pour une demande
	 */
	@GetMapping("/{id}/notifications")
	@Operation(summary = "Obtenir l'historique des notifications", description = "Retourne toutes les notifications envoyées pour cette demande")
	@ApiResponses({ @ApiResponse(responseCode = "200", description = "Liste des notifications"),
			@ApiResponse(responseCode = "404", description = "Demande non trouvée") })
	public ResponseEntity<?> getNotificationHistory(
			@Parameter(description = "ID de la demande", required = true, example = "981532") @PathVariable Long id) {
		try {
			List<NotificationHistory> notifications = notificationHistoryRepository
					.findByDemandeId(BigDecimal.valueOf(id));

			return ResponseEntity.ok(notifications);

		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
		}
	}
	
	/**
	 * Télécharger la licence en PDF
	 */
	@GetMapping("/{id}/licence/pdf")
	@Operation(
	    summary = "Télécharger la licence en PDF",
	    description = "Génère et télécharge le PDF de la licence du joueur"
	)
	@ApiResponses({
	    @ApiResponse(responseCode = "200", description = "PDF généré avec succès"),
	    @ApiResponse(responseCode = "404", description = "Demande non trouvée"),
	    @ApiResponse(responseCode = "500", description = "Erreur lors de la génération du PDF")
	})
	public ResponseEntity<byte[]> downloadLicencePdf(
	    @Parameter(description = "ID de la demande", required = true, example = "981532")
	    @PathVariable Long id
	) {
	    try {
	        byte[] pdfBytes = pdfGenerationService.generateLicencePdf(id);
	        
	        HttpHeaders headers = new HttpHeaders();
	        headers.setContentType(MediaType.APPLICATION_PDF);
	        headers.setContentDisposition(
	            ContentDisposition.attachment()
	                .filename("licence_" + id + ".pdf")
	                .build()
	        );
	        
	        return ResponseEntity.ok()
	            .headers(headers)
	            .body(pdfBytes);
	            
	    } catch (IllegalArgumentException e) {
	        return ResponseEntity.status(HttpStatus.NOT_FOUND)
	            .body(null);
	            
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	            .body(null);
	    }
	}

	/**
	 * Télécharger le récépissé en PDF
	 */
	@GetMapping("/{id}/recepisse/pdf")
	@Operation(
	    summary = "Télécharger le récépissé en PDF",
	    description = "Génère et télécharge le récépissé de la demande"
	)
	public ResponseEntity<byte[]> downloadRecepissePdf(
	    @Parameter(description = "ID de la demande", required = true, example = "981532")
	    @PathVariable Long id
	) {
	    try {
	        byte[] pdfBytes = pdfGenerationService.generateRecepissePdf(id);
	        
	        HttpHeaders headers = new HttpHeaders();
	        headers.setContentType(MediaType.APPLICATION_PDF);
	        headers.setContentDisposition(
	            ContentDisposition.attachment()
	                .filename("recepisse_" + id + ".pdf")
	                .build()
	        );
	        
	        return ResponseEntity.ok()
	            .headers(headers)
	            .body(pdfBytes);
	            
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	            .body(null);
	    }
	}
	
	@GetMapping("/players/{intervenantId}/renewal-eligibility")
	public ResponseEntity<?> checkRenewalEligibility(
	    @PathVariable BigDecimal intervenantId,
	    @RequestParam BigDecimal teamId,
	    @RequestParam BigDecimal seasonId
	) {
	    try {
	        boolean eligible = renewalValidator.canPlayerBeRenewed(intervenantId, teamId, seasonId);
	        Map<String, Object> response = new HashMap<>();
	        response.put("eligible", eligible);
	        return ResponseEntity.ok(response);
	    } catch (Exception e) {
	        return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
	    }
	}

	@GetMapping("/players/{intervenantId}/last-licence-info")
	public ResponseEntity<?> getPlayerLastLicenceInfo(
	    @PathVariable BigDecimal intervenantId,
	    @RequestParam BigDecimal seasonId
	) {
	    try {
	        Map<String, Object> lastLicence = renewalValidator.getPlayerLastLicenceInfo(intervenantId, seasonId);
	        return ResponseEntity.ok(lastLicence);
	    } catch (Exception e) {
	        return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
	    }
	}
	
	/**
	 * Obtenir les infos d'un joueur pour renouvellement
	 */
	@GetMapping("/renouvellement/joueur/{licenceNum}/season/{seasonId}")
	public ResponseEntity<?> getPlayerForRenewal(
	    @PathVariable String licenceNum,
	    @RequestParam Long teamId
	) {
	    try {
	        // Chercher le joueur par son numéro de licence
	        Optional<DemandePlayersDTO> playerOpt = demandePlayersService.getByLicenceNum(licenceNum);
	        
	        if (playerOpt.isEmpty()) {
	            return ResponseEntity.status(404)
	                .body(Map.of("error", "Joueur non trouvé"));
	        }
	        
	        DemandePlayersDTO player = playerOpt.get();
	        
	        // Vérifier s'il peut être renouvelé
	        if (player.getIntervenantId() != null && teamId != null) {
	            boolean canRenew = renewalValidator.canPlayerBeRenewed(
	                player.getIntervenantId(),
	                BigDecimal.valueOf(teamId),
	                BigDecimal.valueOf(2025) // Ou récupérer la saison actuelle
	            );
	            
	            Map<String, Object> response = new HashMap<>();
	            response.put("player", player);
	            response.put("canRenew", canRenew);
	            
	            if (!canRenew) {
	                response.put("message", "Ce joueur n'était pas dans votre club la saison précédente");
	            }
	            
	            return ResponseEntity.ok(response);
	        }
	        
	        return ResponseEntity.ok(Map.of("player", player));
	        
	    } catch (Exception e) {
	        return ResponseEntity.status(500)
	            .body(Map.of("error", "Erreur serveur: " + e.getMessage()));
	    }
	}
	
	/**
	 * Chercher un joueur par numéro de licence
	 */
	@GetMapping("/search-by-licence")
	public ResponseEntity<?> searchByLicence(@RequestParam String licenceNum) {
	    try {
	        // Chercher dans ct_intervenants
	        String sql = """
	            SELECT 
	                i.ct_intervenant_id as intervenantId,
	                i.name,
	                i.last_name as lastName,
	                i.date_of_birth as dateOfBirth,
	                i.place_of_birth as placeOfBirth,
	                i.cin_number as cinNumber,
	                i.passport_num as passportNum,
	                i.cr_pays_id as paysId,
	                i.licence_num as licenceNum,
	                ti.ct_regime_id as regimeId,
	                ti.ct_player_position_id as positionId,
	                ti.ct_team_id as teamId
	            FROM ct_intervenants i
	            LEFT JOIN ct_team_intervenants ti ON i.ct_intervenant_id = ti.ct_intervenant_id
	            WHERE i.licence_num = ?
	            ORDER BY ti.ct_season_id DESC
	            LIMIT 1
	            """;
	        
	        Map<String, Object> player = jdbcTemplate.queryForMap(sql, licenceNum);
	        
	        return ResponseEntity.ok(player);
	        
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.NOT_FOUND)
	            .body(Map.of("error", "Joueur non trouvé avec ce numéro de licence"));
	    }
	}

}