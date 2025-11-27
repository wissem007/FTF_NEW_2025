import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import StatsCards from './StatsCards';
import CategoryChart from './CategoryChart';
import StatusChart from './StatusChart';
import './Dashboard.css';

const STATUS = {
  INITIAL: 1,
  EN_ATTENTE: 8,
  VALIDEE: 2,
  IMPRIMEE: 9,
  REJETEE: 10,
};

const CATEGORIES = {
  1: 'Poussins',
  2: 'Benjamins',
  3: 'Minimes',
  4: 'Cadets',
  5: 'Juniors',
  6: 'Espoirs',
  7: 'Seniors',
};

function Dashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchStats = useCallback(async (signal) => {
    if (!user?.teamId || !user?.seasonId) {
      setError('Informations utilisateur manquantes');
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get('/api/v1/demandes-players', {
        params: {
          teamId: user.teamId,
          seasonId: user.seasonId,
          size: 10000,
        },
        signal,
      });

      const demandes = response.data?.content || [];

      // Calculs en une seule passe
      const statusCounts = { Initial: 0, 'En attente': 0, 'Validée': 0, 'Imprimée': 0, 'Rejetée': 0 };
      const demandesByCategory = {};
      let demandesThisMonth = 0;
      let demandesThisWeek = 0;

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      for (const d of demandes) {
        switch (d.demandeStatuId) {
          case STATUS.INITIAL:
            statusCounts.Initial++;
            break;
          case STATUS.EN_ATTENTE:
            statusCounts['En attente']++;
            break;
          case STATUS.VALIDEE:
            statusCounts['Validée']++;
            break;
          case STATUS.IMPRIMEE:
            statusCounts['Imprimée']++;
            break;
          case STATUS.REJETEE:
            statusCounts['Rejetée']++;
            break;
          default:
            break;
        }

        const catName = CATEGORIES[Number(d.playerCategoryId)] || 'Autre';
        demandesByCategory[catName] = (demandesByCategory[catName] || 0) + 1;

        if (d.dateEnregistrement) {
          const date = new Date(d.dateEnregistrement);
          if (!isNaN(date)) {
            if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
              demandesThisMonth++;
            }
            if (date >= oneWeekAgo) {
              demandesThisWeek++;
            }
          }
        }
      }

      const totalDemandes = demandes.length;
      const demandesEnAttente = statusCounts['En attente'];
      const demandesValidees = statusCounts['Validée'];
      const demandesImprimees = statusCounts['Imprimée'];
      const demandesRejetees = statusCounts['Rejetée'];

      const tauxValidation = totalDemandes ? (demandesValidees / totalDemandes) * 100 : 0;
      const tauxRejet = totalDemandes ? (demandesRejetees / totalDemandes) * 100 : 0;

      setStats({
        totalDemandes,
        demandesEnAttente,
        demandesValidees,
        demandesRejetees,
        demandesImprimees,
        demandesByStatus: statusCounts,
        demandesByCategory,
        tauxValidation,
        tauxRejet,
        demandesThisMonth,
        demandesThisWeek,
      });

      setError(null);
    } catch (err) {
      if (axios.isCancel?.(err) || err?.code === 'ERR_CANCELED') {
        return; // Requête annulée: ne rien faire
      }
      setError('Erreur lors du chargement des statistiques');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const controller = new AbortController();
    fetchStats(controller.signal);
    return () => controller.abort();
  }, [fetchStats, refreshKey]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="skeleton-loader">
          <div className="skeleton-header"></div>
          <div className="skeleton-stats"></div>
          <div className="skeleton-charts"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-icon">❌</div>
        <p className="error-message">{error}</p>
        <button onClick={() => setRefreshKey(k => k + 1)} className="retry-btn" disabled={loading}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard" aria-busy={loading}>
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Statistiques - {user?.clubName || 'Club Africain'}</h1>
          <p className="header-subtitle">Saison {user?.seasonId || '2025'} - Équipe {user?.teamId || '102'}</p>
        </div>
        <button onClick={() => setRefreshKey(k => k + 1)} className="refresh-btn" aria-label="Actualiser les statistiques" disabled={loading}>
          {loading ? 'Chargement...' : 'Actualiser'}
        </button>
      </header>

      <div className="stats-grid">
        {stats && <StatsCards stats={stats} />}
      </div>

      {stats && stats.totalDemandes > 0 ? (
        <div className="charts-grid">
          <div className="chart-card">
            <h2>Répartition par Statut</h2>
            <StatusChart data={stats.demandesByStatus} />
          </div>
          <div className="chart-card">
            <h2>Répartition par Catégorie</h2>
            <CategoryChart data={stats.demandesByCategory} />
          </div>
        </div>
      ) : (
        <div className="no-data">
          <div className="no-data-icon">📋</div>
          <h3>Aucune demande trouvée</h3>
          <p>Ce club n'a pas encore de demandes pour cette saison.</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
