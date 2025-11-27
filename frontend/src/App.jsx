// App.js - Version avec gestion de session automatique
import React, { useState, useEffect, useCallback } from 'react';
import { User, LogOut, FileText, BarChart3, TrendingUp, Calendar, Award, Clock } from 'lucide-react';
import JoueurPage from './pages/JoueurPage';
import ValidationInterface from './components/ValidationInterface';
import ModernDashboard from './components/ModernDashboard';
import PlayerRequestForm from './components/PlayerRequestForm';
import SimpleStatsDashboard from './EnhancedStatsDashboard';
import Login from './components/Login';
import CataloguePage from './pages/CataloguePage';
import FacialRecognitionPage from './pages/FacialRecognitionPage';
import SidebarComponent from './ModernSidebar';
import Dashboard from './components/dashboard/Dashboard';

const STATUS = {
  INITIAL: 1,
  EN_ATTENTE: 8,
  VALIDEE: 2,
  IMPRIMEE: 9,
  REJETEE: 10,
};


// Logo FTF moderne
const FTFLogo = ({ size = 40 }) => (
  <div style={{
    width: size,
    height: size,
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
  }}>
    <img
      src="/ftf-logo.png"
      alt="Logo FTF"
      style={{
        width: size * 0.7,
        height: size * 0.7,
        objectFit: 'contain'
      }}
      onError={(e) => {
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'block';
      }}
    />
    <div
      style={{
        display: 'none',
        fontSize: size * 0.4,
        fontWeight: 'bold',
        color: 'white'
      }}
    >
      ⚽
    </div>
  </div>
);

// Configuration API
const API_BASE_URL = '/api/v1';

