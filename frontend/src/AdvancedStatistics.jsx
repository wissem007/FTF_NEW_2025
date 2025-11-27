import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, Eye, Edit, Trash2, BarChart3, Users, Calendar, Award, TrendingUp, ArrowUpDown, ChevronDown, FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const AdvancedStatistics = ({ user }) => {
  const [activeTab, setActiveTab] = useState('joueurs');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Données simulées basées sur votre structure
  const playersData = [
    {
      id: 1,
      licenceNum: '08031001',
      nom: 'TAYACHI',
      prenom: 'FEDI',
      dateNaissance: '10/03/2008',
      nationalite: 'TUN',
      category: 'BENJAMINS',
      typeLicence: 'NOUVELLE',
      regime: 'AMATEUR',
      status: 8, // Validée par club
      dateCreation: '2024-09-01',
      demandeStatuId: 8
    },
    {
      id: 2,
      licenceNum: '07031021',
      nom: 'MRAD',
      prenom: 'YOUSSEF',
      dateNaissance: '10/03/2007',
      nationalite: 'TUN',
      category: 'MINIMES',
      typeLicence: 'RENOUVELLEMENT',
      regime: 'AMATEUR',
      status: 3,
      dateCreation: '2024-08-15',
      demandeStatuId: 3
    },
    {
      id: 3,
      licenceNum: '06051007',
      nom: 'LAABIDI',
      prenom: 'HAMZA',
      dateNaissance: '12/05/2006',
      nationalite: 'TUN',
      category: 'CADETS',
      typeLicence: 'MUTATION',
      regime: 'SEMI-PROFESSIONNEL',
      status: 8,
      dateCreation: '2024-08-20',
      demandeStatuId: 8
    },
    {
      id: 4,
      licenceNum: '05111006',
      nom: 'MAHMOUD',
      prenom: 'MED SADOK',
      dateNaissance: '10/11/2005',
      nationalite: 'TUN',
      category: 'JUNIORS',
      typeLicence: 'NOUVELLE',
      regime: 'PROFESSIONNEL',
      status: 4,
      dateCreation: '2024-07-10',
      demandeStatuId: 4
    },
    {
      id: 5,
      licenceNum: '04021015',
      nom: 'BENALI',
      prenom: 'AHMED',
      dateNaissance: '15/02/2004',
      nationalite: 'TUN',
      category: 'SENIORS',
      typeLicence: 'TRANSFERT',
      regime: 'PROFESSIONNEL',
      status: 8,
      dateCreation: '2024-09-05',
      demandeStatuId: 8
    }
  ];

  // Données pour les entraîneurs
  const trainersData = [
    {
      id: 1,
      licenceNum: 'ENT001',
      nom: 'GHARBI',
      prenom: 'MOHAMED',
      dateNaissance: '15/05/1980',
      nationalite: 'TUN',
      diplome: 'CAF A',
      specialite: 'Entraîneur Principal',
      status: 8,
      dateCreation: '2024-08-01'
    },
    {
      id: 2,
      licenceNum: 'ENT002',
      nom: 'SOLTANI',
      prenom: 'KARIM',
      dateNaissance: '22/08/1985',
      nationalite: 'TUN',
      diplome: 'CAF B',
      specialite: 'Entraîneur Adjoint',
      status: 3,
      dateCreation: '2024-08-10'
    }
  ];

  // Fonction pour obtenir le statut
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

  // Fonction de tri
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Données filtrées et triées
  const filteredData = useMemo(() => {
    let data = activeTab === 'joueurs' ? playersData : trainersData;
    
    // Filtrage par recherche
    if (searchTerm) {
      data = data.filter(item => 
        item.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.licenceNum.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrage par statut
    if (filterStatus !== 'all') {
      data = data.filter(item => item.status.toString() === filterStatus);
    }

    // Tri
    if (sortConfig.key) {
      data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return data;
  }, [activeTab, searchTerm, filterStatus, sortConfig]);

  // Statistiques calculées
  const stats = useMemo(() => {
    const data = activeTab === 'joueurs' ? playersData : trainersData;
    const total = data.length;
    const valides = data.filter(item => item.status === 8).length;
    const enCours = data.filter(item => [1, 2, 3, 7].includes(item.status)).length;
    const anomalies = data.filter(item => item.status === 4).length;
    const rejetes = data.filter(item => item.status === 5).length;

    return { total, valides, enCours, anomalies, rejetes };
  }, [activeTab]);

  // Composant StatCard
  const StatCard = ({ title, value, icon: Icon, color, percentage }) => (
    <div style={{
      background: 'white',
      padding: '1.5rem',
      borderRadius: '12px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      transition: 'all 0.2s'
    }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>
            {title}
          </p>
          <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
            {value}
          </p>
          {percentage && (
            <p style={{ fontSize: '0.75rem', color: color, margin: '0.25rem 0 0 0' }}>
              {percentage}% du total
            </p>
          )}
        </div>
        <div style={{
          background: `${color}20`,
          padding: '0.75rem',
          borderRadius: '8px'
        }}>
          <Icon size={24} color={color} />
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '2rem', background: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '800',
          color: '#1f2937',
          margin: '0 0 0.5rem 0'
        }}>
          Statistiques Détaillées
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1rem' }}>
          Analyse complète des licences - {user?.clubName || 'Club Africain'}
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        background: 'white',
        padding: '0.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        {[
          { id: 'joueurs', label: 'Joueurs', icon: Users },
          { id: 'entraineurs', label: 'Entraîneurs', icon: Award },
          { id: 'staff', label: 'Staff Médical', icon: FileText },
          { id: 'dirigeants', label: 'Dirigeants', icon: BarChart3 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                border: 'none',
                borderRadius: '8px',
                background: isActive ? '#dc2626' : 'transparent',
                color: isActive ? 'white' : '#6b7280',
                fontWeight: isActive ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Statistiques */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <StatCard
          title="Total"
          value={stats.total}
          icon={Users}
          color="#3b82f6"
        />
        <StatCard
          title="Validées"
          value={stats.valides}
          icon={CheckCircle}
          color="#10b981"
          percentage={Math.round((stats.valides / stats.total) * 100)}
        />
        <StatCard
          title="En Cours"
          value={stats.enCours}
          icon={Clock}
          color="#f59e0b"
          percentage={Math.round((stats.enCours / stats.total) * 100)}
        />
        <StatCard
          title="Anomalies"
          value={stats.anomalies}
          icon={AlertTriangle}
          color="#ef4444"
          percentage={Math.round((stats.anomalies / stats.total) * 100)}
        />
      </div>

      {/* Filtres et recherche */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          alignItems: 'end'
        }}>
          {/* Recherche */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
              Rechercher
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6b7280'
              }} />
              <input
                type="text"
                placeholder="Nom, prénom ou licence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>

          {/* Filtre par statut */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
              Statut
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
                background: 'white'
              }}
            >
              <option value="all">Tous les statuts</option>
              <option value="8">Validées</option>
              <option value="3">Vers Commission</option>
              <option value="4">En anomalie</option>
              <option value="5">Rejetées</option>
            </select>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button style={{
              padding: '0.75rem 1rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                {(activeTab === 'joueurs' ? [
                  { key: 'licenceNum', label: 'N° Licence' },
                  { key: 'nom', label: 'Nom' },
                  { key: 'prenom', label: 'Prénom' },
                  { key: 'dateNaissance', label: 'Date de naissance' },
                  { key: 'category', label: 'Catégorie' },
                  { key: 'typeLicence', label: 'Type' },
                  { key: 'regime', label: 'Régime' },
                  { key: 'status', label: 'Statut' }
                ] : [
                  { key: 'licenceNum', label: 'N° Licence' },
                  { key: 'nom', label: 'Nom' },
                  { key: 'prenom', label: 'Prénom' },
                  { key: 'diplome', label: 'Diplôme' },
                  { key: 'specialite', label: 'Spécialité' },
                  { key: 'status', label: 'Statut' }
                ]).map(column => (
                  <th
                    key={column.key}
                    onClick={() => handleSort(column.key)}
                    style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      cursor: 'pointer',
                      borderBottom: '1px solid #e5e7eb',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {column.label}
                      <ArrowUpDown size={14} style={{ color: '#9ca3af' }} />
                    </div>
                  </th>
                ))}
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  fontWeight: '600',
                  color: '#374151',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => {
                const statusInfo = getStatusInfo(item.status);
                return (
                  <tr key={item.id} style={{
                    borderBottom: '1px solid #f3f4f6',
                    ':hover': { background: '#f9fafb' }
                  }}
                    onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.background = 'white'}
                  >
                    <td style={{ padding: '1rem', fontWeight: '500', color: '#1f2937' }}>
                      {item.licenceNum}
                    </td>
                    <td style={{ padding: '1rem', color: '#374151' }}>
                      {item.nom}
                    </td>
                    <td style={{ padding: '1rem', color: '#374151' }}>
                      {item.prenom}
                    </td>
                    {activeTab === 'joueurs' ? (
                      <>
                        <td style={{ padding: '1rem', color: '#6b7280' }}>
                          {item.dateNaissance}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            background: '#dbeafe',
                            color: '#1e40af',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                          }}>
                            {item.category}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                          {item.typeLicence}
                        </td>
                        <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                          {item.regime}
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: '1rem', color: '#6b7280' }}>
                          {item.diplome}
                        </td>
                        <td style={{ padding: '1rem', color: '#6b7280' }}>
                          {item.specialite}
                        </td>
                      </>
                    )}
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        background: statusInfo.bg,
                        color: statusInfo.color,
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button style={{
                          padding: '0.5rem',
                          background: '#f3f4f6',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: '#6b7280'
                        }}>
                          <Eye size={16} />
                        </button>
                        <button style={{
                          padding: '0.5rem',
                          background: '#f3f4f6',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: '#6b7280'
                        }}>
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f9fafb'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Affichage de {filteredData.length} résultat(s)
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              background: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}>
              Précédent
            </button>
            <button style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              background: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}>
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedStatistics;