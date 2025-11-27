import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Plus, Edit, Trash2, Eye, MoreVertical, RefreshCw, Upload, User, Calendar, Award, CheckCircle, X, Clock } from 'lucide-react';

const ModernPlayerInterface = ({ user }) => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    regime: 'Tous',
    typeLicence: 'Tous',
    etat: 'Tous',
    categorie: 'Toutes'
  });
  const [viewMode, setViewMode] = useState('table');
  const [selectedPlayers, setSelectedPlayers] = useState([]);

  // Fonction pour calculer l'âge
  const calculateAge = (birthDate) => {
    if (!birthDate) return '-';
    
    let date;
    if (birthDate.includes('/')) {
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
  };

  // Fonction pour générer FIFA ID
  const generateFifaId = (licenceNum, playerId) => {
    if (licenceNum) {
      return `FIFA_${licenceNum}`;
    }
    return `FIFA_${playerId}_TEMP`;
  };

  // Fonction pour générer un numéro de maillot
  const generateJerseyNumber = (playerId) => {
    return ((playerId * 7) % 99) + 1;
  };

  useEffect(() => {
    loadPlayers();
  }, [user]);

  const loadPlayers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8082/api/v1/demandes-players?seasonId=${user?.seasonId}&teamId=${user?.teamId}&size=1000`
      );
      const data = await response.json();
      const playersData = data.content || [];
      
      // Enrichir les données avec FIFA ID, numéro de maillot et âge
      const enrichedPlayers = playersData.map(player => ({
        ...player,
        fifaId: generateFifaId(player.licenceNum, player.id),
        jerseyNumber: generateJerseyNumber(player.id),
        age: calculateAge(player.birthDate)
      }));
      
      setPlayers(enrichedPlayers);
      setFilteredPlayers(enrichedPlayers);
    } catch (error) {
      console.error('Erreur chargement joueurs:', error);
      // Données de démonstration
      const demoData = [
        {
          id: 1,
          name: 'SHIMI',
          lastName: 'MOHAMED AZIZ',
          cin: '',
          birthDate: '21/01/2011',
          licenceNum: '110121018',
          demandeStatuId: 1,
          regimeId: 1,
          typeLicenceId: 2,
          playerCategoryId: 5,
          fifaId: 'FIFA_110121018',
          jerseyNumber: 8,
          age: calculateAge('21/01/2011')
        },
        {
          id: 2,
          name: 'HAJRI',
          lastName: 'MOHAMED',
          cin: '',
          birthDate: '28/07/2006',
          licenceNum: '',
          demandeStatuId: 1,
          regimeId: 1,
          typeLicenceId: 2,
          playerCategoryId: 5,
          fifaId: 'FIFA_2_TEMP',
          jerseyNumber: 15,
          age: calculateAge('28/07/2006')
        }
      ];
      setPlayers(demoData);
      setFilteredPlayers(demoData);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (statusId) => {
    const statusMap = {
      1: { label: 'Initial', color: '#6b7280', bg: '#f3f4f6' },
      2: { label: 'A imprimer', color: '#3b82f6', bg: '#dbeafe' },
      3: { label: 'Vers Commission', color: '#8b5cf6', bg: '#ede9fe' },
      4: { label: 'En anomalie', color: '#f59e0b', bg: '#fef3c7' },
      5: { label: 'Rejetée', color: '#ef4444', bg: '#fee2e2' },
      6: { label: 'En attente', color: '#f59e0b', bg: '#fef3c7' },
      7: { label: 'Imprimée', color: '#10b981', bg: '#d1fae5' },
      8: { label: 'Validée', color: '#059669', bg: '#dcfce7' }
    };
    return statusMap[statusId] || { label: 'Inconnu', color: '#6b7280', bg: '#f3f4f6' };
  };

  const getRegimeLabel = (regimeId) => {
    const regimeMap = { 1: 'AMATEUR', 2: 'STAGIAIRE', 3: 'SEMI-PRO', 4: 'PROFESSIONNEL' };
    return regimeMap[regimeId] || 'N/A';
  };

  const getLicenceTypeLabel = (typeId) => {
    const typeMap = { 1: 'NOUVELLE', 2: 'RENOUVELLEMENT', 3: 'RETOUR PRET' };
    return typeMap[typeId] || 'N/A';
  };

  // Filtrage
  useEffect(() => {
    let filtered = players.filter(player => {
      const matchesSearch = 
        (player.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (player.lastName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (player.licenceNum?.includes(searchTerm)) ||
        (player.fifaId?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesSearch;
    });
    
    setFilteredPlayers(filtered);
  }, [searchTerm, players, filters]);

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
      setSelectedPlayers(filteredPlayers.map(p => p.id));
    }
  };

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
            Chargement des joueurs...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* LIGNE DE TEST - VISIBLE SI LE CODE EST CHARGÉ */}
      <div style={{
        background: 'red', 
        color: 'white', 
        padding: '10px', 
        fontSize: '16px', 
        textAlign: 'center',
        fontWeight: 'bold'
      }}>
        VERSION MODIFIÉE AVEC FIFA ID + MAILLOT + ÂGE
      </div>
      
      <div style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        minHeight: '100vh'
      }}>
        {/* Header */}
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
                Gestion des Joueurs
              </h1>
              <p style={{
                color: '#6b7280',
                fontSize: '1.1rem',
                margin: 0,
                fontWeight: '500'
              }}>
                {user?.clubName} • {filteredPlayers.length} joueur{filteredPlayers.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button
                onClick={loadPlayers}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.25rem',
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  color: '#374151',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={16} />
                Actualiser
              </button>

              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                cursor: 'pointer'
              }}>
                <Plus size={16} />
                Nouveau Joueur
              </button>
            </div>
          </div>

          {/* Recherche */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '1rem',
            alignItems: 'center'
          }}>
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
                placeholder="Rechercher par nom, prénom, licence ou FIFA ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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

            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.875rem 1.25rem',
              background: '#f3f4f6',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              color: '#374151',
              cursor: 'pointer'
            }}>
              <Filter size={16} />
              Filtres
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <tr>
                  <th style={{
                    padding: '1.25rem 1.5rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    Nom Complet
                  </th>
                  <th style={{
                    padding: '1.25rem 1.5rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    Maillot / Âge
                  </th>
                  <th style={{
                    padding: '1.25rem 1.5rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    Date Naissance
                  </th>
                  <th style={{
                    padding: '1.25rem 1.5rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    FIFA ID
                  </th>
                  <th style={{
                    padding: '1.25rem 1.5rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    Licence
                  </th>
                  <th style={{
                    padding: '1.25rem 1.5rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    Statut
                  </th>
                  <th style={{
                    padding: '1.25rem 1.5rem',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player, index) => {
                  const statusInfo = getStatusInfo(player.demandeStatuId);
                  
                  return (
                    <tr
                      key={player.id}
                      style={{
                        background: index % 2 === 0 ? '#fafbfc' : 'white',
                        borderBottom: '1px solid #f1f5f9'
                      }}
                    >
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem'
                        }}>
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
                            {(player.name?.[0] || '') + (player.lastName?.[0] || '')}
                          </div>
                          <div>
                            <div style={{
                              fontWeight: '600',
                              color: '#111827',
                              fontSize: '0.95rem'
                            }}>
                              {player.name} {player.lastName}
                            </div>
                            <div style={{
                              fontSize: '0.8rem',
                              color: '#6b7280'
                            }}>
                              Joueur #{player.id}
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
                      
                      <td style={{
                        padding: '1.25rem 1.5rem',
                        fontSize: '0.9rem',
                        color: '#374151'
                      }}>
                        {player.birthDate || '-'}
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
                      
                      <td style={{
                        padding: '1.25rem 1.5rem',
                        fontSize: '0.9rem',
                        color: '#374151',
                        fontFamily: 'monospace'
                      }}>
                        {player.licenceNum || 'En attente'}
                      </td>
                      
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.375rem 0.875rem',
                          borderRadius: '50px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          background: statusInfo.bg,
                          color: statusInfo.color
                        }}>
                          <div style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: statusInfo.color
                          }}></div>
                          {statusInfo.label}
                        </span>
                      </td>
                      
                      <td style={{
                        padding: '1.25rem 1.5rem',
                        textAlign: 'center'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}>
                          <button style={{
                            padding: '0.5rem',
                            border: 'none',
                            borderRadius: '8px',
                            background: '#f3f4f6',
                            color: '#374151',
                            cursor: 'pointer'
                          }}>
                            <Eye size={14} />
                          </button>
                          <button style={{
                            padding: '0.5rem',
                            border: 'none',
                            borderRadius: '8px',
                            background: '#dbeafe',
                            color: '#2563eb',
                            cursor: 'pointer'
                          }}>
                            <Edit size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredPlayers.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: '#6b7280'
            }}>
              <User size={64} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                Aucun joueur trouvé
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                Essayez de modifier vos critères de recherche
              </p>
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default ModernPlayerInterface;