const apiClient = {
  get: async (url, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = `${API_BASE_URL}${url}${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(fullUrl);
    return await response.json();
  },

  post: async (url, data) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await response.json();
  }
};

const demandesAPI = {
  getAllDemandes: (params = {}) => {
    return apiClient.get('/demandes-players', params);
  },
  healthCheck: () => {
    return apiClient.get('/demandes-players/health');
  }
};

// Composant Modal d'avertissement de session
const SessionWarningModal = ({ show, timeLeft, onExtend, onLogout }) => {
  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '400px',
        margin: '1rem',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '1rem'
        }}>
          ⚠️
        </div>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: '#111827'
        }}>
          Session sur le point d'expirer
        </h3>
        <p style={{
          color: '#6b7280',
          marginBottom: '1rem'
        }}>
          Votre session va expirer dans <strong style={{ color: '#dc2626' }}>{timeLeft}</strong> seconde{timeLeft > 1 ? 's' : ''}.
        </p>
        <p style={{
          fontSize: '0.875rem',
          color: '#9ca3af',
          marginBottom: '2rem'
        }}>
          Cliquez sur "Rester connecté" pour prolonger votre session.
        </p>
        <div style={{
          display: 'flex',
          gap: '1rem'
        }}>
          <button
            onClick={onExtend}
            style={{
              flex: 1,
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            Rester connecté
          </button>
          <button
            onClick={onLogout}
            style={{
              flex: 1,
              backgroundColor: '#e5e7eb',
              color: '#374151',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#d1d5db'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#e5e7eb'}
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
};

// Header moderne
const Header = ({ user, onLogout }) => (
  <header style={{
    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    padding: '1.5rem 2rem',
    color: 'white',
    boxShadow: '0 8px 25px rgba(220, 38, 38, 0.15)'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <FTFLogo size={60} />
        <div>
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: '700',
            margin: 0,
            letterSpacing: '-0.025em'
          }}>
            Fédération Tunisienne de Football
          </h1>
          <p style={{
            margin: '0.25rem 0 0 0',
            fontSize: '1rem',
            opacity: 0.9,
            fontWeight: '400'
          }}>
            Gestion des Licences
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>

        {/* ✅ NOUVEAU BOUTON STATISTIQUES FTF */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('changePage', { detail: 'dashboard-stats' }))}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            padding: '0.75rem 1.25rem',
            borderRadius: '10px',
            cursor: 'pointer',
            color: 'white',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
          onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
        >
          <BarChart3 size={20} />
          📊 Stats FTF
        </button>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          background: 'rgba(255, 255, 255, 0.15)',
          padding: '0.75rem 1.25rem',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          <User size={22} />
          <div>
            <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{user?.clubName || 'Club'}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Connecté</div>
          </div>
          <button
            onClick={onLogout}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              padding: '0.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'white',
              transition: 'all 0.2s'
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  </header>
);

const ModernStatsCard = ({ title, value, change, icon: Icon, color, trend }) => (
  <div style={{
    background: 'white',
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #f1f5f9',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s'
  }}
    onMouseEnter={(e) => {
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
    }}
    onMouseLeave={(e) => {
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
    }}
  >
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: `linear-gradient(90deg, ${color}, ${color}cc)`
    }}></div>

    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <div style={{
        background: `${color}15`,
        padding: '1rem',
        borderRadius: '12px'
      }}>
        <Icon size={28} color={color} />
      </div>

      {change && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          color: trend === 'up' ? '#10b981' : '#ef4444',
          fontSize: '0.85rem',
          fontWeight: '600'
        }}>
          <TrendingUp size={16} style={{ transform: trend === 'down' ? 'rotate(180deg)' : 'none' }} />
          {change}
        </div>
      )}
    </div>

    <div>
      <p style={{
        fontSize: '0.9rem',
        color: '#6b7280',
        margin: '0 0 0.5rem 0',
        fontWeight: '500'
      }}>
        {title}
      </p>
      <p style={{
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#111827',
        margin: 0,
        lineHeight: 1
      }}>
        {value}
      </p>
    </div>
  </div>
);

// Dashboard par défaut
const DefaultDashboard = ({ user }) => {
  const [dashboardData, setDashboardData] = useState({
    players: [],
    totalDemandes: 0,
    validees: 0,
    enCours: 0,
    refusees: 0,
    enAttente: 0,
    loading: true
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.teamId || !user?.seasonId) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/demandes-players?seasonId=${user.seasonId}&teamId=${user.teamId}&size=1000`
        );
        const data = await response.json();
        const players = data.content || [];

        const totalDemandes = players.length;
        let validees = 0, enAttente = 0, refusees = 0, enCours = 0;

        for (const p of players) {
          const id = p.demandeStatuId;
          if (id === STATUS.VALIDEE || id === STATUS.IMPRIMEE) {
            validees++;
          } else if (id === STATUS.EN_ATTENTE) {
            enAttente++;
          } else if (id === STATUS.REJETEE) {
            refusees++;
          } else {
            enCours++;
          }
        }

        setDashboardData({
          players,
          totalDemandes,
          validees,
          enCours,
          refusees,
          enAttente,
          loading: false
        });
      } catch (error) {
        console.error('Erreur chargement dashboard:', error);
        setDashboardData(prev => ({ ...prev, loading: false }));
      }
    };

    loadDashboardData();
  }, [user?.teamId, user?.seasonId]);

  if (dashboardData.loading) {
    return (
      <div style={{
        padding: '2rem',
        background: '#fafbfc',
        minHeight: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Chargement du tableau de bord...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', background: '#fafbfc', minHeight: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '800',
          marginBottom: '0.5rem',
          color: '#111827',
          background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Tableau de Bord
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1.1rem', fontWeight: '500' }}>
          {user?.clubName || 'Association Sp. Ariana'} • Saison 2025/2026
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <ModernStatsCard
          title="Total des Demandes"
          value={dashboardData.totalDemandes.toString()}
          icon={FileText}
          color="#3b82f6"
        />
        <ModernStatsCard
          title="Validées par Club"
          value={dashboardData.validees.toString()}
          icon={Award}
          color="#059669"
        />
        <ModernStatsCard
          title="En Cours de Traitement"
          value={dashboardData.enCours.toString()}
          icon={Clock}
          color="#8b5cf6"
        />
        <ModernStatsCard
          title="Rejetées"
          value={dashboardData.refusees.toString()}
          icon={Calendar}
          color="#ef4444"
        />
      </div>

      {dashboardData.totalDemandes === 0 && (
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '16px',
          textAlign: 'center',
          marginTop: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ fontSize: '1.2rem', color: '#6b7280', marginBottom: '1rem' }}>
            Aucune donnée disponible pour ce club
          </div>
          <p style={{ color: '#9ca3af', margin: 0 }}>
            Équipe {user?.teamId} - Saison {user?.seasonId}
          </p>
        </div>
      )}
    </div>
  );
};

