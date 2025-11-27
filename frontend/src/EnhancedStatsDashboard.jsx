import React, { useState, useEffect, useMemo } from 'react';
import { Users, FileText, CheckCircle, Clock, BarChart3, RefreshCw, Download, Search, ArrowUpDown, Eye, Edit, Award, Send, AlertTriangle } from 'lucide-react';
import { handlePrintImproved } from './utils/pdfGenerator';

const EnhancedStatsDashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [playersData, setPlayersData] = useState([]);
  const [trainersData, setTrainersData] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [dirigeantsData, setDirrigeantsData] = useState([]);
  const [validatedPlayers, setValidatedPlayers] = useState([]);
  const [selectedForBordereau, setSelectedForBordereau] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterStatus, setFilterStatus] = useState('all');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadAllData();
  }, [user]);

  const loadAllData = async () => {
    if (!user?.teamId || !user?.seasonId) {
      setError('Informations du club manquantes');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Charger les statistiques du club
      const statsResponse = await fetch(`http://localhost:8082/api/v1/stats/team/${user.teamId}/season/${user.seasonId}`);
      if (!statsResponse.ok) throw new Error('Erreur de chargement des stats');
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Charger les données par type d'intervenant
      await loadDataByType();

      // Charger les demandes validées pour le bordereau (statut 8)
      const bordereauResponse = await fetch(`http://localhost:8082/api/v1/demandes-players?teamId=${user.teamId}&seasonId=${user.seasonId}&demandeStatuId=8&size=1000`);
      if (!bordereauResponse.ok) throw new Error('Erreur de chargement des demandes validées');
      const bordereauData = await bordereauResponse.json();
      
      const validatedClubPlayers = (bordereauData.content || []).filter(player => 
        player.teamId === user.teamId || 
        (player.team && player.team.teamId === user.teamId)
      );
      
      setValidatedPlayers(validatedClubPlayers);
      setSelectedForBordereau([]);

    } catch (err) {
      setError('Impossible de charger les données');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDataByType = async () => {
    try {
      // Charger les joueurs (intervenantTypeId = 1)
      const playersResponse = await fetch(`http://localhost:8082/api/v1/demandes-players?teamId=${user.teamId}&seasonId=${user.seasonId}&ctIntervenantTypeId=1&size=1000`);
      if (playersResponse.ok) {
        const playersData = await playersResponse.json();
        const clubPlayers = (playersData.content || []).filter(player => 
          player.teamId === user.teamId || 
          (player.team && player.team.teamId === user.teamId)
        );
        setPlayersData(clubPlayers);
      }

      // Charger les entraîneurs (intervenantTypeId = 3)
      const trainersResponse = await fetch(`http://localhost:8082/api/v1/demandes-players?teamId=${user.teamId}&seasonId=${user.seasonId}&ctIntervenantTypeId=3&size=1000`);
      if (trainersResponse.ok) {
        const trainersData = await trainersResponse.json();
        const clubTrainers = (trainersData.content || []).filter(player => 
          player.teamId === user.teamId || 
          (player.team && player.team.teamId === user.teamId)
        );
        setTrainersData(clubTrainers);
      }

      // Charger le staff médical (intervenantTypeId = 4)
      const staffResponse = await fetch(`http://localhost:8082/api/v1/demandes-players?teamId=${user.teamId}&seasonId=${user.seasonId}&ctIntervenantTypeId=4&size=1000`);
      if (staffResponse.ok) {
        const staffData = await staffResponse.json();
        const clubStaff = (staffData.content || []).filter(player => 
          player.teamId === user.teamId || 
          (player.team && player.team.teamId === user.teamId)
        );
        setStaffData(clubStaff);
      }

      // Charger les dirigeants (intervenantTypeId = 2)
      const dirigeantsResponse = await fetch(`http://localhost:8082/api/v1/demandes-players?teamId=${user.teamId}&seasonId=${user.seasonId}&ctIntervenantTypeId=2&size=1000`);
      if (dirigeantsResponse.ok) {
        const dirigeantsData = await dirigeantsResponse.json();
        const clubDirigeants = (dirigeantsData.content || []).filter(player => 
          player.teamId === user.teamId || 
          (player.team && player.team.teamId === user.teamId)
        );
        setDirrigeantsData(clubDirigeants);
      }

    } catch (error) {
      console.log('Certaines API ne sont pas disponibles:', error);
    }
  };

  // Fonctions utilitaires
  const getPercentage = (value, total) => {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const getStatusLabel = (statusId) => {
    const statusMap = {
      1: 'Initial',
      2: 'A imprimer',
      3: 'Vers Commission',
      4: 'En anomalie',
      5: 'Rejetée',
      6: 'En attente',
      7: 'Imprimée',
      8: 'Validée par club',
      9: 'Validée Commission',
      10: 'A imprimer (Ligue)',
      11: 'A vérifier'
    };
    return statusMap[statusId] || `Statut ${statusId}`;
  };

  const getStatusColor = (statusId) => {
    const colorMap = {
      1: '#6b7280',
      2: '#3b82f6',
      3: '#8b5cf6',
      4: '#f59e0b',
      5: '#ef4444',
      6: '#f59e0b',
      7: '#10b981',
      8: '#059669',
      9: '#16a34a',
      10: '#0891b2',
      11: '#eab308'
    };
    return colorMap[statusId] || '#6b7280';
  };

  const getCurrentTabData = () => {
    switch(activeTab) {
      case 'joueurs': return playersData;
      case 'entraineurs': return trainersData;
      case 'staff': return staffData;
      case 'dirigeants': return dirigeantsData;
      case 'detailed': return playersData; // Pour compatibilité avec l'ancien système
      default: return [];
    }
  };

  // Filtrage et tri des données
  const filteredData = useMemo(() => {
    let data = getCurrentTabData();
    
    const matchesSearch = (player) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        (player.lastName && player.lastName.toLowerCase().includes(searchLower)) ||
        (player.firstName && player.firstName.toLowerCase().includes(searchLower)) ||
        (player.name && player.name.toLowerCase().includes(searchLower)) ||
        (player.licenceNum && player.licenceNum.toLowerCase().includes(searchLower))
      );
    };

    const matchesStatus = (player) => {
      return filterStatus === 'all' || player.demandeStatuId?.toString() === filterStatus;
    };

    data = data.filter(player => matchesSearch(player) && matchesStatus(player));

    // Tri
    if (sortConfig.key) {
      data.sort((a, b) => {
        let aValue = a[sortConfig.key] || '';
        let bValue = b[sortConfig.key] || '';
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [activeTab, searchTerm, filterStatus, sortConfig, playersData, trainersData, staffData, dirigeantsData]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Statistiques calculées pour l'onglet actuel
  const currentTabStats = useMemo(() => {
    const data = getCurrentTabData();
    const total = data.length;
    const valides = data.filter(item => item.demandeStatuId === 8).length;
    const enCours = data.filter(item => [1, 2, 3, 7, 10, 11].includes(item.demandeStatuId)).length;
    const anomalies = data.filter(item => item.demandeStatuId === 4).length;
    const rejetes = data.filter(item => item.demandeStatuId === 5).length;
    const enAttente = data.filter(item => item.demandeStatuId === 6).length;

    return { total, valides, enCours, anomalies, rejetes, enAttente };
  }, [activeTab, playersData, trainersData, staffData, dirigeantsData]);

  // Gestion des sélections pour le bordereau
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedForBordereau(validatedPlayers.map(p => p.id || p.demandeId));
    } else {
      setSelectedForBordereau([]);
    }
  };

  const handleSelectPlayer = (playerId, checked) => {
    if (checked) {
      setSelectedForBordereau(prev => [...prev, playerId]);
    } else {
      setSelectedForBordereau(prev => prev.filter(id => id !== playerId));
    }
  };

  // Fonction d'export pour CSV/JSON
  const handleExport = async (format) => {
    setExporting(true);
    try {
      const exportData = {
        club: user.clubName,
        saison: user.seasonId,
        onglet: activeTab,
        statistiques: currentTabStats,
        demandes: filteredData,
        dateExport: new Date().toISOString()
      };

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport_${activeTab}_${user.clubName}_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        const csvHeaders = ['Nom', 'Prénom', 'Numéro Licence', 'Statut', 'Date Création'];
        const csvRows = filteredData.map(player => [
          player.lastName || '',
          player.firstName || player.name || '',
          player.licenceNum || '',
          getStatusLabel(player.demandeStatuId),
          player.createdDate || ''
        ]);
        
        const csvContent = [csvHeaders, ...csvRows]
          .map(row => row.map(field => `"${field}"`).join(','))
          .join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeTab}_${user.clubName}_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export');
    } finally {
      setExporting(false);
    }
  };

  // Export du bordereau avec génération HTML comme votre système
// Remplacez votre fonction handleExportBordereau existante par celle-ci :

const handleExportBordereau = async () => {
  if (selectedForBordereau.length === 0) {
    alert('Veuillez sélectionner au moins une demande pour le bordereau');
    return;
  }

  setExporting(true);
  try {
    const selectedPlayers = validatedPlayers.filter(p => 
      selectedForBordereau.includes(p.id || p.demandeId)
    );

    // Préparer les données utilisateur pour le PDF amélioré
    const userData = {
      clubName: user?.clubName || 'Mon Club',
      teamId: user?.teamId || '601',
      seasonId: user?.seasonId || '2025'
    };

    // Adapter les données des joueurs au format attendu par le PDF amélioré
    const formattedPlayers = selectedPlayers.map(player => ({
      type_intervenant: player.ctIntervenantTypeId === 1 ? 'Joueur' :
                       player.ctIntervenantTypeId === 2 ? 'Dirigeant' :
                       player.ctIntervenantTypeId === 3 ? 'Entraîneur' :
                       player.ctIntervenantTypeId === 4 ? 'Staff Médical' : 'Joueur',
      nom_prenom: `${player.lastName || ''} ${player.firstName || player.name || ''}`.trim() || 'N/A',
      cin_passport: player.cinNumber || player.passportNumber || 'N/A',
      date_naissance: player.birthDate ? new Date(player.birthDate).toLocaleDateString('fr-FR') : 'N/A',
      lieu_naissance: player.birthPlace || 'N/A',
      nationalite: player.nationality || 'TUNISIE',
      date_envoi: new Date().toLocaleDateString('fr-FR')
    }));

    // Utiliser le nouveau générateur PDF amélioré
    handlePrintImproved(userData, formattedPlayers);
    
    alert(`Bordereau d'envoi amélioré généré avec ${selectedPlayers.length} demandes`);

  } catch (error) {
    console.error('Erreur lors de la génération du bordereau:', error);
    alert('Erreur lors de la génération du bordereau. Veuillez réessayer.');
  } finally {
    setExporting(false);
  }
};

  // Fonction pour générer le HTML du bordereau comme votre PDF
  const generateBordereauHTML = (selectedPlayers) => {
    const currentDate = new Date().toLocaleDateString('fr-FR');
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Bordereau d'envoi - ${user?.clubName}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            color: #000;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            border: 2px solid #000;
            padding: 15px;
        }
        .ftf-info {
            flex: 1;
        }
        .ftf-info h2 {
            margin: 0 0 10px 0;
            font-size: 18px;
            font-weight: bold;
        }
        .ftf-info p {
            margin: 2px 0;
            font-size: 12px;
        }
        .club-info {
            display: flex;
            align-items: center;
            gap: 15px;
            flex: 1;
            justify-content: center;
        }
        .club-logo {
            width: 60px;
            height: 60px;
            border: 1px solid #000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }
        .club-details h3 {
            margin: 0;
            font-size: 16px;
        }
        .club-details p {
            margin: 2px 0;
            font-size: 12px;
        }
        .title-section {
            text-align: center;
            margin: 20px 0;
        }
        .title-section h1 {
            font-size: 18px;
            font-weight: bold;
            margin: 0;
        }
        .title-section p {
            font-size: 14px;
            margin: 5px 0;
        }
        .section-header {
            background-color: #d0d0d0;
            padding: 8px;
            font-weight: bold;
            text-align: center;
            border: 1px solid #000;
            margin-top: 10px;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 10px;
        }
        th, td { 
            border: 1px solid #000; 
            padding: 6px; 
            text-align: left;
            font-size: 11px;
        }
        th { 
            background-color: #f0f0f0; 
            font-weight: bold;
            text-align: center;
        }
        .logo-placeholder {
            width: 80px;
            height: 80px;
            border: 1px solid #000;
            margin: 0 auto;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="ftf-info">
            <h2>Fédération Tunisienne de Football</h2>
            <p>Tél. : +216 71 793 760</p>
            <p>Fax : +216 71 282 566</p>
            <p>E-Mail : Directeur@ftf.org.tn</p>
        </div>
        
        <div class="club-info">
            <div class="club-logo">CA</div>
            <div class="club-details">
                <h3>${user?.clubName || 'Club'}</h3>
                <p>Tél. : 71332019</p>
                <p>Fax : 71347575</p>
            </div>
        </div>
        
        <div class="title-section">
            <h1>Bordereau d'envoi pour la saison :</h1>
            <p><strong>${user?.seasonId || '2025/2026'}</strong></p>
        </div>
    </div>

    <div class="section-header">Joueur</div>
    
    <table>
        <thead>
            <tr>
                <th>Nom & Prénom</th>
                <th>CIN/Passeport</th>
                <th>Date</th>
                <th>Lieu Naiss.</th>
                <th>Nationalité</th>
                <th>Date d'envoi</th>
            </tr>
        </thead>
        <tbody>
            ${selectedPlayers.map(player => `
                <tr>
                    <td>${(player.lastName || '') + ' ' + (player.firstName || player.name || '')}</td>
                    <td>${player.cinNumber || player.passportNumber || ''}</td>
                    <td>${player.birthDate ? new Date(player.birthDate).toLocaleDateString('fr-FR') : ''}</td>
                    <td>${player.birthPlace || ''}</td>
                    <td>${player.nationality || 'TUNISIE'}</td>
                    <td>${currentDate}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <p style="margin-top: 20px; text-align: center; font-size: 12px;">
        <strong>Total: ${selectedPlayers.length} demande(s)</strong>
    </p>
</body>
</html>`;
  };

  const TabButton = ({ id, label, icon: Icon, isActive, onClick, count }) => (
    <button
      onClick={() => onClick(id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1rem',
        border: 'none',
        borderRadius: '8px',
        background: isActive ? '#dc2626' : 'transparent',
        color: isActive ? 'white' : '#6b7280',
        fontWeight: isActive ? '600' : '500',
        cursor: 'pointer',
        transition: 'all 0.2s',
        flex: 1
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.target.style.background = '#f3f4f6';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.target.style.background = 'transparent';
        }
      }}
    >
      <Icon size={18} />
      {label}
      {count !== undefined && (
        <span style={{
          background: isActive ? 'rgba(255,255,255,0.2)' : '#e5e7eb',
          color: isActive ? 'white' : '#6b7280',
          padding: '0.125rem 0.5rem',
          borderRadius: '10px',
          fontSize: '0.75rem',
          fontWeight: '600'
        }}>
          {count}
        </span>
      )}
    </button>
  );

  if (loading) {
    return (
      <div style={{
        padding: '2rem',
        background: '#f9fafb',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={48} style={{ color: '#3b82f6', marginBottom: '1rem' }} />
          <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', background: '#f9fafb', minHeight: '100vh' }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          textAlign: 'center',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
          <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Erreur</h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>{error}</p>
          <button
            onClick={loadAllData}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: '0 auto'
            }}
          >
            <RefreshCw size={16} />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', background: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          background: '#3b82f6',
          padding: '0.5rem 1rem',
          borderRadius: '6px',
          display: 'inline-block',
          marginBottom: '1rem'
        }}>
          <h1 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: 'white',
            margin: 0
          }}>
            Statistiques Avancées - {user?.clubName || 'Mon Club'}
          </h1>
        </div>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Saison {user?.seasonId || '2025'} • Équipe {user?.teamId || ''} • {stats?.totalDemandes || 0} demandes au total
        </p>
      </div>

      {/* Navigation par onglets améliorée */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        background: 'white',
        padding: '0.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        flexWrap: 'wrap'
      }}>
        <TabButton
          id="overview"
          label="Vue d'ensemble"
          icon={BarChart3}
          isActive={activeTab === 'overview'}
          onClick={setActiveTab}
        />
        <TabButton
          id="joueurs"
          label="Joueurs"
          icon={Users}
          isActive={activeTab === 'joueurs'}
          onClick={setActiveTab}
          count={playersData.length}
        />
        <TabButton
          id="entraineurs"
          label="Entraîneurs"
          icon={Award}
          isActive={activeTab === 'entraineurs'}
          onClick={setActiveTab}
          count={trainersData.length}
        />
        <TabButton
          id="staff"
          label="Staff Médical"
          icon={FileText}
          isActive={activeTab === 'staff'}
          onClick={setActiveTab}
          count={staffData.length}
        />
        <TabButton
          id="dirigeants"
          label="Dirigeants"
          icon={BarChart3}
          isActive={activeTab === 'dirigeants'}
          onClick={setActiveTab}
          count={dirigeantsData.length}
        />
        <TabButton
          id="bordereau"
          label="Bordereau"
          icon={Download}
          isActive={activeTab === 'bordereau'}
          onClick={setActiveTab}
        />
      </div>

      {/* Vue d'ensemble */}
      {activeTab === 'overview' && stats && (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ background: '#3b82f615', padding: '0.75rem', borderRadius: '8px' }}>
                  <FileText size={24} color="#3b82f6" />
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>Total Demandes</p>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                {stats.totalDemandes || 0}
              </p>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ background: '#10b98115', padding: '0.75rem', borderRadius: '8px' }}>
                  <CheckCircle size={24} color="#10b981" />
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>Validées</p>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                {stats.validees || 0}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#10b981', margin: '0.25rem 0 0 0' }}>
                {getPercentage(stats.validees, stats.totalDemandes)}% du total
              </p>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ background: '#f59e0b15', padding: '0.75rem', borderRadius: '8px' }}>
                  <Clock size={24} color="#f59e0b" />
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>En Attente</p>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                {stats.enAttente || 0}
              </p>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ background: '#8b5cf615', padding: '0.75rem', borderRadius: '8px' }}>
                  <BarChart3 size={24} color="#8b5cf6" />
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>Imprimées</p>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                {stats.imprimees || 0}
              </p>
            </div>
          </div>

          {/* Répartition par type */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
              <Users size={24} color="#3b82f6" style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>{playersData.length}</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Joueurs</div>
            </div>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
              <Award size={24} color="#10b981" style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>{trainersData.length}</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Entraîneurs</div>
            </div>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
              <FileText size={24} color="#f59e0b" style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>{staffData.length}</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Staff Médical</div>
            </div>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
              <BarChart3 size={24} color="#8b5cf6" style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>{dirigeantsData.length}</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Dirigeants</div>
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
              Taux de Validation Global
            </h3>
            <div style={{ fontSize: '3rem', fontWeight: '800', color: '#10b981', marginBottom: '0.5rem' }}>
              {getPercentage(stats.validees, stats.totalDemandes)}%
            </div>
            <p style={{ color: '#6b7280' }}>
              {stats.validees || 0} demandes validées sur {stats.totalDemandes || 0}
            </p>
          </div>
        </>
      )}

      {/* Vue tableau détaillé pour les onglets spécifiques */}
      {(activeTab === 'joueurs' || activeTab === 'entraineurs' || activeTab === 'staff' || activeTab === 'dirigeants') && (
        <>
          {/* Statistiques pour l'onglet actuel */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6' }}>{currentTabStats.total}</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total</div>
            </div>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>{currentTabStats.valides}</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Validées</div>
            </div>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b' }}>{currentTabStats.enCours}</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>En Cours</div>
            </div>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>{currentTabStats.anomalies}</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Anomalies</div>
            </div>
          </div>

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
                  <option value="6">En attente</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Export
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => handleExport('csv')}
                    disabled={exporting}
                    style={{
                      padding: '0.75rem 1rem',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: exporting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      opacity: exporting ? 0.6 : 1
                    }}
                  >
                    <Download size={16} />
                    CSV
                  </button>
                  <button 
                    onClick={() => handleExport('json')}
                    disabled={exporting}
                    style={{
                      padding: '0.75rem 1rem',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: exporting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      opacity: exporting ? 0.6 : 1
                    }}
                  >
                    <Download size={16} />
                    JSON
                  </button>
                </div>
              </div>
            </div>
          </div>

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
                    {[
                      { key: 'lastName', label: 'Nom' },
                      { key: 'firstName', label: 'Prénom' },
                      { key: 'licenceNum', label: 'N° Licence' },
                      { key: 'demandeStatuId', label: 'Statut' },
                      { key: 'createdDate', label: 'Date Création' }
                    ].map(column => (
                      <th
                        key={column.key}
                        onClick={() => handleSort(column.key)}
                        style={{
                          padding: '1rem',
                          textAlign: 'left',
                          fontWeight: '600',
                          color: '#374151',
                          cursor: 'pointer',
                          borderBottom: '1px solid #e5e7eb'
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
                  {filteredData.length > 0 ? filteredData.map((player, index) => (
                    <tr key={player.id || index} style={{
                      borderBottom: '1px solid #f3f4f6'
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <td style={{ padding: '1rem', color: '#374151', fontWeight: '500' }}>
                        {player.lastName || 'N/A'}
                      </td>
                      <td style={{ padding: '1rem', color: '#374151' }}>
                        {player.firstName || player.name || 'N/A'}
                      </td>
                      <td style={{ padding: '1rem', color: '#374151', fontWeight: '500' }}>
                        {player.licenceNum || 'En attente'}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          background: `${getStatusColor(player.demandeStatuId)}15`,
                          color: getStatusColor(player.demandeStatuId),
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          {getStatusLabel(player.demandeStatuId)}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                        {player.createdDate ? new Date(player.createdDate).toLocaleDateString('fr-FR') : 'N/A'}
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
                  )) : (
                    <tr>
                      <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                        Aucune donnée trouvée pour cette catégorie
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Vue bordereau d'envoi */}
      {activeTab === 'bordereau' && (
        <>
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 0.5rem 0', color: '#1f2937' }}>
                  Bordereau d'Envoi - {user?.clubName}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                  Sélectionnez les demandes validées à inclure dans le bordereau
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: '#374151' }}>
                  {selectedForBordereau.length} sélectionnée(s) sur {validatedPlayers.length}
                </div>
                <button
                  onClick={handleExportBordereau}
                  disabled={selectedForBordereau.length === 0 || exporting}
                  style={{
                    padding: '0.75rem 1rem',
                    background: selectedForBordereau.length === 0 ? '#9ca3af' : '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: selectedForBordereau.length === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  <Download size={16} />
                  {exporting ? 'Génération...' : 'Générer Bordereau'}
                </button>
              </div>
            </div>
          </div>

          {validatedPlayers.length === 0 ? (
            <div style={{
              background: 'white',
              padding: '3rem',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <CheckCircle size={48} style={{ color: '#6b7280', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                Aucune demande validée
              </h3>
              <p style={{ color: '#6b7280' }}>
                Il n'y a actuellement aucune demande validée par le club pour générer un bordereau d'envoi.
              </p>
            </div>
          ) : (
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
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#374151',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        <input
                          type="checkbox"
                          checked={selectedForBordereau.length === validatedPlayers.length && validatedPlayers.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          style={{ marginRight: '0.5rem' }}
                        />
                        Sélection
                      </th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#374151',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        Type Intervenant
                      </th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#374151',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        Nom & Prénom
                      </th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#374151',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        CIN/Passeport
                      </th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#374151',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        N° de Licence
                      </th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#374151',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        Date de Naissance
                      </th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#374151',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        Lieu de Naissance
                      </th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#374151',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        Nationalité
                      </th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#374151',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        Date d'Envoi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {validatedPlayers.map((player, index) => {
                      const playerId = player.id || player.demandeId || index;
                      const isSelected = selectedForBordereau.includes(playerId);
                      
                      return (
                        <tr key={playerId} style={{
                          borderBottom: '1px solid #f3f4f6',
                          background: isSelected ? '#fee2e2' : 'white'
                        }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.background = '#f9fafb';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = isSelected ? '#fee2e2' : 'white';
                          }}
                        >
                          <td style={{ padding: '1rem' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleSelectPlayer(playerId, e.target.checked)}
                            />
                          </td>
                          <td style={{ padding: '1rem', color: '#374151', fontWeight: '500' }}>
                            {player.ctIntervenantTypeId === 1 ? 'Joueur' :
                             player.ctIntervenantTypeId === 2 ? 'Dirigeant' :
                             player.ctIntervenantTypeId === 3 ? 'Entraîneur' :
                             player.ctIntervenantTypeId === 4 ? 'Staff Médical' : 'Joueur'}
                          </td>
                          <td style={{ padding: '1rem', color: '#374151', fontWeight: '500' }}>
                            {`${player.lastName || ''} ${player.firstName || player.name || ''}`.trim() || 'N/A'}
                          </td>
                          <td style={{ padding: '1rem', color: '#6b7280' }}>
                            {player.cinNumber || player.passportNumber || 'N/A'}
                          </td>
                          <td style={{ padding: '1rem', color: '#374151', fontWeight: '500' }}>
                            {player.licenceNum || 'En attente'}
                          </td>
                          <td style={{ padding: '1rem', color: '#6b7280' }}>
                            {player.birthDate ? new Date(player.birthDate).toLocaleDateString('fr-FR') : 'N/A'}
                          </td>
                          <td style={{ padding: '1rem', color: '#6b7280' }}>
                            {player.birthPlace || 'N/A'}
                          </td>
                          <td style={{ padding: '1rem', color: '#6b7280' }}>
                            {player.nationality || 'TUNISIE'}
                          </td>
                          <td style={{ padding: '1rem', color: '#6b7280' }}>
                            {new Date().toLocaleDateString('fr-FR')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Actions globales */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        marginTop: '1rem'
      }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={loadAllData}
            style={{
              padding: '0.75rem 1rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#2563eb'}
            onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
          >
            <RefreshCw size={16} />
            Actualiser toutes les données
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedStatsDashboard;