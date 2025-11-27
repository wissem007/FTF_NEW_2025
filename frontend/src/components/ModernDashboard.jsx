import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, Award, Clock, Eye, Plus, Download, RefreshCw, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { ModernBarChart, ModernPieChart, ModernLineChart } from '../components/Charts';

const ModernDashboard = ({ user, onPageChange }) => {
    const [dashboardData, setDashboardData] = useState({
        totalDemandes: 0,
        validees: 0,
        enCours: 0,
        rejetees: 0,
        byLicenseType: [],
        byRegime: [],
        byStatus: [],
        byMonth: [],
        recentActivity: [],
        loading: true
    });

    const API_BASE_URL = 'http://localhost:8082/api/v1';

    useEffect(() => {
        loadDashboardData();
    }, [user?.teamId, user?.seasonId]);

    const loadDashboardData = async () => {
        if (!user?.teamId || !user?.seasonId) return;

        try {
            const response = await fetch(
                `${API_BASE_URL}/demandes-players?seasonId=${user.seasonId}&teamId=${user.teamId}&size=1000`
            );
            const data = await response.json();
            const players = data.content || [];

            // Calculer les statistiques
            const totalDemandes = players.length;
            const validees = players.filter(p => p.demandeStatuId === 8).length;
            const enCours = players.filter(p => [1, 2, 3, 7, 10, 11].includes(p.demandeStatuId)).length;
            const rejetees = players.filter(p => p.demandeStatuId === 5).length;

            // Données par type de licence
            const licenseTypeMap = {
                1: 'NOUVELLE', 2: 'RENOUVELLEMENT', 3: 'RETOUR PRET', 4: 'MUTATION',
                5: 'PRET', 6: 'DEMISSION', 7: 'MUTATION EXCEPT.', 8: 'TRANSFERT'
            };

            const licenseTypeCounts = {};
            players.forEach(player => {
                const typeId = player.typeLicenceId;
                const label = licenseTypeMap[typeId] || 'Autre';
                licenseTypeCounts[label] = (licenseTypeCounts[label] || 0) + 1;
            });

            const byLicenseType = Object.entries(licenseTypeCounts).map(([label, count], index) => ({
                label,
                value: count,
                color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'][index % 6]
            }));

            // Données par régime
            const regimeMap = { 1: 'AMATEUR', 2: 'STAGIAIRE', 3: 'SEMI-PRO', 4: 'PROFESSIONNEL' };
            const regimeCounts = {};
            players.forEach(player => {
                const label = regimeMap[player.regimeId] || 'Autre';
                regimeCounts[label] = (regimeCounts[label] || 0) + 1;
            });

            const byRegime = Object.entries(regimeCounts).map(([label, count], index) => ({
                label,
                value: count,
                color: ['#007bff', '#17a2b8', '#ffc107', '#6c757d'][index]
            }));

            setDashboardData({
                totalDemandes,
                validees,
                enCours,
                rejetees,
                byLicenseType,
                byRegime,
                loading: false
            });

        } catch (error) {
            console.error('Erreur chargement dashboard:', error);
            setDashboardData(prev => ({ ...prev, loading: false }));
        }
    };

    if (dashboardData.loading) {
        return (
            <div style={{
                padding: '2rem',
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
                        Chargement du tableau de bord...
                    </span>
                </div>
            </div>
        );
    }

    const calculatePercentage = (value, total) => {
        return total > 0 ? Math.round((value / total) * 100) : 0;
    };

    const StatCard = ({ title, value, subtitle, icon: Icon, color, gradient, trend, percentage }) => (
        <div style={{
            background: `linear-gradient(135deg, ${gradient})`,
            color: 'white',
            padding: '1rem 1.5rem', // Hauteur réduite: moins de padding vertical
            borderRadius: '20px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            transition: 'transform 0.3s ease',
            cursor: 'pointer',
            height: '130px' // Hauteur fixe réduite
        }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
            {/* Motif de fond décoratif */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-20%',
                width: '150%',
                height: '150%',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                transform: 'rotate(45deg)'
            }}></div>

            <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        padding: '0.75rem',
                        borderRadius: '16px',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <Icon size={22} />
                    </div>

                    {trend && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            background: 'rgba(255, 255, 255, 0.2)',
                            padding: '0.4rem 0.6rem',
                            borderRadius: '50px',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                        }}>
                            {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {Math.abs(trend)}%
                        </div>
                    )}
                </div>

                <div>
                    <div style={{
                        fontSize: '2.2rem', // Taille réduite
                        fontWeight: '800',
                        lineHeight: 1,
                        marginBottom: '0.25rem'
                    }}>
                        {value}
                    </div>
                    <div style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        marginBottom: '0.1rem',
                        opacity: 0.9
                    }}>
                        {title}
                    </div>
                    {subtitle && (
                        <div style={{
                            fontSize: '0.8rem',
                            opacity: 0.8
                        }}>
                            {subtitle}
                        </div>
                    )}
                    {percentage !== undefined && (
                        <div style={{
                            fontSize: '0.8rem',
                            opacity: 0.8,
                            marginTop: '0.25rem'
                        }}>
                            {percentage}% du total
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const QuickActionCard = ({ title, description, icon: Icon, color, onClick }) => (
        <div
            onClick={onClick}
            style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '16px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                border: '1px solid #f1f5f9',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
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
                background: `linear-gradient(90deg, ${color}, ${color}aa)`
            }}></div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem', // Réduit de 1rem à 0.75rem
                marginBottom: '0.5rem' // Réduit de 0.75rem à 0.5rem
            }}>
                <div style={{
                    background: `${color}15`,
                    padding: '0.6rem', // Réduit de 0.75rem à 0.6rem
                    borderRadius: '10px' // Réduit de 12px à 10px
                }}>
                    <Icon size={18} color={color} /> {/* Réduit de 20 à 18 */}
                </div>
                <div>
                    <h3 style={{
                        fontSize: '1rem', // Réduit de 1.1rem à 1rem
                        fontWeight: '700',
                        color: '#111827',
                        margin: '0 0 0.15rem 0' // Réduit de 0.2rem à 0.15rem
                    }}>
                        {title}
                    </h3>
                    <p style={{
                        color: '#6b7280',
                        fontSize: '0.8rem', // Réduit de 0.85rem à 0.8rem
                        margin: 0,
                        lineHeight: 1.2 // Ajout pour compacter les lignes
                    }}>
                        {description}
                    </p>
                </div>
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end'
            }}>
                <ArrowUpRight size={20} color={color} />
            </div>
        </div>
    );

    return (
        <div style={{
            padding: '2rem',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            minHeight: '100vh'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <div>
                    <h1 style={{
                        fontSize: '3rem',
                        fontWeight: '800',
                        margin: '0 0 0.5rem 0',
                        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.025em'
                    }}>
                        Tableau de Bord
                    </h1>
                    <p style={{
                        color: '#6b7280',
                        fontSize: '1.2rem',
                        margin: 0,
                        fontWeight: '500'
                    }}>
                        {user?.clubName || 'Club Africain'} • Saison 2025/2026
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={loadDashboardData}
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
                            fontWeight: '500',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                        }}
                    >
                        <RefreshCw size={16} />
                        Actualiser
                    </button>

                    <button
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
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.4)'
                        }}
                    >
                        <Download size={16} />
                        Rapport
                    </button>
                </div>
            </div>

            {/* Cartes statistiques principales */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '2rem',
                marginBottom: '3rem'
            }}>
                <StatCard
                    title="Total des Demandes"
                    value={dashboardData.totalDemandes}
                    subtitle="Toutes catégories"
                    icon={Users}
                    gradient="#3b82f6, #2563eb"
                    trend={5}
                />

                <StatCard
                    title="Validées par Club"
                    value={dashboardData.validees}
                    subtitle="Prêtes à être traitées"
                    icon={Award}
                    gradient="#10b981, #059669"
                    percentage={calculatePercentage(dashboardData.validees, dashboardData.totalDemandes)}
                />

                <StatCard
                    title="En Cours de Traitement"
                    value={dashboardData.enCours}
                    subtitle="En cours de validation"
                    icon={Clock}
                    gradient="#f59e0b, #d97706"
                    percentage={calculatePercentage(dashboardData.enCours, dashboardData.totalDemandes)}
                />

                <StatCard
                    title="Taux de Validation"
                    value={`${calculatePercentage(dashboardData.validees, dashboardData.totalDemandes)}%`}
                    subtitle="Performance du club"
                    icon={TrendingUp}
                    gradient="#8b5cf6, #7c3aed"
                    trend={12}
                />
            </div>

            {/* Actions rapides */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem'
            }}>
                <QuickActionCard
                    title="Gérer les Joueurs"
                    description="Voir et modifier les demandes de joueurs"
                    icon={Users}
                    color="#3b82f6"
                    onClick={() => onPageChange('joueur', 1)}
                />

                <QuickActionCard
                    title="Gérer les Entraîneurs"
                    description="Gérer les demandes d'entraîneurs"
                    icon={Award}
                    color="#10b981"
                    onClick={() => onPageChange('entraineur', 3)}
                />

                <QuickActionCard
                    title="Nouvelle Demande"
                    description="Créer une nouvelle demande de licence"
                    icon={Plus}
                    color="#f59e0b"
                    onClick={() => onPageChange('new-player')}
                />

                <QuickActionCard
                    title="Validation"
                    description="Valider les demandes en attente"
                    icon={Eye}
                    color="#8b5cf6"
                    onClick={() => onPageChange('validation')}
                />
            </div>

            {/* Graphiques */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
                gap: '2rem',
                marginBottom: '2rem'
            }}>
                {/* Graphique des types de licence */}
                {dashboardData.byLicenseType.length > 0 && (
                    <div style={{
                        background: 'white',
                        padding: '2rem',
                        borderRadius: '20px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                        border: '1px solid #f1f5f9'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '2rem'
                        }}>
                            <div>
                                <h3 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: '#111827',
                                    margin: '0 0 0.5rem 0'
                                }}>
                                    Demandes par Type de Licence
                                </h3>
                                <p style={{
                                    color: '#6b7280',
                                    fontSize: '0.95rem',
                                    margin: 0
                                }}>
                                    Répartition des types de demandes
                                </p>
                            </div>
                            <BarChart3 size={24} color="#dc2626" />
                        </div>
                        <ModernBarChart
                            data={dashboardData.byLicenseType}
                            height={300}
                            color="#dc2626"
                        />
                    </div>
                )}

                {/* Graphique des régimes */}
                {dashboardData.byRegime.length > 0 && (
                    <div style={{
                        background: 'white',
                        padding: '1.5rem', // Réduit de 2rem à 1.5rem
                        borderRadius: '20px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                        border: '1px solid #f1f5f9',
                        height: '350px' // Hauteur fixe réduite
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '1.5rem' // Réduit de 2rem à 1.5rem
                        }}>
                            <div>
                                <h3 style={{
                                    fontSize: '1.3rem', // Réduit de 1.5rem à 1.3rem
                                    fontWeight: '700',
                                    color: '#111827',
                                    margin: '0 0 0.25rem 0' // Réduit de 0.5rem à 0.25rem
                                }}>
                                    Demandes par Régime
                                </h3>
                                <p style={{
                                    color: '#6b7280',
                                    fontSize: '0.9rem', // Réduit de 0.95rem à 0.9rem
                                    margin: 0
                                }}>
                                    Répartition par type de régime
                                </p>
                            </div>
                            <Activity size={22} color="#10b981" /> {/* Réduit de 24 à 22 */}
                        </div>
                        <div style={{ height: '250px' }}> {/* Container avec hauteur fixe pour le graphique */}
                            <ModernPieChart
                                data={dashboardData.byRegime}
                                color="#10b981"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Résumé et alertes */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '2rem'
            }}>
                {/* Résumé performance */}
                <div style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '20px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #f1f5f9'
                }}>
                    <h3 style={{
                        fontSize: '1.3rem',
                        fontWeight: '700',
                        color: '#111827',
                        marginBottom: '1.5rem'
                    }}>
                        Performance du Club
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem',
                            background: '#f0fdf4',
                            borderRadius: '12px',
                            border: '1px solid #bbf7d0'
                        }}>
                            <div>
                                <div style={{ fontWeight: '600', color: '#166534' }}>
                                    Taux de validation
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#374151' }}>
                                    Performance excellente
                                </div>
                            </div>
                            <div style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: '#16a34a'
                            }}>
                                {calculatePercentage(dashboardData.validees, dashboardData.totalDemandes)}%
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem',
                            background: '#fef3c7',
                            borderRadius: '12px',
                            border: '1px solid #fcd34d'
                        }}>
                            <div>
                                <div style={{ fontWeight: '600', color: '#92400e' }}>
                                    En cours de traitement
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#374151' }}>
                                    Nécessite un suivi
                                </div>
                            </div>
                            <div style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: '#d97706'
                            }}>
                                {dashboardData.enCours}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Informations du club */}
                <div style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '20px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #f1f5f9'
                }}>
                    <h3 style={{
                        fontSize: '1.3rem',
                        fontWeight: '700',
                        color: '#111827',
                        marginBottom: '1.5rem'
                    }}>
                        Informations du Club
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem 0',
                            borderBottom: '1px solid #f1f5f9'
                        }}>
                            <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Équipe ID</span>
                            <span style={{ fontWeight: '600', color: '#111827' }}>{user?.teamId}</span>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem 0',
                            borderBottom: '1px solid #f1f5f9'
                        }}>
                            <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Saison</span>
                            <span style={{ fontWeight: '600', color: '#111827' }}>{user?.seasonId}</span>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem 0',
                            borderBottom: '1px solid #f1f5f9'
                        }}>
                            <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Dernière MAJ</span>
                            <span style={{ fontWeight: '600', color: '#111827' }}>
                                {new Date().toLocaleDateString('fr-FR')}
                            </span>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem 0'
                        }}>
                            <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Statut</span>
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '50px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                background: '#dcfce7',
                                color: '#166534'
                            }}>
                                Actif
                            </span>
                        </div>
                    </div>
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

export default ModernDashboard;