// App principal avec gestion de session
const App = () => {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [intervenantTypeId, setIntervenantTypeId] = useState(null);

  // États pour la gestion de session
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Configuration des timeouts
  const INACTIVITY_TIME = 5 * 60 * 1000; // 5 minutes
  const WARNING_TIME = 4 * 60 * 1000;    // Avertir à 4 minutes

  // Fonction de déconnexion
  const handleLogout = useCallback(() => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userToken');
    sessionStorage.clear();
    setUser(null);
    setShowWarning(false);
    setCurrentPage('dashboard');
    setIntervenantTypeId(null);
    console.log('Session expirée - Utilisateur déconnecté');
  }, []);

  // Restaurer l'utilisateur depuis localStorage au démarrage
  useEffect(() => {
    const savedUserInfo = localStorage.getItem('userInfo');
    if (savedUserInfo) {
      try {
        const userData = JSON.parse(savedUserInfo);
        setUser(userData);
      } catch (error) {
        console.error('Erreur lors de la restauration utilisateur:', error);
        localStorage.removeItem('userInfo');
      }
    }
  }, []);

  // Gestion de session avec timeout
  useEffect(() => {
    if (!user) return;

    let inactivityTimer;
    let warningTimer;
    let countdownInterval;

    const resetTimers = () => {
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);
      clearInterval(countdownInterval);
      setShowWarning(false);

      // Timer d'avertissement (4 minutes)
      warningTimer = setTimeout(() => {
        setShowWarning(true);
        setTimeLeft(60); // 1 minute restante

        // Compte à rebours
        countdownInterval = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              handleLogout();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, WARNING_TIME);

      // Timer de déconnexion automatique (5 minutes)
      inactivityTimer = setTimeout(() => {
        handleLogout();
      }, INACTIVITY_TIME);
    };

    const events = [
      'mousedown', 'mousemove', 'keypress', 'scroll',
      'touchstart', 'click', 'keydown'
    ];

    const handleActivity = () => {
      if (user && !showWarning) {
        resetTimers();
      }
    };

    resetTimers();

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);
      clearInterval(countdownInterval);
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [user, showWarning, handleLogout]);

  // ✅ NOUVEAU : Écouter l'événement de changement de page depuis le header
  useEffect(() => {
    const handleExternalPageChange = (event) => {
      setCurrentPage(event.detail);
    };

    window.addEventListener('changePage', handleExternalPageChange);
    
    return () => {
      window.removeEventListener('changePage', handleExternalPageChange);
    };
  }, []);

  // Fonction pour prolonger la session
  const extendSession = () => {
    setShowWarning(false);
    setTimeLeft(0);
    console.log('Session prolongée par l\'utilisateur');
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handlePageChange = (pageId, typeId) => {
    console.log('Changement de page vers:', pageId, 'avec typeId:', typeId);
    setCurrentPage(pageId);
    setIntervenantTypeId(typeId);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'catalogue':
        return <CataloguePage user={user} />;
      case 'joueur':
        return <JoueurPage user={user} intervenantTypeId={intervenantTypeId || 1} />;
      case 'validation':
        return <ValidationInterface user={user} />;

case 'dashboard-stats':
  return <Dashboard user={user} />;
      case 'dirigeant':
        return <JoueurPage user={user} intervenantTypeId={intervenantTypeId || 2} />;
      case 'entraineur':
        return <JoueurPage user={user} intervenantTypeId={intervenantTypeId || 3} />;
      case 'staff-medical':
        return <JoueurPage user={user} intervenantTypeId={intervenantTypeId || 4} />;
      // case 'import-pdf':
      //   return <PDFImportAdvanced user={user} onImportComplete={() => setCurrentPage('joueur')} />;
      case 'facial-recognition':
        return <FacialRecognitionPage user={user} />;
      case 'new-player':
        return (
          <div style={{
            padding: '2rem',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            minHeight: '100vh'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden',
              maxWidth: '900px',
              margin: '0 auto'
            }}>
              <PlayerRequestForm
                onSuccess={() => {
                  setCurrentPage('joueur');
                  alert('Nouvelle demande créée avec succès !');
                }}
              />
            </div>
          </div>
        );
      case 'statistiques':
        return <SimpleStatsDashboard user={user} />;
      case 'dashboard':
      default:
        try {
          return <ModernDashboard user={user} onPageChange={handlePageChange} />;
        } catch (error) {
          return <DefaultDashboard user={user} />;
        }
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafbfc' }}>
      {/* Modal d'avertissement de session */}
      <SessionWarningModal
        show={showWarning}
        timeLeft={timeLeft}
        onExtend={extendSession}
        onLogout={handleLogout}
      />

      <Header user={user} onLogout={handleLogout} />

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 140px)' }}>
        <SidebarComponent currentPage={currentPage} onPageChange={handlePageChange} />
        <main style={{ flex: 1 }}>
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
};

export default App;