import React, { useState, useEffect } from 'react';
import { Search, Check, X, Eye, FileText, AlertTriangle, CheckCircle, AlertCircle, Info } from 'lucide-react';
import PDFLicenceService from "./PDFLicenceService";

const ValidationInterface = ({ user }) => {
    const [demandes, setDemandes] = useState([]);
    const [filteredDemandes, setFilteredDemandes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDemandes, setSelectedDemandes] = useState([]);

    // Supprimer le filtre 'etat' car on veut uniquement demandeStatuId: 1
    const [filters, setFilters] = useState({
        saison: '2025/2026',
        clubSaison: 'Stade Tunisien',
        typeCompetition: 'Football 11',
        regime: '',
        typeLicence: '',
        nom: '',
        categorie: '',
        prenoms: '',
        nationalite: '',
        numeroLicence: '',
        codedemande: ''
    });

    const API_BASE_URL = 'http://localhost:8082/api/v1';

    // Charger les demandes avec filtre demandeStatuId: 1
    const loadDemandes = async () => {
        if (!user?.teamId || !user?.seasonId) return;
        setLoading(true);
        try {
            // Ajouter le filtre demandeStatuId=1 dans l'appel API
            const response = await fetch(
                `${API_BASE_URL}/demandes-players?seasonId=${user.seasonId}&teamId=${user.teamId}&size=100&demandeStatuId=1`
            );
            const data = await response.json();
            const demandesData = data.content || [];
            setDemandes(demandesData);
            setFilteredDemandes(demandesData);
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDemandes();
    }, [user?.teamId, user?.seasonId]);

    // Appliquer les filtres (sans le filtre etat)
    useEffect(() => {
        let filtered = [...demandes];
        if (filters.regime) {
            filtered = filtered.filter(d => d.regimeId?.toString() === filters.regime);
        }
        if (filters.typeLicence) {
            filtered = filtered.filter(d => d.typeLicenceId?.toString() === filters.typeLicence);
        }
        if (filters.nom) {
            filtered = filtered.filter(d =>
                d.lastName?.toLowerCase().includes(filters.nom.toLowerCase())
            );
        }
        if (filters.prenoms) {
            filtered = filtered.filter(d =>
                d.name?.toLowerCase().includes(filters.prenoms.toLowerCase())
            );
        }
        if (filters.numeroLicence) {
            filtered = filtered.filter(d =>
                d.licenceNum?.includes(filters.numeroLicence)
            );
        }
        if (filters.codedemande) {
            filtered = filtered.filter(d =>
                d.demandeId?.toString().includes(filters.codedemande)
            );
        }
        setFilteredDemandes(filtered);
    }, [demandes, filters]);

    // États pour le système de notifications et modals
    const [notifications, setNotifications] = useState([]);
    const [modal, setModal] = useState({ type: null, message: '', input: '', resolve: null });

    // Fonction pour ajouter une notification
    const notify = (message, type = 'info') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    };

    // Fonction pour montrer une confirmation
    const showConfirm = (message) => {
        return new Promise((resolve) => {
            setModal({ type: 'confirm', message, resolve });
        });
    };

    // Fonction pour montrer un prompt
    const showPrompt = (message) => {
        return new Promise((resolve) => {
            setModal({ type: 'prompt', message, input: '', resolve });
        });
    };

    // Gérer la fermeture du modal
    const handleModalClose = (value) => {
        modal.resolve(value);
        setModal({ type: null, message: '', input: '', resolve: null });
    };

    // Mise à jour de l'input pour prompt
    const handlePromptInput = (e) => {
        setModal(prev => ({ ...prev, input: e.target.value }));
    };

    // Fonctions de validation
    const handleValider = async () => {
        if (selectedDemandes.length === 0) {
            notify('Veuillez sélectionner au moins une demande à valider', 'error');
            return;
        }

        const demandeCount = selectedDemandes.length;
        const pdfCount = 1;
        const confirmationMessage = `Êtes-vous sûr de vouloir valider ${demandeCount} demande(s) et générer ${pdfCount} PDF avec toutes les licences ?`;

        const confirmed = await showConfirm(confirmationMessage);
        if (!confirmed) return;

        setLoading(true);

        try {
            const playersData = [];

            // 1. Récupérer les données de tous les joueurs sélectionnés
            for (const demandeId of selectedDemandes) {
                const playerResponse = await fetch(`${API_BASE_URL}/demandes-players/${demandeId}`);
                const playerData = await playerResponse.json();
                playersData.push(playerData);
            }

            // 2. Valider toutes les demandes
            for (const demandeId of selectedDemandes) {
                await fetch(`${API_BASE_URL}/demandes-players/${demandeId}/validate?userId=1`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // 3. Générer un seul PDF avec toutes les licences
            const fileName = await PDFLicenceService.generateMultipleLicencesPDF(playersData);

            notify(`Validation terminée !\n✅ ${demandeCount} demande(s) validée(s)\n📄 ${pdfCount} PDF généré avec ${playersData.length} licences\nFichier: ${fileName}`, 'success');

            setSelectedDemandes([]);
            loadDemandes();

        } catch (error) {
            console.error('Erreur:', error);
            notify('Erreur lors du traitement des demandes', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRejeter = async () => {
        if (selectedDemandes.length === 0) {
            notify('Veuillez sélectionner au moins une demande à rejeter', 'error');
            return;
        }

        const motif = await showPrompt('Motif de rejet (optionnel):');
        if (motif === null) return;

        try {
            for (const demandeId of selectedDemandes) {
                await fetch(`${API_BASE_URL}/demandes-players/${demandeId}/reject`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        statutId: 5,
                        motif: motif
                    })
                });
            }
            notify('Demandes rejetées avec succès !', 'success');
            setSelectedDemandes([]);
            loadDemandes();
        } catch (error) {
            console.error('Erreur lors du rejet:', error);
            notify('Erreur lors du rejet', 'error');
        }
    };

    // Fonctions utilitaires (inchangées)
    const getStatusBadge = (statusId) => {
        const statusMap = {
            1: { text: 'Initial', color: '#6b7280', bgColor: '#f3f4f6' },
            2: { text: 'A imprimer', color: '#3b82f6', bgColor: '#eff6ff' },
            3: { text: 'Vers Commission', color: '#8b5cf6', bgColor: '#f5f3ff' },
            4: { text: 'En anomalie', color: '#f59e0b', bgColor: '#fef3c7' },
            5: { text: 'Rejetée', color: '#ef4444', bgColor: '#fef2f2' },
            6: { text: 'En attente', color: '#f59e0b', bgColor: '#fef3c7' },
            7: { text: 'Imprimée', color: '#10b981', bgColor: '#f0fdf4' },
            8: { text: 'Validée par club', color: '#059669', bgColor: '#ecfdf5' },
            9: { text: 'Validée Commission', color: '#16a34a', bgColor: '#f0fdf4' }
        };
        const status = statusMap[statusId] || { text: 'Inconnu', color: '#6b7280', bgColor: '#f3f4f6' };
        return (
            <span style={{
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: status.color,
                backgroundColor: status.bgColor,
                border: `1px solid ${status.color}30`
            }}>
                {status.text}
            </span>
        );
    };

    const getRegimeLabel = (regimeId) => {
        const regimes = {
            1: 'AMATEUR',
            2: 'STAGIAIRE',
            3: 'SEMI-PROFESSIONNEL',
            4: 'PROFESSIONNEL',
            5: 'CP'
        };
        return regimes[regimeId] || 'Inconnu';
    };

    const getCategorieLabel = (categoryId) => {
        const categories = {
            1: 'BENJAMINS',
            2: 'ECOLES',
            3: 'MINIMES',
            4: 'CADETS',
            5: 'JUNIORS',
            6: 'ELITE',
            7: 'SENIORS',
            8: 'JEUNE',
            9: 'CP'
        };
        return categories[categoryId] || 'Non définie';
    };

    const getTypeLicenceLabel = (typeId) => {
        const types = {
            1: 'NOUVELLE',
            2: 'RENOUVELLEMENT',
            3: 'RETOUR PRET',
            4: 'MUTATION',
            5: 'PRET'
        };
        return types[typeId] || 'Inconnu';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const toggleSelection = (demandeId) => {
        setSelectedDemandes(prev =>
            prev.includes(demandeId)
                ? prev.filter(id => id !== demandeId)
                : [...prev, demandeId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedDemandes.length === filteredDemandes.length) {
            setSelectedDemandes([]);
        } else {
            setSelectedDemandes(filteredDemandes.map(d => d.demandeId));
        }
    };

    // Rendu des notifications (toasts)
    const renderNotifications = () => (
        <div style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
        }}>
            {notifications.map(({ id, message, type }) => {
                let Icon, bgColor, textColor;
                switch (type) {
                    case 'success':
                        Icon = CheckCircle;
                        bgColor = '#d1fae5';
                        textColor = '#065f46';
                        break;
                    case 'error':
                        Icon = AlertCircle;
                        bgColor = '#fee2e2';
                        textColor = '#991b1b';
                        break;
                    default:
                        Icon = Info;
                        bgColor = '#e0f2fe';
                        textColor = '#1e40af';
                }
                return (
                    <div key={id} style={{
                        background: bgColor,
                        color: textColor,
                        padding: '1rem',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        maxWidth: '300px',
                        whiteSpace: 'pre-line',
                        animation: 'fadeIn 0.3s ease'
                    }}>
                        <Icon size={20} />
                        <span style={{ fontSize: '0.875rem' }}>{message}</span>
                        <button
                            onClick={() => setNotifications(prev => prev.filter(n => n.id !== id))}
                            style={{
                                marginLeft: 'auto',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: textColor
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                );
            })}
        </div>
    );

    // Rendu du modal
    const renderModal = () => {
        if (!modal.type) return null;

        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1500
            }}>
                <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    maxWidth: '400px',
                    width: '90%'
                }}>
                    <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '1rem'
                    }}>
                        {modal.type === 'prompt' ? 'Saisie requise' : 'Confirmation'}
                    </h3>
                    <p style={{
                        fontSize: '0.875rem',
                        color: '#4b5563',
                        marginBottom: '1.5rem',
                        whiteSpace: 'pre-line'
                    }}>{modal.message}</p>
                    {modal.type === 'prompt' && (
                        <input
                            type="text"
                            value={modal.input}
                            onChange={handlePromptInput}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                marginBottom: '1rem'
                            }}
                        />
                    )}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '1rem'
                    }}>
                        {modal.type !== 'alert' && (
                            <button
                                onClick={() => handleModalClose(modal.type === 'prompt' ? null : false)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}
                            >
                                Annuler
                            </button>
                        )}
                        <button
                            onClick={() => handleModalClose(modal.type === 'prompt' ? modal.input : true)}
                            style={{
                                padding: '0.5rem 1rem',
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            OK
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ padding: '1.5rem', background: '#f8fafc', minHeight: '100vh' }}>
            {/* Header avec breadcrumb */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <span>Gestion des demandes</span>
                    <span>›</span>
                    <span>Joueur</span>
                    <span>›</span>
                    <span style={{ color: '#10b981', fontWeight: '600' }}>Valider</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{
                        fontSize: '1.875rem',
                        fontWeight: '700',
                        color: '#111827',
                        margin: 0
                    }}>
                        Interface de Validation
                    </h1>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        color: '#6b7280',
                        fontSize: '0.875rem'
                    }}>
                        <span>{user?.clubName || 'Stade Tunisien'}</span>
                        <span>•</span>
                        <span>{new Date().toLocaleString('fr-FR')}</span>
                    </div>
                </div>
            </div>
            {/* Section Critères de recherche */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                marginBottom: '1.5rem'
            }}>
                <div style={{
                    background: '#f8fafc',
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid #e5e7eb',
                    borderRadius: '12px 12px 0 0'
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: '#374151' }}>
                        Critères de recherche
                    </h2>
                </div>
                <div style={{ padding: '1.5rem' }}>
                    {/* Première ligne - Infos générales */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginBottom: '1rem'
                    }}>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }}>
                                Saison:
                            </label>
                            <input
                                type="text"
                                value={filters.saison}
                                readOnly
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    backgroundColor: '#f9fafb',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }}>
                                Club Saison:
                            </label>
                            <input
                                type="text"
                                value={filters.clubSaison}
                                readOnly
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    backgroundColor: '#f9fafb',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }}>
                                Type de Compétition:
                            </label>
                            <input
                                type="text"
                                value={filters.typeCompetition}
                                readOnly
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    backgroundColor: '#f9fafb',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>
                    </div>
                    {/* Deuxième ligne - Filtres (sans État) */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem'
                    }}>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }}>
                                Régime:
                            </label>
                            <select
                                value={filters.regime}
                                onChange={(e) => setFilters({ ...filters, regime: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem'
                                }}
                            >
                                <option value="">Tous</option>
                                <option value="1">AMATEUR</option>
                                <option value="2">STAGIAIRE</option>
                                <option value="3">SEMI-PROFESSIONNEL</option>
                                <option value="4">PROFESSIONNEL</option>
                                <option value="5">CP</option>
                            </select>
                        </div>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }}>
                                Type de licence:
                            </label>
                            <select
                                value={filters.typeLicence}
                                onChange={(e) => setFilters({ ...filters, typeLicence: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem'
                                }}
                            >
                                <option value="">Tous</option>
                                <option value="1">NOUVELLE</option>
                                <option value="2">RENOUVELLEMENT</option>
                                <option value="3">RETOUR PRET</option>
                                <option value="4">MUTATION</option>
                                <option value="5">PRET</option>
                            </select>
                        </div>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }}>
                                N° de licence:
                            </label>
                            <input
                                type="text"
                                value={filters.numeroLicence}
                                onChange={(e) => setFilters({ ...filters, numeroLicence: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }}>
                                Nom:
                            </label>
                            <input
                                type="text"
                                value={filters.nom}
                                onChange={(e) => setFilters({ ...filters, nom: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }}>
                                Prénoms:
                            </label>
                            <input
                                type="text"
                                value={filters.prenoms}
                                onChange={(e) => setFilters({ ...filters, prenoms: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }}>
                                Code demande:
                            </label>
                            <input
                                type="text"
                                value={filters.codedemande}
                                onChange={(e) => setFilters({ ...filters, codedemande: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>
                    </div>
                    {/* Boutons d'action */}
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        marginTop: '1.5rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid #e5e7eb'
                    }}>
                        <button
                            onClick={loadDemandes}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.5rem',
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            <Search size={16} />
                            Chercher
                        </button>

                        <button
                            onClick={handleValider}
                            disabled={selectedDemandes.length === 0 || loading}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.5rem',
                                background: selectedDemandes.length > 0 && !loading ? '#10b981' : '#d1d5db',
                                color: selectedDemandes.length > 0 && !loading ? 'white' : '#6b7280',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: selectedDemandes.length > 0 && !loading ? 'pointer' : 'not-allowed'
                            }}
                        >
                            {loading ? (
                                <>
                                    <div style={{
                                        width: '16px',
                                        height: '16px',
                                        border: '2px solid #ffffff40',
                                        borderTop: '2px solid #ffffff',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite'
                                    }}></div>
                                    Traitement en cours...
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={16} />
                                    Valider + PDF ({selectedDemandes.length})
                                </>
                            )}
                        </button>
                        <button
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.5rem',
                                background: '#6b7280',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            <FileText size={16} />
                            Confirmer contrat
                        </button>
                    </div>
                </div>
            </div>
            {/* Liste des demandes */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{
                    background: '#f8fafc',
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid #e5e7eb',
                    borderRadius: '12px 12px 0 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: '#374151' }}>
                        Liste Des Demandes Joueur (Initial)
                    </h2>
                    <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                        {filteredDemandes.length} résultat(s)
                    </span>
                </div>
                {loading ? (
                    <div style={{
                        padding: '3rem',
                        textAlign: 'center',
                        color: '#6b7280'
                    }}>
                        Chargement des demandes...
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    <th style={{
                                        padding: '0.75rem',
                                        textAlign: 'left',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: '#374151',
                                        borderBottom: '1px solid #e5e7eb'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedDemandes.length === filteredDemandes.length && filteredDemandes.length > 0}
                                            onChange={toggleSelectAll}
                                            style={{ marginRight: '0.5rem' }}
                                        />
                                        Sélectionner
                                    </th>
                                    <th style={{
                                        padding: '0.75rem',
                                        textAlign: 'left',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: '#374151',
                                        borderBottom: '1px solid #e5e7eb'
                                    }}>Code</th>
                                    <th style={{
                                        padding: '0.75rem',
                                        textAlign: 'left',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: '#374151',
                                        borderBottom: '1px solid #e5e7eb'
                                    }}>Nom</th>
                                    <th style={{
                                        padding: '0.75rem',
                                        textAlign: 'left',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: '#374151',
                                        borderBottom: '1px solid #e5e7eb'
                                    }}>Prénom</th>
                                    <th style={{
                                        padding: '0.75rem',
                                        textAlign: 'left',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: '#374151',
                                        borderBottom: '1px solid #e5e7eb'
                                    }}>N° de licence</th>
                                    <th style={{
                                        padding: '0.75rem',
                                        textAlign: 'left',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: '#374151',
                                        borderBottom: '1px solid #e5e7eb'
                                    }}>CIN</th>
                                    <th style={{
                                        padding: '0.75rem',
                                        textAlign: 'left',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: '#374151',
                                        borderBottom: '1px solid #e5e7eb'
                                    }}>Date Naiss</th>
                                    <th style={{
                                        padding: '0.75rem',
                                        textAlign: 'left',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: '#374151',
                                        borderBottom: '1px solid #e5e7eb'
                                    }}>Régime</th>
                                    <th style={{
                                        padding: '0.75rem',
                                        textAlign: 'left',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: '#374151',
                                        borderBottom: '1px solid #e5e7eb'
                                    }}>Catégorie</th>
                                    <th style={{
                                        padding: '0.75rem',
                                        textAlign: 'left',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: '#374151',
                                        borderBottom: '1px solid #e5e7eb'
                                    }}>Type</th>
                                    <th style={{
                                        padding: '0.75rem',
                                        textAlign: 'left',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: '#374151',
                                        borderBottom: '1px solid #e5e7eb'
                                    }}>État</th>
                                    <th style={{
                                        padding: '0.75rem',
                                        textAlign: 'left',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: '#374151',
                                        borderBottom: '1px solid #e5e7eb'
                                    }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDemandes.length === 0 ? (
                                    <tr>
                                        <td colSpan="12" style={{
                                            padding: '3rem',
                                            textAlign: 'center',
                                            color: '#6b7280'
                                        }}>
                                            <div style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>
                                                Aucune demande à valider
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
                                                Aucune demande avec le statut "Initial"
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDemandes.map((demande, index) => (
                                        <tr
                                            key={demande.demandeId}
                                            style={{
                                                backgroundColor: index % 2 === 0 ? 'white' : '#fafbfc',
                                                borderBottom: '1px solid #f3f4f6'
                                            }}
                                        >
                                            <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedDemandes.includes(demande.demandeId)}
                                                    onChange={() => toggleSelection(demande.demandeId)}
                                                />
                                            </td>
                                            <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#374151' }}>
                                                {demande.demandeId}
                                            </td>
                                            <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#111827', fontWeight: '600' }}>
                                                {demande.lastName || '-'}
                                            </td>
                                            <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#111827' }}>
                                                {demande.name || '-'}
                                            </td>
                                            <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#374151' }}>
                                                <span style={{
                                                    background: '#f0f9ff',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontFamily: 'monospace',
                                                    fontSize: '0.8rem'
                                                }}>
                                                    {demande.licenceNum || 'En attente'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#374151' }}>
                                                {demande.cinNumber || demande.passportNum || '-'}
                                            </td>
                                            <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#374151' }}>
                                                {formatDate(demande.dateOfBirth)}
                                            </td>
                                            <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                                                <span style={{
                                                    background: '#f3f4f6',
                                                    color: '#374151',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '500'
                                                }}>
                                                    {getRegimeLabel(demande.regimeId)}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                                                <span style={{
                                                    background: '#fef3c7',
                                                    color: '#92400e',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '500'
                                                }}>
                                                    {getCategorieLabel(demande.playerCategoryId)}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                                                <span style={{
                                                    background: '#dbeafe',
                                                    color: '#1d4ed8',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '500'
                                                }}>
                                                    {getTypeLicenceLabel(demande.typeLicenceId)}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                                                {getStatusBadge(demande.demandeStatuId)}
                                            </td>
                                            <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        style={{
                                                            padding: '0.25rem 0.5rem',
                                                            background: '#3b82f6',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            fontSize: '0.75rem',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.25rem'
                                                        }}
                                                        title="Consulter les détails"
                                                    >
                                                        <Eye size={12} />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleSelection(demande.demandeId)}
                                                        style={{
                                                            padding: '0.25rem 0.5rem',
                                                            background: selectedDemandes.includes(demande.demandeId) ? '#10b981' : '#6b7280',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            fontSize: '0.75rem',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.25rem'
                                                        }}
                                                        title="Sélectionner pour validation"
                                                    >
                                                        <Check size={12} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {/* Footer avec statistiques */}
            <div style={{
                marginTop: '1.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
            }}>
                <div style={{
                    background: 'white',
                    padding: '1rem',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6' }}>
                        {filteredDemandes.length}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        Total demandes (Initial)
                    </div>
                </div>
            </div>
            {/* Message de sélection */}
            {selectedDemandes.length > 0 && (
                <div style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    padding: '1rem 1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    zIndex: 1000
                }}>
                    <CheckCircle size={20} />
                    <span style={{ fontWeight: '600' }}>
                        {selectedDemandes.length} demande(s) sélectionnée(s)
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={handleValider}
                            style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Valider
                        </button>
                        <button
                            onClick={handleRejeter}
                            style={{
                                background: 'rgba(239, 68, 68, 0.9)',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Rejeter
                        </button>
                    </div>
                </div>
            )}
            {renderNotifications()}
            {renderModal()}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default ValidationInterface;