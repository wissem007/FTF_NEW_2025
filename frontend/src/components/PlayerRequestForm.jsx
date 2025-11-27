import React, { useState, useEffect } from 'react';
import { Calendar, User, Users, FileText, CheckCircle, Search, AlertCircle, XCircle, Info, X } from 'lucide-react';
import { nationalities } from './nationalities';

// ==================== UTILITAIRES ====================

// ✅ Fonction pour formater les dates pour le backend
const formatDateForBackend = (date) => {
    if (!date) return null;
    if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return date;
    }
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return null;
        return d.toISOString().split('T')[0];
    } catch {
        return null;
    }
};

// ✅ Fonction pour convertir catégorie en ID (CORRIGÉ selon backend Java)
const getCategoryId = (categoryLabel) => {
    const mapping = {
        'CP': 9,           // Nés 2017+
        'BENJAMINS': 1,    // ✅ Nés 2015-2016 (10 ans)
        'ECOLES': 2,       // ✅ Nés 2013-2014 (12 ans)
        'MINIMES': 3,      // Nés 2011-2012 (14 ans)
        'CADETS': 4,       // Nés 2009-2010 (16 ans)
        'JUNIORS': 5,      // Nés 2007-2008 (18 ans)
        'ELITE': 6,        // Nés 2005-2006 (20 ans)
        'SENIORS': 7       // Nés avant 2005
    };
    return mapping[categoryLabel] || 7;
};

// ✅ Vérifier exception Cadet
const isCadetException = (birthDateString) => {
    if (!birthDateString) return false;
    try {
        const birthDate = new Date(birthDateString);
        const year = birthDate.getFullYear();
        const month = birthDate.getMonth() + 1;
        const day = birthDate.getDate();

        return (
            year === 2010 &&
            ((month === 9 && day >= 1) || month > 9)
        );
    } catch {
        return false;
    }
};

