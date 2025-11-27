import React, { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, Download, Plus, RefreshCw, Search, Filter, Upload, User } from 'lucide-react';
import PlayerDetailModal from '../components/PlayerDetailModal';
import PlayerRequestForm from '../components/PlayerRequestForm';

const API_BASE_URL = 'http://localhost:8082/api/v1';

const JoueurPage = ({ user, intervenantTypeId }) => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [selectedPlayerIdForEdit, setSelectedPlayerIdForEdit] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // Filtres
  const [filters, setFilters] = useState({
    regime: '',
    licenseType: '',
    status: '',
    licenseNumber: '',
    name: '',
    firstName: '',
    requestCode: '',
    category: '',
    nationality: '',
    search: ''
  });

  // Vue mode et sélection
  const [viewMode, setViewMode] = useState('table');
  const [selectedPlayers, setSelectedPlayers] = useState([]);

  // NOUVELLES FONCTIONS POUR LES MODIFICATIONS DEMANDÉES

  // Fonction pour calculer l'âge
  const calculateAge = (birthDate) => {
    if (!birthDate) return '-';

    let date;
    try {
      if (typeof birthDate === 'string' && birthDate.includes('/')) {
        const [day, month, year] = birthDate.split('/');
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(birthDate);
      }

      const today = new Date();
      let age = today.getFullYear() - date.getFullYear();
      const monthDiff = today.getMonth() - date.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
        age--;
      }

      return age;
    } catch (error) {
      return '-';
    }
  };



  // Charger les joueurs
  const loadPlayers = async (page = 0) => {
    if (!user?.teamId || !user?.seasonId) return;

    setLoading(true);
    try {
      let url = `${API_BASE_URL}/demandes-players?seasonId=${user.seasonId}&teamId=${user.teamId}&page=${page}&size=${pageSize}`;
      if (intervenantTypeId) {
        url += `&ctIntervenantTypeId=${intervenantTypeId}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      const data = await response.json();

      const playersData = data.content || [];

      // ENRICHIR LES DONNÉES AVEC LES NOUVELLES INFORMATIONS
      // NOUVEAU CODE
      const enrichedPlayers = playersData.map(player => ({
        ...player,
        fifaId: player.fifaId || 'Non attribué',
        jerseyNumber: player.jerseyNumber || 'N/A',
        age: calculateAge(player.dateOfBirth)
      }));

      setPlayers(enrichedPlayers);
      setFilteredPlayers(enrichedPlayers);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      alert('Erreur lors du chargement des données.');
    } finally {
      setLoading(false);
    }
  };

  // Appliquer les filtres
  useEffect(() => {
    let filtered = [...players];

    if (filters.regime) {
      filtered = filtered.filter(player => player.regimeId && player.regimeId.toString() === filters.regime);
    }
    if (filters.licenseType) {
      filtered = filtered.filter(player => player.typeLicenceId && player.typeLicenceId.toString() === filters.licenseType);
    }
    if (filters.status) {
      filtered = filtered.filter(player => player.demandeStatuId && player.demandeStatuId.toString() === filters.status);
    }
    if (filters.licenseNumber) {
      filtered = filtered.filter(player => player.licenceNum && player.licenceNum.toString().includes(filters.licenseNumber));
    }
    if (filters.name) {
      const lastName = filters.name.toLowerCase();
      filtered = filtered.filter(player => (player.lastName || '').toLowerCase().includes(lastName));
    }
    if (filters.firstName) {
      const firstName = filters.firstName.toLowerCase();
      filtered = filtered.filter(player => (player.name || '').toLowerCase().includes(firstName));
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(player => {
        const fullName = player.fullName || `${player.lastName || ''} ${player.name || ''}`.trim();
        return fullName.toLowerCase().includes(search) ||
          (player.licenceNum && player.licenceNum.toLowerCase().includes(search)) ||
          (player.cinNumber && player.cinNumber.toLowerCase().includes(search)) ||
          (player.fifaId && player.fifaId.toLowerCase().includes(search)); // Ajout recherche FIFA ID
      });
    }

    setFilteredPlayers(filtered);
  }, [players, filters]);

  // Charger au montage
  useEffect(() => {
    if (user?.teamId && user?.seasonId) {
      loadPlayers(0);
    }
  }, [user?.teamId, user?.seasonId, pageSize, intervenantTypeId]);

  // Gestion pagination
  const handleNextPage = () => {
    if (currentPage < totalPages - 1) loadPlayers(currentPage + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 0) loadPlayers(currentPage - 1);
  };
  const handlePageSizeChange = (size) => {
    setPageSize(size);
    loadPlayers(0);
  };

  // Actions
  const handleDeletePlayer = async (playerId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/demandes-players/${playerId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          alert('Demande supprimée avec succès !');
          loadPlayers(currentPage);
        } else {
          alert('Erreur lors de la suppression');
        }
      } catch (error) {
        alert('Erreur de connexion');
      }
    }
  };

  const handleDownloadPDF = async (playerId) => {
    try {
      alert(`Génération du PDF pour la demande ${playerId}`);
    } catch (error) {
      alert('Erreur lors de la génération du PDF');
    }
  };

  const handleRowClick = (player) => {
    if (!player.demandeId) return;
    setSelectedPlayerId(player.demandeId);
  };

  // Sélection multiple
  const togglePlayerSelection = (playerId) => {
    setSelectedPlayers(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const selectAllPlayers = () => {
    if (selectedPlayers.length === filteredPlayers.length) {
      setSelectedPlayers([]);
    } else {
      setSelectedPlayers(filteredPlayers.map(p => p.demandeId));
    }
  };

  // Badges de statut
  const getStatusBadge = (statusId) => {
    const statusMap = {
      1: { text: 'Initial', color: '#6b7280', bg: '#f3f4f6' },
      2: { text: 'A imprimer', color: '#3b82f6', bg: '#dbeafe' },
      3: { text: 'Vers Commission', color: '#8b5cf6', bg: '#ede9fe' },
      4: { text: 'En anomalie', color: '#f59e0b', bg: '#fef3c7' },
      5: { text: 'Rejetée', color: '#ef4444', bg: '#fee2e2' },
      6: { text: 'En attente', color: '#f59e0b', bg: '#fef3c7' },
      7: { text: 'Imprimée', color: '#10b981', bg: '#d1fae5' },
      8: { text: 'Validée par club', color: '#059669', bg: '#dcfce7' },
      9: { text: 'Validée Commission', color: '#16a34a', bg: '#dcfce7' },
      10: { text: 'A imprimer (Ligue)', color: '#0891b2', bg: '#cffafe' },
      11: { text: 'A vérifier', color: '#eab308', bg: '#fef3c7' }
    };
    const status = statusMap[statusId] || { text: 'Inconnu', color: '#6b7280', bg: '#f3f4f6' };
    return (
      <span style={{
        padding: '0.375rem 0.875rem',
        borderRadius: '50px',
        fontSize: '0.75rem',
        fontWeight: '600',
        color: status.color,
        backgroundColor: status.bg,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: status.color
        }} />
        {status.text}
      </span>
    );
  };

  const getLicenseTypeBadge = (typeId) => {
    const typeMap = {
      1: { text: 'NOUVELLE', color: '#007bff' },
      2: { text: 'RENOUVELLEMENT', color: '#17a2b8' },
      3: { text: 'RETOUR PRET', color: '#ffc107', textColor: '#212529' },
      4: { text: 'MUTATION', color: '#6c757d' },
      5: { text: 'PRET', color: '#6f42c1' },
      6: { text: 'DEMISSION', color: '#e83e8c' },
      7: { text: 'Mutation Exceptionelle', color: '#20c997' },
      8: { text: 'TRANSFERT', color: '#fd7e14' },
      9: { text: 'RETOUR MUTATION', color: '#6610f2' },
      10: { text: 'SURCLASSEMENT', color: '#6f42c1' },
      11: { text: 'LIBRE (AMATEUR)', color: '#d63384' },
      12: { text: 'TRANSFERT LIBRE', color: '#0dcaf0' },
      14: { text: 'Transfert à l\'etranger', color: '#198754' },
      15: { text: 'ANCIEN LICENCIÉ', color: '#6c757d' }
    };
    const type = typeMap[typeId] || { text: 'Inconnu', color: '#e9ecef', textColor: '#495057' };
    return (
      <span style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '6px',
        fontSize: '0.8rem',
        fontWeight: '500',
        color: type.textColor || 'white',
        backgroundColor: type.color
      }}>
        {type.text}
      </span>
    );
  };

  const getRegimeBadge = (regimeId) => {
    const regimeMap = {
      1: { text: 'AMATEUR', color: '#007bff' },
      2: { text: 'STAGIAIRE', color: '#17a2b8' },
      3: { text: 'SEMI-PROFESSIONNEL', color: '#ffc107', textColor: '#212529' },
      4: { text: 'PROFESSIONNEL', color: '#6c757d' },
      5: { text: 'CP', color: '#6f42c1' }
    };
    const regime = regimeMap[regimeId] || { text: 'Inconnu', color: '#e9ecef', textColor: '#495057' };
    return (
      <span style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '6px',
        fontSize: '0.8rem',
        fontWeight: '500',
        color: regime.textColor || 'white',
        backgroundColor: regime.color
      }}>
        {regime.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch (error) {
      return dateString;
    }
  };

  const exportToCSV = () => {
    if (filteredPlayers.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }
    const csvContent = [
      ['Nom Complet', 'FIFA ID', 'Maillot', 'Âge', 'CIN', 'Date Naissance', 'Licence', 'Statut', 'Type'],
      ...filteredPlayers.map(player => [
        player.fullName || `${player.lastName} ${player.name}`,
        player.fifaId || '',
        player.jerseyNumber || '',
        player.age || '',
        player.cinNumber || player.passportNum || '',
        player.dateOfBirth || '',
        player.licenceNum || '',
        'Statut',
        'Type'
      ])
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `joueurs_equipe_${user.teamId}_saison_${user.seasonId}.csv`;
    link.click();
  };

  const getPageTitle = () => {
    switch (intervenantTypeId) {
      case 1: return 'Joueurs';
      case 2: return 'Dirigeants';
      case 3: return 'Entraîneurs';
      case 4: return 'Staff Médical';
      default: return 'Intervenants';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        padding: '3rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '2rem',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #f3f4f6',
            borderTop: '3px solid #dc2626',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span style={{ fontSize: '1.1rem', color: '#374151' }}>
            Chargement des {getPageTitle().toLowerCase()}...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* BARRE DE TEST POUR CONFIRMER LES MODIFICATIONS */}
      <div style={{
        background: 'red',
        color: 'white',
        padding: '10px',
        fontSize: '16px',
        textAlign: 'center',
        fontWeight: 'bold'
      }}>
        ✅ NOUVELLES FONCTIONNALITÉS ACTIVES : FIFA ID + MAILLOT + ÂGE
      </div>

      <div style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        minHeight: '100vh'
      }}>
        {/* Header moderne */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '2rem'
          }}>
            <div>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                margin: '0 0 0.5rem 0',
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Liste des {getPageTitle()}
              </h1>
              <p style={{
                color: '#6b7280',
                fontSize: '1.1rem',
                margin: 0,
                fontWeight: '500'
              }}>
                {user?.clubName} • Équipe {user?.teamId} • Saison {user?.seasonId}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Mode Switch */}
              <div style={{
                display: 'flex',
                background: '#f3f4f6',
                borderRadius: '12px',
                padding: '0.25rem'
              }}>
                <button
                  onClick={() => setViewMode('table')}
                  style={{
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderRadius: '8px',
                    background: viewMode === 'table' ? 'white' : 'transparent',
                    color: viewMode === 'table' ? '#111827' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Tableau
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  style={{
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderRadius: '8px',
                    background: viewMode === 'cards' ? 'white' : 'transparent',
                    color: viewMode === 'cards' ? '#111827' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Cartes
                </button>
              </div>

              {/* Boutons d'action */}
              <button
                onClick={() => loadPlayers(currentPage)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.25rem',
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  color: '#374151',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={16} />
                Actualiser
              </button>

              <button
                onClick={exportToCSV}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.25rem',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <Download size={16} />
                Exporter CSV
              </button>

              <button
                onClick={() => setShowCreateForm(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <Plus size={16} />
                Nouveau {getPageTitle().slice(0, -1)}
              </button>
            </div>
          </div>

          {/* Barre de recherche */}
          <div style={{ position: 'relative' }}>
            <Search
              size={20}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }}
            />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom, CIN, licence ou FIFA ID..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              style={{
                width: '100%',
                paddingLeft: '3rem',
                paddingRight: '1rem',
                paddingTop: '0.875rem',
                paddingBottom: '0.875rem',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '0.95rem',
                background: '#f9fafb',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Sélection multiple */}
        {selectedPlayers.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '16px',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ fontWeight: '600' }}>
              {selectedPlayers.length} {getPageTitle().toLowerCase()} sélectionné{selectedPlayers.length !== 1 ? 's' : ''}
            </div>
            <button
              onClick={() => setSelectedPlayers([])}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                padding: '0.5rem',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Contenu principal */}
        {viewMode === 'table' ? (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: 'white',
              padding: '1.5rem 2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
                📋 Résultats
              </h3>
              <span>{filteredPlayers.length} {getPageTitle().toLowerCase()} sur {totalElements} au total</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th style={{
                      padding: '1.25rem 1.5rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      width: '50px'
                    }}>
                      <input
                        type="checkbox"
                        checked={selectedPlayers.length === filteredPlayers.length && filteredPlayers.length > 0}
                        onChange={selectAllPlayers}
                        style={{ width: '16px', height: '16px', accentColor: '#dc2626' }}
                      />
                    </th>
                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                      Nom Complet
                    </th>
                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                      Maillot / Âge
                    </th>
                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                      FIFA ID
                    </th>
                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                      CIN
                    </th>
                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                      Date Naissance
                    </th>
                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                      Licence
                    </th>
                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                      Statut
                    </th>
                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                      Régime
                    </th>
                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.length === 0 ? (
                    <tr>
                      <td colSpan="10" style={{ padding: '4rem 2rem', textAlign: 'center', color: '#6b7280' }}>
                        <User size={64} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                          Aucun {getPageTitle().toLowerCase().slice(0, -1)} trouvé
                        </h3>
                      </td>
                    </tr>
                  ) : (
                    filteredPlayers.map((player, index) => {
                      const isSelected = selectedPlayers.includes(player.demandeId);

                      return (
                        <tr
                          key={player.demandeId}
                          onClick={() => handleRowClick(player)}
                          style={{
                            backgroundColor: isSelected ? '#fef2f2' : (index % 2 === 0 ? '#fafbfc' : 'white'),
                            cursor: 'pointer',
                            borderLeft: isSelected ? '4px solid #dc2626' : '4px solid transparent'
                          }}
                        >
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                togglePlayerSelection(player.demandeId);
                              }}
                              style={{ width: '16px', height: '16px', accentColor: '#dc2626' }}
                            />
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '0.875rem',
                                fontWeight: '600'
                              }}>
                                {((player.lastName?.[0] || '') + (player.name?.[0] || '')).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: '600', color: '#111827', fontSize: '0.95rem' }}>
                                  {player.fullName || `${player.lastName || ''} ${player.name || ''}`}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                  Joueur #{player.demandeId}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem'
                            }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: '#4CAF50',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                              }}>
                                {player.jerseyNumber}
                              </div>
                              <div>
                                <div style={{
                                  fontSize: '0.9rem',
                                  fontWeight: '600',
                                  color: '#111827'
                                }}>
                                  {player.age} ans
                                </div>
                                <div style={{
                                  fontSize: '0.75rem',
                                  color: '#6b7280'
                                }}>
                                  Maillot #{player.jerseyNumber}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <span style={{
                              background: '#e0f2fe',
                              color: '#0c4a6e',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              fontWeight: '500',
                              fontFamily: 'monospace'
                            }}>
                              {player.fifaId}
                            </span>
                          </td>

                          <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: '#374151' }}>
                            {player.cinNumber || player.passportNum || '-'}
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: '#374151' }}>
                            {formatDate(player.dateOfBirth)}
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: '#374151' }}>
                            {player.licenceNum || 'En attente'}
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            {getStatusBadge(player.demandeStatuId)}
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            {getRegimeBadge(player.regimeId)}
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                              {player.demandeStatuId === 1 ? (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedPlayerIdForEdit(player.demandeId);
                                    }}
                                    style={{
                                      padding: '0.5rem',
                                      border: 'none',
                                      borderRadius: '8px',
                                      background: '#dbeafe',
                                      color: '#2563eb',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeletePlayer(player.demandeId);
                                    }}
                                    style={{
                                      padding: '0.5rem',
                                      border: 'none',
                                      borderRadius: '8px',
                                      background: '#fee2e2',
                                      color: '#dc2626',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadPDF(player.demandeId);
                                  }}
                                  style={{
                                    padding: '0.5rem',
                                    border: 'none',
                                    borderRadius: '8px',
                                    background: '#dcfce7',
                                    color: '#16a34a',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Download size={14} />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRowClick(player);
                                }}
                                style={{
                                  padding: '0.5rem',
                                  border: 'none',
                                  borderRadius: '8px',
                                  background: '#f3f4f6',
                                  color: '#374151',
                                  cursor: 'pointer'
                                }}
                              >
                                <Eye size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.5rem 2rem',
                backgroundColor: '#f8fafc',
                borderTop: '1px solid #f1f5f9'
              }}>
                <div>
                  <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                    Résultats {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)} sur {totalElements}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      background: currentPage === 0 ? '#f9fafb' : 'white',
                      color: currentPage === 0 ? '#9ca3af' : '#374151',
                      cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Précédent
                  </button>
                  <span style={{ color: '#374151', fontWeight: '500', fontSize: '0.9rem' }}>
                    Page {currentPage + 1} / {totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages - 1}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      background: currentPage === totalPages - 1 ? '#f9fafb' : 'white',
                      color: currentPage === totalPages - 1 ? '#9ca3af' : '#374151',
                      cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Suivant
                  </button>
                </div>
                <div>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      background: 'white'
                    }}
                  >
                    <option value="10">10 par page</option>
                    <option value="20">20 par page</option>
                    <option value="50">50 par page</option>
                    <option value="100">100 par page</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Vue en cartes
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem'
          }}>
            {filteredPlayers.map((player) => {
              const isSelected = selectedPlayers.includes(player.demandeId);

              return (
                <div
                  key={player.demandeId}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: isSelected
                      ? '0 10px 25px rgba(220, 38, 38, 0.15), 0 0 0 2px #dc2626'
                      : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: isSelected ? '1px solid #dc2626' : '1px solid rgba(255, 255, 255, 0.2)',
                    cursor: 'pointer'
                  }}
                  onClick={() => togglePlayerSelection(player.demandeId)}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '700'
                      }}>
                        {((player.lastName?.[0] || '') + (player.name?.[0] || '')).toUpperCase()}
                      </div>
                      <div>
                        <h3 style={{
                          margin: '0 0 0.25rem 0',
                          fontSize: '1.1rem',
                          fontWeight: '700',
                          color: '#111827'
                        }}>
                          {player.fullName || `${player.lastName || ''} ${player.name || ''}`}
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>
                          Joueur #{player.demandeId}
                        </p>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#4CAF50',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}>
                        {player.jerseyNumber}
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          togglePlayerSelection(player.demandeId);
                        }}
                        style={{ width: '18px', height: '18px', accentColor: '#dc2626' }}
                      />
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        marginBottom: '0.25rem',
                        fontWeight: '500'
                      }}>
                        ÂGE / MAILLOT
                      </div>
                      <div style={{
                        fontSize: '0.9rem',
                        color: '#111827',
                        fontWeight: '600'
                      }}>
                        {player.age} ans • #{player.jerseyNumber}
                      </div>
                    </div>

                    <div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        marginBottom: '0.25rem',
                        fontWeight: '500'
                      }}>
                        FIFA ID
                      </div>
                      <div style={{
                        fontSize: '0.8rem',
                        color: '#0c4a6e',
                        fontWeight: '500',
                        fontFamily: 'monospace',
                        background: '#e0f2fe',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px'
                      }}>
                        {player.fifaId}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        marginBottom: '0.25rem',
                        fontWeight: '500'
                      }}>
                        CIN
                      </div>
                      <div style={{
                        fontSize: '0.9rem',
                        color: '#111827',
                        fontWeight: '500'
                      }}>
                        {player.cinNumber || player.passportNum || '-'}
                      </div>
                    </div>

                    <div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        marginBottom: '0.25rem',
                        fontWeight: '500'
                      }}>
                        DATE NAISSANCE
                      </div>
                      <div style={{
                        fontSize: '0.9rem',
                        color: '#111827',
                        fontWeight: '500'
                      }}>
                        {formatDate(player.dateOfBirth)}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                  }}>
                    {getStatusBadge(player.demandeStatuId)}

                    <div style={{
                      fontSize: '0.85rem',
                      color: '#6b7280'
                    }}>
                      {player.licenceNum || 'En attente'}
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {getRegimeBadge(player.regimeId)}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(player);
                        }}
                        style={{
                          padding: '0.5rem',
                          border: 'none',
                          borderRadius: '8px',
                          background: '#f3f4f6',
                          color: '#374151',
                          cursor: 'pointer'
                        }}
                      >
                        <Eye size={14} />
                      </button>
                      {player.demandeStatuId === 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPlayerIdForEdit(player.demandeId);
                          }}
                          style={{
                            padding: '0.5rem',
                            border: 'none',
                            borderRadius: '8px',
                            background: '#dbeafe',
                            color: '#2563eb',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modales */}
        {selectedPlayerIdForEdit && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem'
          }}>
            <div style={{
              backgroundColor: 'white', borderRadius: '16px', maxWidth: '900px',
              width: '100%', maxHeight: '90vh', overflow: 'auto',
              position: 'relative'
            }}>
              <button
                onClick={() => setSelectedPlayerIdForEdit(null)}
                style={{
                  position: 'absolute', top: '1rem', right: '1rem',
                  background: 'none', border: 'none', fontSize: '1.5rem',
                  cursor: 'pointer', zIndex: 1001
                }}
              >
                ✕
              </button>
              <PlayerRequestForm
                playerId={selectedPlayerIdForEdit}
                isEditMode={true}
                onSuccess={() => {
                  setSelectedPlayerIdForEdit(null);
                  loadPlayers(currentPage);
                }}
              />
            </div>
          </div>
        )}

        {selectedPlayerId && (
          <PlayerDetailModal
            playerId={selectedPlayerId}
            onClose={() => setSelectedPlayerId(null)}
            onPlayerDeleted={() => {
              setSelectedPlayerId(null);
              loadPlayers(currentPage);
            }}
          />
        )}

        {showCreateForm && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem'
          }}>
            <div style={{
              backgroundColor: 'white', borderRadius: '16px', maxWidth: '900px',
              width: '100%', maxHeight: '90vh', overflow: 'auto',
              position: 'relative'
            }}>
              <button
                onClick={() => setShowCreateForm(false)}
                style={{
                  position: 'absolute', top: '1rem', right: '1rem',
                  background: 'none', border: 'none', fontSize: '1.5rem',
                  cursor: 'pointer', zIndex: 1001
                }}
              >
                ✕
              </button>
              <PlayerRequestForm
                onSuccess={() => {
                  setShowCreateForm(false);
                  loadPlayers(currentPage);
                }}
              />
            </div>
          </div>
        )}

        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default JoueurPage;