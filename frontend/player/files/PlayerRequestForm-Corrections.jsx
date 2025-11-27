// ==================== CORRECTIONS POUR LE RENOUVELLEMENT ====================
// À ajouter/modifier dans votre composant PlayerRequestForm

// ✅ 1. Ajouter un état pour gérer les avertissements de renouvellement
const [renewalWarning, setRenewalWarning] = useState(null);

// ✅ 2. Fonction pour vérifier si le joueur peut être renouvelé
const checkRenewalEligibility = async (playerId) => {
    if (!playerId || !userTeamInfo) return false;
    
    try {
        const response = await fetch(
            `http://localhost:8080/api/v1/players/${playerId}/renewal-eligibility?` +
            `teamId=${userTeamInfo.teamId}&` +
            `seasonId=${getSeason IdFromString(formData.saison)}`
        );
        
        if (!response.ok) return false;
        
        const data = await response.json();
        return data.eligible || false;
        
    } catch (error) {
        console.error('Erreur vérification renouvellement:', error);
        return false;
    }
};

// ✅ 3. Fonction pour obtenir l'ID de la saison depuis la chaîne "2025/2026"
const getSeasonIdFromString = (seasonString) => {
    // Adapter selon votre logique
    // Exemple : "2025/2026" -> ID de la saison
    const year = parseInt(seasonString.split('/')[0]);
    return year; // Ou autre logique de mapping
};

// ✅ 4. Modifier la fonction searchPlayers pour filtrer selon le type de licence
const searchPlayers = async (term) => {
    if (!term || term.length < 3) {
        setPlayers([]);
        return;
    }

    setLoading(true);
    try {
        const response = await fetch(
            `http://localhost:8080/api/v1/players/search?q=${encodeURIComponent(term)}`
        );

        if (!response.ok) {
            throw new Error('Erreur de recherche');
        }

        const data = await response.json();
        
        // ✅ Si c'est un RENOUVELLEMENT (typeLicence = 2)
        if (parseInt(formData.typeLicence) === 2) {
            
            // Filtrer les joueurs qui peuvent être renouvelés
            const eligiblePlayers = [];
            
            for (const player of data) {
                const canRenew = await checkRenewalEligibility(player.id);
                if (canRenew) {
                    eligiblePlayers.push(player);
                }
            }
            
            if (eligiblePlayers.length === 0) {
                setAlert({
                    type: 'warning',
                    message: '❌ Aucun joueur trouvé pour RENOUVELLEMENT\n\n' +
                            'Les joueurs trouvés n\'étaient pas dans votre club la saison précédente.\n\n' +
                            '📋 SOLUTION :\n' +
                            'Pour ajouter un joueur d\'un autre club, changez le type de licence :\n' +
                            '• TRANSFERT ou TRANSFERT LIBRE (professionnel)\n' +
                            '• MUTATION ou LIBRE (AMATEUR) (amateur)\n' +
                            '• PRÊT (temporaire)'
                });
                setPlayers([]);
            } else {
                setPlayers(eligiblePlayers);
                setAlert(null);
            }
            
        } else {
            // Pour les autres types de licence, afficher tous les résultats
            setPlayers(data);
            setAlert(null);
        }

    } catch (error) {
        console.error('Erreur recherche:', error);
        setAlert({
            type: 'error',
            message: 'Erreur lors de la recherche. Veuillez réessayer.'
        });
        setPlayers([]);
    } finally {
        setLoading(false);
    }
};

// ✅ 5. Ajouter un message d'aide contextuel dans le formulaire (Step 1)
// À placer après la sélection du type de licence

{formData.typeLicence === 2 && (
    <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4">
        <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                    ℹ️ À propos du RENOUVELLEMENT
                </h4>
                <p className="text-sm text-blue-800 mb-2">
                    Un <strong>RENOUVELLEMENT</strong> est uniquement pour les joueurs 
                    qui étaient <strong>déjà dans votre club</strong> lors de la saison précédente.
                </p>
                <div className="text-sm text-blue-700 mt-3">
                    <p className="font-medium mb-1">Pour un joueur venant d'un autre club, utilisez :</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        {formData.regime == 2 && (
                            <>
                                <li><strong>TRANSFERT</strong> : Avec indemnités</li>
                                <li><strong>TRANSFERT LIBRE</strong> : Sans indemnités (fin de contrat)</li>
                            </>
                        )}
                        {formData.regime == 1 && (
                            <>
                                <li><strong>MUTATION</strong> : Changement de club amateur</li>
                                <li><strong>LIBRE (AMATEUR)</strong> : Joueur sans club</li>
                            </>
                        )}
                        {[3, 4].includes(formData.regime) && (
                            <>
                                <li><strong>TRANSFERT</strong> : Avec accord</li>
                                <li><strong>TRANSFERT LIBRE</strong> : Fin de contrat</li>
                            </>
                        )}
                        <li><strong>PRÊT</strong> : Pour un prêt temporaire</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
)}