const ModernAlert = ({ alert, onClose }) => {
    if (!alert) return null;

    let config;
    switch (alert.type) {
        case 'success':
            config = { bg: 'bg-green-50 border-green-200 text-green-800', icon: <CheckCircle className="w-5 h-5 text-green-500" />, title: 'Succès' };
            break;
        case 'error':
            config = { bg: 'bg-red-50 border-red-200 text-red-800', icon: <XCircle className="w-5 h-5 text-red-500" />, title: 'Erreur' };
            break;
        case 'warning':
            config = { bg: 'bg-yellow-50 border-yellow-200 text-yellow-800', icon: <AlertCircle className="w-5 h-5 text-yellow-500" />, title: 'Attention' };
            break;
        case 'info':
            config = { bg: 'bg-blue-50 border-blue-200 text-blue-800', icon: <Info className="w-5 h-5 text-blue-500" />, title: 'Information' };
            break;
        default:
            config = { bg: 'bg-gray-50 border-gray-200 text-gray-800', icon: <Info className="w-5 h-5 text-gray-500" />, title: 'Notification' };
    }

    // ✅ Formater le message pour afficher correctement les sauts de ligne et les bullet points
    const formatMessage = (message) => {
        if (!message) return null;

        // Séparer par lignes
        const lines = message.split('\n').filter(line => line.trim() !== '');

        return lines.map((line, index) => {
            // Si la ligne commence par un bullet point (•, -, *, ➤)
            if (line.trim().match(/^[•\-\*➤]/)) {
                return (
                    <li key={index} className="ml-4 text-sm leading-relaxed">
                        {line.trim().replace(/^[•\-\*➤]\s*/, '')}
                    </li>
                );
            }
            // Si c'est un titre (commence par ❌ ou autre emoji)
            else if (line.trim().match(/^[❌✅⚠️ℹ️]/)) {
                return (
                    <p key={index} className="font-semibold text-sm mb-2 mt-2">
                        {line.trim()}
                    </p>
                );
            }
            // Ligne normale
            else {
                return (
                    <p key={index} className="text-sm leading-relaxed mb-1">
                        {line.trim()}
                    </p>
                );
            }
        });
    };

    return (
        <div className={`border-2 rounded-xl p-5 mb-4 ${config.bg} shadow-lg transition-all duration-300 animate-fadeIn`}>
            <div className="flex items-start">
                <div className="flex-shrink-0 mr-4 mt-0.5">{config.icon}</div>
                <div className="flex-1">
                    <h4 className="font-bold text-base mb-2">{config.title}</h4>
                    <div className="space-y-1">
                        {formatMessage(alert.message)}
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="ml-4 text-gray-400 hover:text-gray-700 transition-colors duration-200"
                        aria-label="Fermer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
};

const PlayerRequestForm = ({ onSuccess, playerId, isEditMode }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        typeIntervenant: '',
        requestType: '',
        saison: '2025/2026',
        regime: '',
        typeLicence: '',
        typeCompetition: 1,
        nom: '',
        prenom: '',
        dateNaissance: '',
        lieuNaissance: '',
        nationalite: 193,
        categorie: '',
        cinNumber: '',
        passport: '',
        poste: '',
        numMaillot: '',
        nomDocteur: '',
        prenomDocteur: '',
        dateConsultation: '',
        salaireBase: '',
        dureeContrat: '',
        dateDebutContrat: '',
        dateFinContrat: '',
        previousPlayerId: '',
        selectedPlayer: null,
        dureePret: '',
        clubOrigine: ''
    });

    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [userTeamInfo, setUserTeamInfo] = useState(null);
    const [searchDebounce, setSearchDebounce] = useState(null);
    const [renewalWarning, setRenewalWarning] = useState(null);
    const [eligibilityCache, setEligibilityCache] = useState({});

    const regimes = [
        { id: 1, label: 'AMATEUR' },
        { id: 2, label: 'PROFESSIONNEL' },
        { id: 3, label: 'SEMI-PROFESSIONNEL' },
        { id: 4, label: 'STAGIAIRE' },
        { id: 5, label: 'CP' }
    ];

    const getTypesLicenceByRegime = (regimeId) => {
        switch (parseInt(regimeId)) {
            case 1:
                return [
                    { id: 1, label: 'NOUVELLE' },
                    { id: 2, label: 'RENOUVELLEMENT' },
                    { id: 3, label: 'RETOUR PRÊT' },
                    { id: 4, label: 'MUTATION' },
                    { id: 5, label: 'PRÊT' },
                    { id: 7, label: 'Mutation Exceptionelle' },
                    { id: 9, label: 'Mutation MUTATION' },
                    { id: 10, label: 'SURCLASSEMENT' },
                    { id: 11, label: 'LIBRE (AMATEUR)' }
                ];
            case 2:
                return [
                    { id: 1, label: 'NOUVELLE' },
                    { id: 2, label: 'RENOUVELLEMENT' },
                    { id: 5, label: 'PRÊT' },
                    { id: 6, label: 'SURCLASSEMENT' },
                    { id: 7, label: 'RETOUR PRÊT' },
                    { id: 8, label: 'TRANSFERT' },
                    { id: 12, label: 'TRANSFERT LIBRE' }
                ];
            case 3:
            case 4:
            case 5:
                return [
                    { id: 1, label: 'NOUVELLE' },
                    { id: 2, label: 'RENOUVELLEMENT' },
                    { id: 5, label: 'PRÊT' },
                    { id: 6, label: 'SURCLASSEMENT' },
                    { id: 7, label: 'RETOUR PRÊT' },
                    { id: 8, label: 'TRANSFERT' },
                    { id: 13, label: 'TRANSFERT LIBRE' }
                ];
            default:
                return [{ id: 1, label: 'NOUVELLE' }];
        }
    };

    const postes = [
        { id: 1, label: 'Gardien' },
        { id: 2, label: 'Défenseur' },
        { id: 3, label: 'Milieu' },
        { id: 4, label: 'Attaquant' }
    ];

    const isAmateur = () => formData.regime === 1;
    const isRenouvellement = () => formData.typeLicence === 2;
    const isTransfert = () => formData.typeLicence === 8;
    const isPret = () => formData.typeLicence === 5;  // ✅ CORRIGÉ: Type 5 = PRÊT
    const isMutation = () => formData.typeLicence === 4;  // ✅ CORRIGÉ: Type 4 = MUTATION
    const isNouvelle = () => formData.typeLicence === 1;
    const needsContract = () => !isAmateur() && (isNouvelle() || isTransfert() || isPret() || isMutation());
    const needsPlayerSearch = () => isRenouvellement() || isTransfert() || isPret() || isMutation();

    // ✅ CORRECTION : Utiliser l'ANNÉE DE NAISSANCE au lieu de l'âge actuel
    const calculateCategoryFromAge = (dateString) => {
        if (!dateString) return '';
        try {
            const birth = new Date(dateString);
            if (isNaN(birth.getTime())) return '';

            const birthYear = birth.getFullYear();

            // Logique alignée avec la base de données (ct_param_category)
            if (birthYear >= 2017) return 'CP';         // 2017+
            if (birthYear >= 2015) return 'BENJAMINS';  // 2015-2016
            if (birthYear >= 2013) return 'ECOLES';     // 2013-2014
            if (birthYear >= 2011) return 'MINIMES';    // 2011-2012
            if (birthYear >= 2009) return 'CADETS';     // 2009-2010
            if (birthYear >= 2007) return 'JUNIORS';    // 2007-2008
            if (birthYear >= 2005) return 'ELITE';      // 2005-2006
            return 'SENIORS';                           // < 2005
        } catch {
            return '';
        }
    };

    const fetchCategoryFromDB = async (dateOfBirth) => {
        if (!dateOfBirth) return 'Sera calculée selon l\'âge';

        try {
            const formattedDate = formatDateForBackend(dateOfBirth);
            const response = await fetch(
                `http://localhost:8082/api/v1/demandes-players/categories/calculate?dateOfBirth=${formattedDate}`
            );

            if (response.ok) {
                const category = await response.json();
                console.log('✅ Catégorie depuis DB:', category.label, 'pour date:', formattedDate);
                return category.label;
            }
        } catch (error) {
            console.error('⚠️ Erreur API catégorie, utilisation du calcul local:', error);
        }

        // ✅ CORRECTION : Utiliser le calcul local comme fallback
        const localCategory = calculateCategoryFromAge(dateOfBirth);
        console.log('📊 Catégorie calculée localement:', localCategory, 'pour date:', dateOfBirth);
        return localCategory || 'SENIORS';
    };

    // ✅ CORRECTION: Endpoint unique
    const loadPlayersForSelection = async () => {
        if (needsPlayerSearch() && formData.regime && userTeamInfo) {
            setLoading(true);
            try {
                const endpoint = `http://localhost:8082/api/v1/demandes-players/joueurs-eligibles-renouvellement?teamId=${userTeamInfo.teamId}&regimeId=${formData.regime}&currentSeasonId=${userTeamInfo.seasonId}`;

                const response = await fetch(endpoint);
                if (response.ok) {
                    const data = await response.json();
                    setPlayers(data);
                    if (data.length === 0) {
                        setAlert({
                            type: 'warning',
                            message: `Aucun joueur éligible trouvé pour ce type de demande.`
                        });
                    }
                } else {
                    setAlert({ type: 'error', message: 'Erreur lors du chargement des joueurs' });
                }
            } catch (error) {
                console.error('Erreur:', error);
                setAlert({ type: 'error', message: 'Erreur de connexion au serveur' });
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo) {
            setUserTeamInfo({
                teamId: Number(userInfo.teamId),
                clubName: userInfo.clubName,
                seasonId: Number(userInfo.seasonId)
            });
        }
    }, []);

    // ✅ CORRECTION: Éviter boucle infinie
    useEffect(() => {
        if (needsPlayerSearch() && formData.regime && userTeamInfo?.teamId) {
            loadPlayersForSelection();
        }
    }, [formData.regime, formData.requestType, userTeamInfo?.teamId]);

    useEffect(() => {
        const updateCategory = async () => {
            if (formData.dateNaissance && isNouvelle()) {
                const category = await fetchCategoryFromDB(formData.dateNaissance);
                setFormData(prev => ({ ...prev, categorie: category }));
            }
        };
        updateCategory();
    }, [formData.dateNaissance]);

    const handleInputChange = (field, value) => {
        setFormData(prev => {
            const newFormData = { ...prev, [field]: value };

            if (field === 'typeLicence') {
                if (value === 1) {
                    newFormData.requestType = 'nouveau';
                } else if (value === 2) {
                    newFormData.requestType = 'renouvellement';
                } else if (value === 3) {
                    newFormData.requestType = 'retour_pret';
                } else if (value === 5) {
                    newFormData.requestType = 'pret';
                } else if (value === 8 || value === 12 || value === 14) {
                    newFormData.requestType = 'transfert';
                } else if (value === 4 || value === 7 || value === 9 || value === 10 || value === 11) {
                    newFormData.requestType = 'mutation';
                } else {
                    newFormData.requestType = 'nouveau';
                }

                newFormData.selectedPlayer = null;
                newFormData.previousPlayerId = '';
            }

            return newFormData;
        });
    };

    // ✅ CORRECTION: Debounce
    const searchPlayerByLicence = async (licenceNum) => {
        if (!licenceNum || licenceNum.trim().length < 3) {
            setAlert({
                type: 'error',
                message: 'Veuillez saisir au moins 3 caractères'
            });
            return;
        }

        setLoading(true);
        setRenewalWarning(null);
        console.log('🔍 Recherche licence:', licenceNum);

        try {
            // 1. Chercher le joueur par licence
            const response = await fetch(
                `http://localhost:8082/api/v1/demandes-players/search-by-licence?licenceNum=${licenceNum}`,
                {
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            if (!response.ok) {
                throw new Error('Joueur non trouvé');
            }

            const playerData = await response.json();
            console.log('📋 Infos joueur trouvées:', playerData);

            // 2. Extraire l'ID avec tous les formats possibles
            const intervenantId = playerData.intervenantid ||
                playerData.intervenantId ||
                playerData.ct_intervenant_id ||
                playerData.INTERVENANTID;

            console.log('🔑 ID extrait:', intervenantId);

            if (!intervenantId) {
                throw new Error('ID du joueur introuvable dans les données retournées');
            }

            // 3. Si c'est un RENOUVELLEMENT, vérifier l'éligibilité
            // if (formData.typeLicence === 2 && userTeamInfo?.teamId) {
            //     const seasonId = parseInt(formData.saison.split('/')[0]);

            //     const eligibilityResponse = await fetch(
            //         `http://localhost:8082/api/v1/demandes-players/players/${intervenantId}/renewal-eligibility?teamId=${userTeamInfo.teamId}&seasonId=${seasonId}`
            //     );

            //     if (eligibilityResponse.ok) {
            //         const eligibilityData = await eligibilityResponse.json();

            //         if (!eligibilityData.eligible) {
            //             setRenewalWarning(
            //                 '❌ Ce joueur n\'était pas dans votre club la saison précédente. ' +
            //                 'Veuillez utiliser "MUTATION" (amateur) ou "TRANSFERT" (professionnel) au lieu de "RENOUVELLEMENT".'
            //             );
            //             setLoading(false);
            //             return; // BLOQUER ICI
            //         }
            //     }
            // }

            // 4. Remplir le formulaire avec les données du joueur
            console.log('📦 Données brutes du backend:', playerData);

            setFormData(prev => ({
                ...prev,
                selectedPlayer: playerData,
                previousPlayerId: intervenantId, // Utiliser l'ID extrait
                nom: playerData.last_name || playerData.lastname || playerData.lastName || '',
                prenom: playerData.name || '',
                dateNaissance: playerData.date_of_birth || playerData.dateofbirth || playerData.dateOfBirth || '',
                lieuNaissance: playerData.place_of_birth || playerData.placeofbirth || playerData.placeOfBirth || '',
                nationalite: playerData.cr_pays_id || playerData.paysid || playerData.paysId || 193,
                cinNumber: playerData.cin_number || playerData.cinnumber || playerData.cinNumber || '',
                passport: playerData.passport_num || playerData.passportnum || playerData.passportNum || '',
                poste: playerData.ct_player_position_id || playerData.positionid || playerData.positionId || '',
                regime: playerData.ct_regime_id || playerData.regimeid || playerData.regimeId || prev.regime
            }));

            console.log('✅ Formulaire après remplissage:', {
                nom: playerData.last_name || playerData.lastname,
                prenom: playerData.name,
                dateNaissance: playerData.date_of_birth || playerData.dateofbirth,
                intervenantId: intervenantId
            });

            // 5. Calculer la catégorie
            const birthDate = playerData.date_of_birth || playerData.dateofbirth || playerData.dateOfBirth;
            if (birthDate) {
                const category = calculateCategoryFromAge(birthDate);
                console.log('🎯 Catégorie attribuée:', category);
                setFormData(prev => ({ ...prev, categorie: category }));
            }

            setAlert({
                type: 'success',
                message: `✅ Joueur trouvé : ${playerData.name} ${playerData.last_name || playerData.lastname}`
            });

        } catch (error) {
            console.error('❌ Erreur recherche licence:', error);
            setAlert({
                type: 'error',
                message: error.message || 'Joueur non trouvé'
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePlayerSelect = async (player) => {
        try {
            console.log('🔍 Sélection joueur:', player);

            const response = await fetch(
                `http://localhost:8082/api/v1/demandes-players/player-info/${player.id}?regimeId=${formData.regime}&seasonId=${userTeamInfo.seasonId}&teamId=${userTeamInfo.teamId}`
            );

            if (response.ok) {
                const playerInfo = await response.json();
                const birthDate = playerInfo.dateOfBirth || player.dateNaissance;

                console.log('📅 Date de naissance récupérée:', birthDate);

                const category = await fetchCategoryFromDB(birthDate);

                console.log('🎯 Catégorie finale:', category);

                setFormData(prev => ({
                    ...prev,
                    selectedPlayer: player,
                    previousPlayerId: player.id,
                    nom: playerInfo.lastName || player.nom,
                    prenom: playerInfo.name || player.prenom,
                    dateNaissance: birthDate,
                    lieuNaissance: playerInfo.placeOfBirth || '',
                    nationalite: playerInfo.paysId || 193,
                    cinNumber: playerInfo.cinNumber || '',
                    passport: playerInfo.passportNum || '',
                    categorie: category
                }));

                setAlert({
                    type: 'success',
                    message: `✅ Joueur sélectionné : ${playerInfo.name} ${playerInfo.lastName}`
                });

                console.log('✅ Informations joueur mises à jour');
            }
        } catch (error) {
            console.error('❌ Erreur sélection joueur:', error);
            setAlert({ type: 'error', message: 'Erreur lors de la sélection du joueur' });
        }
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const previousStep = () => {
        setCurrentStep(prev => prev - 1);
    };

    // ✅ CORRECTION: Validation avec exception Cadet
    const validateStep = (step) => {
        switch (step) {
            case 1:
                if (!formData.typeIntervenant) {
                    setAlert({ type: 'warning', message: 'Veuillez sélectionner un type d\'intervenant' });
                    return false;
                }
                if (formData.typeIntervenant === 'joueur' && (!formData.regime || !formData.typeLicence)) {
                    setAlert({ type: 'warning', message: 'Veuillez remplir tous les champs obligatoires' });
                    return false;
                }
                // // Pour renouvellement : vérifier uniquement si joueur sélectionné
                // // Le CIN sera vérifié à l'étape 2
                // if (needsPlayerSearch() && !formData.selectedPlayer) {
                //     setAlert({ type: 'warning', message: 'Veuillez sélectionner un joueur' });
                //     return false;
                // }
                // ✅ PAS de validation CIN ici - elle est à l'étape 2
                break;
            case 2:
                if (needsPlayerSearch() && !formData.selectedPlayer) {
                    setAlert({ type: 'warning', message: 'Veuillez rechercher et sélectionner un joueur' });
                    return false;
                }
                if (isNouvelle()) {
                    if (!formData.nom || formData.nom.trim() === '') {
                        setAlert({ type: 'warning', message: 'Le nom est obligatoire' });
                        return false;
                    }
                    if (!formData.prenom || formData.prenom.trim() === '') {
                        setAlert({ type: 'warning', message: 'Le prénom est obligatoire' });
                        return false;
                    }
                    if (!formData.dateNaissance) {
                        setAlert({ type: 'warning', message: 'La date de naissance est obligatoire' });
                        return false;
                    }
                    if (!formData.nationalite) {
                        setAlert({ type: 'warning', message: 'La nationalité est obligatoire' });
                        return false;
                    }

                    // ✅ Validation CIN/Passeport avec exception Cadet
                    const categorie = calculateCategoryFromAge(formData.dateNaissance);
                    const categoriesAvecValidation = ['CADETS', 'JUNIORS', 'ELITE', 'SENIORS'];
                    const hasException = isCadetException(formData.dateNaissance);

                    if (formData.nationalite === 193) {
                        if (categoriesAvecValidation.includes(categorie) && !hasException) {
                            if (!formData.cinNumber || formData.cinNumber.trim() === '') {
                                setAlert({
                                    type: 'error',
                                    message: 'N° CIN obligatoire à partir de la catégorie cadets pour les joueurs tunisiens'
                                });
                                return false;
                            }

                            if (!formData.cinNumber.match(/^\d{8}$/)) {
                                setAlert({
                                    type: 'error',
                                    message: 'N° CIN tunisien invalide, il doit être composé de 8 chiffres'
                                });
                                return false;
                            }
                        }

                        if (hasException && !formData.cinNumber) {
                            setAlert({
                                type: 'info',
                                message: 'Joueur bénéficie de l\'exception Cadet (né entre 01/09/2010 et 31/12/2010) - CIN non obligatoire'
                            });
                        }
                    } else {
                        if (categoriesAvecValidation.includes(categorie)) {
                            if (!formData.passport || formData.passport.trim() === '') {
                                setAlert({
                                    type: 'error',
                                    message: 'N° Passeport obligatoire pour les joueurs étrangers à partir de la catégorie cadets'
                                });
                                return false;
                            }

                            if (formData.passport.length > 20) {
                                setAlert({
                                    type: 'error',
                                    message: 'N° Passeport invalide, maximum 20 caractères autorisés'
                                });
                                return false;
                            }
                        }
                    }
                }

                // ✅✅✅ AJOUTEZ CE BLOC ICI (AVANT break;) ✅✅✅
                // Validation pour RENOUVELLEMENT
                if (isRenouvellement()) {
                    // Validation nom
                    if (!formData.nom || formData.nom.trim() === '') {
                        setAlert({ type: 'warning', message: 'Le nom est obligatoire' });
                        return false;
                    }

                    // Validation prénom
                    if (!formData.prenom || formData.prenom.trim() === '') {
                        setAlert({ type: 'warning', message: 'Le prénom est obligatoire' });
                        return false;
                    }

                    // Validation date de naissance
                    if (!formData.dateNaissance) {
                        setAlert({ type: 'warning', message: 'La date de naissance est obligatoire' });
                        return false;
                    }

                    // Validation CIN pour Tunisiens Cadets+
                    const categorie = formData.categorie || calculateCategoryFromAge(formData.dateNaissance);
                    const categoriesAvecValidation = ['CADETS', 'JUNIORS', 'ELITE', 'SENIORS'];
                    const hasException = isCadetException(formData.dateNaissance);

                    if (formData.nationalite === 193) {
                        if (categoriesAvecValidation.includes(categorie) && !hasException) {
                            if (!formData.cinNumber || formData.cinNumber.trim() === '') {
                                setAlert({
                                    type: 'error',
                                    message: '⚠️ N° CIN obligatoire pour les joueurs tunisiens à partir de la catégorie CADETS. Veuillez compléter le champ CIN avant de continuer.'
                                });
                                return false;
                            }

                            if (!formData.cinNumber.match(/^\d{8}$/)) {
                                setAlert({
                                    type: 'error',
                                    message: 'N° CIN tunisien invalide, il doit être composé de 8 chiffres'
                                });
                                return false;
                            }
                        }
                    } else {
                        // Pour les étrangers
                        if (categoriesAvecValidation.includes(categorie)) {
                            if (!formData.passport || formData.passport.trim() === '') {
                                setAlert({
                                    type: 'error',
                                    message: 'N° Passeport obligatoire pour les joueurs étrangers à partir de la catégorie CADETS'
                                });
                                return false;
                            }
                        }
                    }
                }

                break;
            case 3:
                if (!formData.nomDocteur || formData.nomDocteur.trim() === '') {
                    setAlert({ type: 'warning', message: 'Le nom du docteur est obligatoire' });
                    return false;
                }
                if (!formData.prenomDocteur || formData.prenomDocteur.trim() === '') {
                    setAlert({ type: 'warning', message: 'Le prénom du docteur est obligatoire' });
                    return false;
                }
                if (!formData.dateConsultation) {
                    setAlert({ type: 'warning', message: 'La date de consultation est obligatoire' });
                    return false;
                }

                if (formData.dateConsultation) {
                    const consultationDate = new Date(formData.dateConsultation);
                    const today = new Date();
                    const oneMonthAgo = new Date();
                    oneMonthAgo.setMonth(today.getMonth() - 1);

                    if (consultationDate > today) {
                        setAlert({ type: 'warning', message: 'La date de consultation ne peut pas être dans le futur' });
                        return false;
                    }

                    if (consultationDate < oneMonthAgo) {
                        setAlert({ type: 'warning', message: 'La consultation médicale ne doit pas dater de plus d\'un mois' });
                        return false;
                    }
                }

                if (isRenouvellement() && [2, 3, 4].includes(formData.regime)) {
                    if (!formData.dateDebutContrat) {
                        setAlert({ type: 'error', message: 'Date de début de contrat obligatoire pour les professionnels' });
                        return false;
                    }
                    if (!formData.dateFinContrat) {
                        setAlert({ type: 'error', message: 'Date de fin de contrat obligatoire pour les professionnels' });
                        return false;
                    }
                }

                if (needsContract() && !formData.dureeContrat) {
                    setAlert({ type: 'warning', message: 'La durée du contrat est obligatoire pour ce régime' });
                    return false;
                }

                if (formData.dureeContrat) {
                    const duree = parseInt(formData.dureeContrat);
                    if (duree < 1 || duree > 60) {
                        setAlert({ type: 'warning', message: 'La durée du contrat doit être entre 1 et 60 mois' });
                        return false;
                    }
                }

                if (formData.numMaillot) {
                    const num = parseInt(formData.numMaillot);
                    if (num < 1 || num > 99) {
                        setAlert({ type: 'warning', message: 'Le numéro de maillot doit être entre 1 et 99' });
                        return false;
                    }
                }
                break;
        }
        setAlert(null);
        return true;
    };

    // ✅ CORRECTION: Soumission complète
    const submitForm = async () => {
        if (needsPlayerSearch() && !formData.previousPlayerId) {
            setAlert({ type: 'error', message: 'Erreur: Aucun joueur sélectionné pour ce type de demande' });
            return;
        }

        if (isNouvelle()) {
            if (formData.dateNaissance) {
                const birthDate = new Date(formData.dateNaissance);
                const today = new Date();
                const age = today.getFullYear() - birthDate.getFullYear();

                if (age < 5) {
                    setAlert({ type: 'error', message: 'Le joueur doit avoir au moins 5 ans' });
                    return;
                }
                if (age > 50) {
                    setAlert({ type: 'error', message: 'Veuillez vérifier la date de naissance (âge > 50 ans)' });
                    return;
                }
            }
        }

        setLoading(true);
        try {
            const categorie = calculateCategoryFromAge(formData.dateNaissance);

            const baseData = {
                name: formData.nom,
                lastName: formData.prenom,
                dateOfBirth: formatDateForBackend(formData.dateNaissance),
                paysId: formData.nationalite,
                teamId: userTeamInfo.teamId,
                seasonId: userTeamInfo.seasonId,
                regimeId: formData.regime,
                typeCompetitionId: formData.typeCompetition,
                positionId: formData.poste || 1,
                cinNumber: formData.cinNumber || null,
                placeOfBirth: formData.lieuNaissance || '',
                nameDoctor: formData.nomDocteur,
                lastNameDoctor: formData.prenomDocteur,
                dateConsultationDoctor: formatDateForBackend(formData.dateConsultation),
                typeLicenceId: formData.typeLicence,
                ctIntervenantTypeId: 1,
                passportNum: formData.passport || null,
                tshirtNum: formData.numMaillot ? parseInt(formData.numMaillot) : null,
                demandeStatuId: 1,
                playerCategoryId: getCategoryId(categorie)
            };

            if (needsContract() || (isRenouvellement() && [2, 3, 4].includes(formData.regime))) {
                if (formData.salaireBase) baseData.salaireBase1 = parseFloat(formData.salaireBase);
                if (formData.dateDebutContrat) baseData.contractDate = formatDateForBackend(formData.dateDebutContrat);
                if (formData.dateFinContrat) baseData.contractDateFin = formatDateForBackend(formData.dateFinContrat);
                if (formData.dureeContrat) baseData.dureePret = parseInt(formData.dureeContrat);
            }

            let response;

            if (isNouvelle()) {
                response = await fetch('http://localhost:8082/api/v1/demandes-players/nouveau-joueur', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(baseData)
                });
            } else if (isRenouvellement()) {
                const renewalData = {
                    typeLicenceId: formData.typeLicence,
                    nameDoctor: formData.nomDocteur,
                    lastNameDoctor: formData.prenomDocteur,
                    dateConsultationDoctor: formatDateForBackend(formData.dateConsultation),
                    teamId: userTeamInfo.teamId,
                    seasonId: userTeamInfo.seasonId,
                    cinNumber: formData.cinNumber || null,  // ✅ AJOUTEZ CETTE LIGNE
                    passportNum: formData.passport || null   // ✅ AJOUTEZ AUSSI LE PASSEPORT
                };

                if ([2, 3, 4].includes(formData.regime)) {
                    renewalData.contractDate = formatDateForBackend(formData.dateDebutContrat);
                    renewalData.contractDateFin = formatDateForBackend(formData.dateFinContrat);
                    if (formData.dureeContrat) renewalData.dureePret = parseInt(formData.dureeContrat);
                    if (formData.salaireBase) renewalData.salaireBase1 = parseFloat(formData.salaireBase);
                }
console.log('📤 Données RENOUVELLEMENT envoyées:', JSON.stringify(renewalData, null, 2));

                response = await fetch(
                    `http://localhost:8082/api/v1/demandes-players/renouvellement/joueur/${formData.previousPlayerId}/season/${userTeamInfo.seasonId}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(renewalData)
                    }
                );
            } else if (isTransfert()) {
                response = await fetch(
                    `http://localhost:8082/api/v1/demandes-players/transfert/joueur/${formData.previousPlayerId}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(baseData)
                    }
                );
            } else if (isPret()) {
                response = await fetch(
                    `http://localhost:8082/api/v1/demandes-players/pret/joueur/${formData.previousPlayerId}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...baseData,
                            dureePret: formData.dureePret || formData.dureeContrat
                        })
                    }
                );
            } else if (isMutation()) {
                response = await fetch(
                    `http://localhost:8082/api/v1/demandes-players/mutation/joueur/${formData.previousPlayerId}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(baseData)
                    }
                );
            }

            if (response && response.ok) {
                const result = await response.json();
                console.log('✅ Réponse OK:', result);
                setAlert({
                    type: 'success',
                    message: 'Demande enregistrée avec succès'
                });
                setCurrentStep(4);
                if (onSuccess) onSuccess();
            } else {
                const errorData = await response.json().catch(() => null);
                // Le backend peut renvoyer soit un tableau d'erreurs, soit un message d'erreur unique
                let errorMessage = 'Erreur inconnue';
                if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
                    errorMessage = errorData.errors.join('\n');
                } else if (errorData?.error) {
                    errorMessage = errorData.error;
                } else if (errorData?.message) {
                    errorMessage = errorData.message;
                }
                console.error('❌ Erreur serveur:', response.status, errorMessage);
                setAlert({
                    type: 'error',
                    message: `Erreur ${response.status}: ${errorMessage}`
                });
            }
        } catch (error) {
            console.error('❌ Erreur:', error);
            setAlert({
                type: 'error',
                message: 'Erreur de connexion au serveur. Vérifiez que le serveur est démarré.'
            });
        }
        setLoading(false);
    };

    // ==================== FONCTIONS DE RENDU ====================

    const renderStep1 = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Configuration de la demande</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Saison</label>
                    <input
                        type="text"
                        value={formData.saison}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type de Compétition</label>
                    <input
                        type="text"
                        value="Football 11"
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Type Intervenant *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.typeIntervenant === 'joueur' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => {
                            handleInputChange('typeIntervenant', 'joueur');
                            handleInputChange('regime', '');
                            handleInputChange('requestType', '');
                            handleInputChange('typeLicence', '');
                        }}
                    >
                        <div className="text-center">
                            <User className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                            <h4 className="font-medium">Joueur</h4>
                        </div>
                    </div>

                    <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.typeIntervenant === 'entraineur' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => {
                            handleInputChange('typeIntervenant', 'entraineur');
                            handleInputChange('regime', '');
                            handleInputChange('requestType', '');
                            handleInputChange('typeLicence', '');
                        }}
                    >
                        <div className="text-center">
                            <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <h4 className="font-medium">Entraineur</h4>
                        </div>
                    </div>

                    <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.typeIntervenant === 'staff' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => {
                            handleInputChange('typeIntervenant', 'staff');
                            handleInputChange('regime', '');
                            handleInputChange('requestType', '');
                            handleInputChange('typeLicence', '');
                        }}
                    >
                        <div className="text-center">
                            <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                            <h4 className="font-medium">Staff Médical</h4>
                        </div>
                    </div>

                    <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.typeIntervenant === 'dirigeant' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => {
                            handleInputChange('typeIntervenant', 'dirigeant');
                            handleInputChange('regime', '');
                            handleInputChange('requestType', '');
                            handleInputChange('typeLicence', '');
                        }}
                    >
                        <div className="text-center">
                            <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                            <h4 className="font-medium">Dirigeants</h4>
                        </div>
                    </div>
                </div>
            </div>

            {formData.typeIntervenant === 'joueur' && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Régime *</label>
                        <select
                            value={formData.regime}
                            onChange={(e) => {
                                const newRegime = parseInt(e.target.value);
                                handleInputChange('regime', newRegime);
                                handleInputChange('requestType', '');
                                handleInputChange('typeLicence', '');
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Sélectionnez un régime</option>
                            {regimes.map(regime => (
                                <option key={regime.id} value={regime.id}>{regime.label}</option>
                            ))}
                        </select>
                    </div>

                    {formData.regime && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Type Licence *</label>
                            <select
                                value={formData.typeLicence}
                                onChange={(e) => handleInputChange('typeLicence', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Sélectionnez un type de licence</option>
                                {getTypesLicenceByRegime(formData.regime).map(type => (
                                    <option key={type.id} value={type.id}>{type.label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {formData.requestType && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm text-blue-800">
                                Type de demande détecté: <strong>
                                    {formData.requestType === 'nouveau' ? 'Nouveau joueur' :
                                        formData.requestType === 'renouvellement' ? 'Renouvellement' :
                                            formData.requestType === 'retour_pret' ? 'Retour Prêt' :
                                                formData.requestType === 'transfert' ? 'Transfert' :
                                                    formData.requestType === 'pret' ? 'Prêt' :
                                                        formData.requestType === 'mutation' ? 'Mutation' : formData.requestType}
                                </strong>
                            </p>
                        </div>
                    )}
                </>
            )}

            {formData.typeIntervenant && formData.typeIntervenant !== 'joueur' && (
                <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-800">
                        Configuration pour {formData.typeIntervenant} sera disponible dans une prochaine version.
                    </p>
                </div>
            )}
        </div>
    );

    const renderStep2 = () => {
        // const needsPlayerSelection = () => needsPlayerSearch();

        return (
            <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                    {needsPlayerSearch() ? 'Recherche Joueur' : 'Informations du nouveau joueur'}

                </h3>

                {needsPlayerSearch() && (

                    <div className="space-y-4">
                        {/* Champ de recherche par licence - SEULEMENT pour NON-RENOUVELLEMENT */}
                        {!isRenouvellement() && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h4 className="font-medium text-blue-900 mb-3">Recherche Joueur</h4>
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-blue-800 mb-2">
                                            Num Licence:
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Saisissez le numéro de licence..."
                                            className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            onChange={(e) => {
                                                const licenceNum = e.target.value;
                                                if (licenceNum.length >= 3) {
                                                    searchPlayerByLicence(licenceNum);
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            type="button"
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                                            onClick={() => {
                                                const input = document.querySelector('input[placeholder="Saisissez le numéro de licence..."]');
                                                if (input && input.value) {
                                                    searchPlayerByLicence(input.value);
                                                }
                                            }}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            ) : (
                                                <Search className="w-4 h-4" />
                                            )}
                                            Chercher
                                        </button>
                                    </div>
                                </div>

                                {/* MESSAGE D'AVERTISSEMENT */}
                                {renewalWarning && (
                                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mt-3">
                                        <div className="flex items-start">
                                            <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-red-800">
                                                    Renouvellement impossible
                                                </p>
                                                <p className="text-sm text-red-700 mt-1">
                                                    {renewalWarning}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Message informatif pour RENOUVELLEMENT */}
                        {isRenouvellement() && (
                            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                                <div className="flex items-start">
                                    <Info className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-green-800 mb-1">
                                            ✅ Mode Renouvellement
                                        </h4>
                                        <p className="text-sm text-green-700">
                                            Seuls les joueurs qui étaient dans votre club la saison précédente
                                            sont affichés dans la liste ci-dessous.
                                            Sélectionnez directement un joueur dans le tableau.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Affichage des infos du joueur sélectionné */}
                        {formData.selectedPlayer && (
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <h4 className="font-medium text-green-900 mb-3">Information Professionnel</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-green-700 font-medium">Nom:</span>
                                        <p className="text-green-800">{formData.nom}</p>
                                    </div>
                                    <div>
                                        <span className="text-green-700 font-medium">Prénom:</span>
                                        <p className="text-green-800">{formData.prenom}</p>
                                    </div>
                                    <div>
                                        <span className="text-green-700 font-medium">Date de naissance:</span>
                                        <p className="text-green-800">{formData.dateNaissance}</p>
                                    </div>
                                    <div>
                                        <span className="text-green-700 font-medium">Catégorie:</span>
                                        <p className="text-green-800">{formData.categorie || 'JUNIORS'}</p>
                                    </div>
                                    <div>
                                        <span className="text-green-700 font-medium">Lieu de naissance:</span>
                                        <p className="text-green-800">{formData.lieuNaissance}</p>
                                    </div>
                                    <div>
                                        <span className="text-green-700 font-medium">Nationalité:</span>
                                        <p className="text-green-800">{nationalities.find(n => n.id === formData.nationalite)?.label || 'TUNISIE'}</p>
                                    </div>
                                    <div>
                                        <span className="text-green-700 font-medium">N° de CIN:</span>
                                        <p className="text-green-800">{formData.cinNumber}</p>
                                    </div>
                                    <div>
                                        <span className="text-green-700 font-medium">N° de passeport:</span>
                                        <p className="text-green-800">{formData.passport}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Liste des joueurs éligibles pour renouvellement */}
                        {isRenouvellement() && !formData.selectedPlayer && (
                            <div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Search className="w-4 h-4 inline mr-2" />
                                        Rechercher un joueur dans la liste
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Tapez le numéro de licence, nom ou prénom..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Joueurs éligibles pour renouvellement
                                </label>
                                {loading ? (
                                    <div className="text-center py-4">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                        <p className="mt-2 text-sm text-gray-600">Chargement...</p>
                                    </div>
                                ) : (
                                    <div className="border rounded-lg">
                                        <div className="max-h-60 overflow-y-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Licence</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prénom</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {players
                                                        .filter(player => {
                                                            if (!searchTerm) return true;
                                                            const search = searchTerm.toLowerCase();
                                                            return (
                                                                player.licenceNum?.toLowerCase().includes(search) ||
                                                                player.nom?.toLowerCase().includes(search) ||
                                                                player.prenom?.toLowerCase().includes(search)
                                                            );
                                                        })
                                                        .map((player, index) => (
                                                            <tr key={`${player.id}-${player.licenceNum}-${index}`} className="hover:bg-gray-50">
                                                                <td className="px-4 py-2 text-sm text-gray-900">{player.licenceNum}</td>
                                                                <td className="px-4 py-2 text-sm text-gray-900">{player.nom}</td>
                                                                <td className="px-4 py-2 text-sm text-gray-900">{player.prenom}</td>
                                                                <td className="px-4 py-2">
                                                                    <button
                                                                        onClick={() => handlePlayerSelect(player)}
                                                                        className="px-3 py-1 text-xs rounded-full bg-blue-600 text-white hover:bg-blue-700"
                                                                    >
                                                                        Sélectionner
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
                {(!needsPlayerSearch() || (needsPlayerSearch() && formData.selectedPlayer)) && (


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                            <input
                                type="text"
                                value={formData.nom}
                                onChange={(e) => handleInputChange('nom', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="NOM"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                            <input
                                type="text"
                                value={formData.prenom}
                                onChange={(e) => handleInputChange('prenom', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="PRENOM"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance *</label>
                            <input
                                type="date"
                                value={formData.dateNaissance}
                                onChange={(e) => handleInputChange('dateNaissance', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Lieu de naissance</label>
                            <input
                                type="text"
                                value={formData.lieuNaissance}
                                onChange={(e) => handleInputChange('lieuNaissance', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="tunis"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nationalité *</label>
                            <select
                                value={formData.nationalite}
                                onChange={(e) => handleInputChange('nationalite', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Sélectionnez une nationalité</option>
                                {nationalities.map(nationalite => (
                                    <option key={nationalite.id} value={nationalite.id}>{nationalite.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Champ CIN - Obligatoire pour Tunisiens Cadets et plus */}
                        {formData.nationalite === 193 &&
                            ['CADETS', 'JUNIORS', 'ELITE', 'SENIORS'].includes(formData.categorie) && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        N° CIN {formData.typeLicence === 2 ? '(Requis pour renouvellement)' : '(Obligatoire)'}
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.cinNumber || ''}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, ''); // Seulement chiffres
                                            if (value.length <= 8) {
                                                setFormData({ ...formData, cinNumber: value });
                                            }
                                        }}
                                        placeholder="Ex: 12345678"
                                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${!formData.cinNumber && formData.typeLicence === 2
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-300'
                                            }`}
                                        maxLength={8}
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Le numéro CIN doit contenir exactement 8 chiffres
                                    </p>
                                    {!formData.cinNumber && formData.typeLicence === 2 && (
                                        <p className="text-xs text-red-600 mt-1 flex items-center">
                                            <AlertCircle className="w-3 h-3 mr-1" />
                                            CIN obligatoire pour valider le renouvellement
                                        </p>
                                    )}
                                </div>
                            )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">N° CIN</label>
                            <input
                                type="text"
                                value={formData.cinNumber}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    if (value.length <= 8) {
                                        handleInputChange('cinNumber', value);
                                    }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="12345678"
                                maxLength="8"
                                disabled={formData.nationalite !== 193}
                            />

                            {formData.nationalite === 193 && formData.cinNumber && !formData.cinNumber.match(/^\d{8}$/) && (
                                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-yellow-800">
                                        Le CIN tunisien doit contenir exactement 8 chiffres
                                    </span>
                                </div>
                            )}

                            {formData.cinNumber && formData.cinNumber.length === 8 && (
                                <div className="text-green-600 text-sm mt-1 flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" />
                                    CIN valide
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">N° de passeport</label>
                            <input
                                type="text"
                                value={formData.passport}
                                onChange={(e) => handleInputChange('passport', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={formData.nationalite === 193}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Poste</label>
                            <select
                                value={formData.poste}
                                onChange={(e) => handleInputChange('poste', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Sélectionnez un poste</option>
                                {postes.map(poste => (
                                    <option key={poste.id} value={poste.id}>{poste.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Num maillot</label>
                            <input
                                type="number"
                                value={formData.numMaillot}
                                onChange={(e) => handleInputChange('numMaillot', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                min="1"
                                max="99"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie (calculée automatiquement)</label>
                            <input
                                type="text"
                                value={calculateCategoryFromAge(formData.dateNaissance)}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderStep3 = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Évaluation Médicale</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom du Docteur *</label>
                    <input
                        type="text"
                        value={formData.nomDocteur}
                        onChange={(e) => handleInputChange('nomDocteur', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="doc"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom du Docteur *</label>
                    <input
                        type="text"
                        value={formData.prenomDocteur}
                        onChange={(e) => handleInputChange('prenomDocteur', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="doc"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date de consultation *</label>
                    <input
                        type="date"
                        value={formData.dateConsultation}
                        onChange={(e) => handleInputChange('dateConsultation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {(needsContract() || (isRenouvellement() && [2, 3, 4].includes(formData.regime))) && (
                <div className="mt-8 border-t pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Informations Contractuelles
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date début contrat *
                            </label>
                            <input
                                type="date"
                                value={formData.dateDebutContrat || ''}
                                onChange={(e) => handleInputChange('dateDebutContrat', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date fin contrat *
                            </label>
                            <input
                                type="date"
                                value={formData.dateFinContrat || ''}
                                onChange={(e) => handleInputChange('dateFinContrat', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Durée du contrat (mois)
                            </label>
                            <input
                                type="number"
                                value={formData.dureeContrat || ''}
                                onChange={(e) => handleInputChange('dureeContrat', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                min="1"
                                max="60"
                                placeholder="12, 24, 36..."
                            />
                        </div>

                        {[2, 3, 4].includes(formData.regime) && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Salaire de base (TND)
                                </label>
                                <input
                                    type="number"
                                    value={formData.salaireBase || ''}
                                    onChange={(e) => handleInputChange('salaireBase', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Montant en TND"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {isPret() && (
                <div className="mt-8 border-t pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Informations Prêt</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Durée de prêt (mois)</label>
                            <input
                                type="number"
                                value={formData.dureePret}
                                onChange={(e) => handleInputChange('dureePret', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                min="1"
                                max="24"
                                placeholder="6, 12, 18, 24"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Club d'origine</label>
                            <input
                                type="text"
                                value={formData.clubOrigine}
                                onChange={(e) => handleInputChange('clubOrigine', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Nom du club d'origine"
                            />
                        </div>
                    </div>
                </div>
            )}

            {formData.selectedPlayer && (
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Joueur sélectionné pour {formData.requestType} :</h4>
                    <p className="text-blue-800">{formData.selectedPlayer.nom} {formData.selectedPlayer.prenom}</p>
                    <p className="text-sm text-blue-700">Licence: {formData.selectedPlayer.licenceNum}</p>
                </div>
            )}
        </div>
    );

    const renderStep4 = () => (
        <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <ModernAlert alert={alert} />
            <button
                onClick={() => {
                    setCurrentStep(1);
                    setFormData({
                        typeIntervenant: '',
                        requestType: '',
                        saison: '2025/2026',
                        regime: '',
                        typeLicence: '',
                        typeCompetition: 1,
                        nom: '',
                        prenom: '',
                        dateNaissance: '',
                        lieuNaissance: '',
                        nationalite: 193,
                        categorie: '',
                        cinNumber: '',
                        passport: '',
                        poste: '',
                        numMaillot: '',
                        nomDocteur: '',
                        prenomDocteur: '',
                        dateConsultation: '',
                        salaireBase: '',
                        dureeContrat: '',
                        dateDebutContrat: '',
                        dateFinContrat: '',
                        previousPlayerId: '',
                        selectedPlayer: null,
                        dureePret: '',
                        clubOrigine: ''
                    });
                    setAlert(null);
                    setPlayers([]);
                    setSearchTerm('');
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                Créer une nouvelle demande
            </button>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white">
            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-700">Chargement en cours...</p>
                    </div>
                </div>
            )}

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Gestion des demandes &gt; Joueur &gt; Enregistrer
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{userTeamInfo ? userTeamInfo.clubName : 'Chargement...'}</span>
                    <span>•</span>
                    <span>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
                </div>
            </div>

            <div className="mb-8">
                <div className="flex items-center">
                    {[1, 2, 3].map((step) => (
                        <React.Fragment key={step}>
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                                }`}>
                                {step}
                            </div>
                            {step < 3 && (
                                <div className={`flex-1 h-1 mx-2 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                                    }`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                    <span>Configuration</span>
                    <span>Informations</span>
                    <span>Validation</span>
                </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}
            </div>

            {alert && currentStep < 4 && (
                <ModernAlert alert={alert} onClose={() => setAlert(null)} />
            )}

            {currentStep < 4 && (
                <div className="flex justify-between">
                    <button
                        onClick={previousStep}
                        disabled={currentStep === 1}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${currentStep === 1
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-600 text-white hover:bg-gray-700'
                            }`}
                    >
                        Retour
                    </button>

                    <button
                        onClick={currentStep === 3 ? submitForm : nextStep}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                        <span>{currentStep === 3 ? 'Valider' : 'Suivant'}</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default PlayerRequestForm;