// ✅ 6. Ajouter une vérification lors de la sélection d'un joueur
const handlePlayerSelect = async (player) => {
    // Si c'est un renouvellement, vérifier l'éligibilité
    if (parseInt(formData.typeLicence) === 2) {
        const canRenew = await checkRenewalEligibility(player.id);
        
        if (!canRenew) {
            // Obtenir les infos de la dernière licence
            try {
                const response = await fetch(
                    `http://localhost:8080/api/v1/players/${player.id}/last-licence-info?` +
                    `seasonId=${getSeasonIdFromString(formData.saison)}`
                );
                
                if (response.ok) {
                    const lastLicence = await response.json();
                    
                    setAlert({
                        type: 'error',
                        message: `❌ RENOUVELLEMENT IMPOSSIBLE\n\n` +
                                `${player.nom} ${player.prenom} n'était PAS dans votre club ` +
                                `la saison précédente.\n\n` +
                                `Dernière licence : ${lastLicence.teamName || 'Inconnu'} ` +
                                `(${lastLicence.regime || 'N/A'})\n\n` +
                                `📋 Veuillez changer le type de licence pour ce joueur.`
                    });
                } else {
                    setAlert({
                        type: 'error',
                        message: `❌ RENOUVELLEMENT IMPOSSIBLE\n\n` +
                                `Ce joueur n'était pas dans votre club la saison précédente.`
                    });
                }
            } catch (error) {
                setAlert({
                    type: 'error',
                    message: `❌ RENOUVELLEMENT IMPOSSIBLE\n\n` +
                            `Ce joueur n'était pas dans votre club la saison précédente.`
                });
            }
            
            return; // Ne pas sélectionner le joueur
        }
    }
    
    // Sélectionner le joueur normalement
    setFormData(prev => ({
        ...prev,
        selectedPlayer: player,
        nom: player.nom,
        prenom: player.prenom,
        dateNaissance: player.dateNaissance,
        lieuNaissance: player.lieuNaissance || '',
        nationalite: player.nationalite || 193,
        categorie: player.categorie || '',
        cinNumber: player.cinNumber || '',
        passport: player.passport || '',
        previousPlayerId: player.id
    }));
    
    setPlayers([]);
    setSearchTerm('');
    setAlert(null);
};

// ✅ 7. Modifier la validation avant soumission (dans submitForm)
const submitForm = async () => {
    // Validation existante...
    
    // ✅ Validation spécifique pour le renouvellement
    if (parseInt(formData.typeLicence) === 2) {
        if (!formData.selectedPlayer || !formData.previousPlayerId) {
            setAlert({
                type: 'error',
                message: 'Pour un RENOUVELLEMENT, vous devez sélectionner un joueur existant.'
            });
            return;
        }
        
        // Double vérification côté client
        const canRenew = await checkRenewalEligibility(formData.previousPlayerId);
        if (!canRenew) {
            setAlert({
                type: 'error',
                message: 'Ce joueur ne peut pas être renouvelé car il n\'était pas ' +
                        'dans votre club la saison précédente. Veuillez changer ' +
                        'le type de licence.'
            });
            return;
        }
    }
    
    // Suite de la soumission...
    try {
        setLoading(true);
        
        const payload = {
            // ... votre payload existant
        };
        
        const response = await fetch('http://localhost:8080/api/v1/demandes-players', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erreur lors de la création');
        }

        const result = await response.json();
        
        // ✅ Afficher la notification de succès avec le nouveau système
        showToast('success', 'Succès !', 'Nouvelle demande créée avec succès !');
        
        // Ou utiliser votre système d'alerte existant
        setAlert({
            type: 'success',
            message: 'Demande créée avec succès !'
        });
        
        setCurrentStep(4);
        
    } catch (error) {
        console.error('Erreur:', error);
        
        // ✅ Afficher l'erreur avec le nouveau système
        showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        
        setAlert({
            type: 'error',
            message: error.message || 'Une erreur est survenue lors de la création'
        });
    } finally {
        setLoading(false);
    }
};

// ✅ 8. Ajouter un endpoint dans le backend pour vérifier l'éligibilité
// À ajouter dans DemandePlayersController.java :

/*
@GetMapping("/api/v1/players/{playerId}/renewal-eligibility")
public ResponseEntity<?> checkRenewalEligibility(
    @PathVariable Long playerId,
    @RequestParam Long teamId,
    @RequestParam Long seasonId
) {
    try {
        boolean eligible = renewalValidator.canPlayerBeRenewed(playerId, teamId, seasonId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("eligible", eligible);
        response.put("playerId", playerId);
        response.put("teamId", teamId);
        response.put("seasonId", seasonId);
        
        if (!eligible) {
            Map<String, Object> lastLicence = renewalValidator.getPlayerLastLicenceInfo(playerId, seasonId);
            response.put("lastLicence", lastLicence);
            response.put("message", "Le joueur n'était pas dans ce club la saison précédente");
        }
        
        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", e.getMessage()));
    }
}

@GetMapping("/api/v1/players/{playerId}/last-licence-info")
public ResponseEntity<?> getPlayerLastLicenceInfo(
    @PathVariable Long playerId,
    @RequestParam Long seasonId
) {
    try {
        Map<String, Object> lastLicence = renewalValidator.getPlayerLastLicenceInfo(playerId, seasonId);
        
        if (lastLicence.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                "message", "Aucune licence trouvée pour la saison précédente"
            ));
        }
        
        return ResponseEntity.ok(lastLicence);
        
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", e.getMessage()));
    }
}
*/
