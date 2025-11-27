import React, { useState, useEffect } from 'react';
import { Users, FileText, BarChart3, CheckCircle, Upload, User, Award, Activity, TrendingUp, Plus, Settings, Bell, Search, Menu, X, BookOpen, ChevronRight, Home, Camera } from 'lucide-react';

const ModernSidebar = ({ currentPage, onPageChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: BarChart3,
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      description: 'Vue d\'ensemble et statistiques',
      category: 'main'
    },
    {
      id: 'catalogue',
      label: 'Catalogue',
      icon: BookOpen,
      color: '#16a34a',
      gradient: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
      description: 'Catalogue des ressources',
      category: 'main'
    },
    // Séparateur
    {
      id: 'separator-1',
      type: 'separator',
      label: 'Gestion des Licences'
    },
    {
      id: 'joueur',
      label: 'Joueurs',
      icon: Users,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
      intervenantTypeId: 1,
      description: 'Gestion des licences joueurs',
      count: 156,
      category: 'licenses'
    },
    {
      id: 'entraineur',
      label: 'Entraîneurs',
      icon: Award,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      intervenantTypeId: 3,
      description: 'Staff technique et encadrement',
      count: 12,
      category: 'licenses'
    },
    {
      id: 'staff-medical',
      label: 'Staff Médical',
      icon: Activity,
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      intervenantTypeId: 4,
      description: 'Personnel médical et paramédical',
      count: 8,
      category: 'licenses'
    },
    {
      id: 'dirigeant',
      label: 'Dirigeants',
      icon: User,
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      intervenantTypeId: 2,
      description: 'Direction et administration',
      count: 15,
      category: 'licenses'
    },
    // Séparateur
    {
      id: 'separator-2',
      type: 'separator',
      label: 'Administration'
    },
    {
      id: 'validation',
      label: 'Validation',
      icon: CheckCircle,
      color: '#059669',
      gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      description: 'Validation des demandes',
      badge: '12',
      category: 'admin',
      urgent: true
    },
    {
      id: 'statistiques',
      label: 'Statistiques',
      icon: TrendingUp,
      color: '#6366f1',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      description: 'Analyses et rapports détaillés',
      category: 'admin'
    },
    {
      id: 'import-pdf',
      label: 'Import PDF',
      icon: Upload,
      color: '#6366f1',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      description: 'Import de documents',
      category: 'admin'
    },
    {
      id: 'facial-recognition',
      label: 'Reconnaissance Faciale',
      icon: Camera,
      color: '#ec4899',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      description: 'Recherche par photo',
      category: 'admin',
      badge: 'NEW'
    }
  ];

  const quickActions = [
    { 
      icon: Plus, 
      label: 'Nouvelle demande', 
      color: '#10b981',
      action: () => onPageChange('new-player')
    },
    { 
      icon: Search, 
      label: 'Rechercher', 
      color: '#3b82f6',
      action: () => console.log('Recherche')
    },
    { 
      icon: Bell, 
      label: 'Notifications', 
      color: '#f59e0b', 
      badge: '3',
      action: () => console.log('Notifications')
    }
  ];

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px #ec489950; }
          50% { box-shadow: 0 0 20px #ec489980; }
        }
        .sidebar-animation {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        .ping-animation {
          animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .glow-animation {
          animation: glow 2s infinite;
        }
      `}</style>
      
      <aside style={{
        width: isCollapsed ? '80px' : '320px',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        borderRight: '1px solid #e2e8f0',
        height: 'calc(100vh - 140px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        boxShadow: isCollapsed ? '2px 0 10px rgba(0, 0, 0, 0.05)' : '4px 0 20px rgba(0, 0, 0, 0.08)',
        zIndex: 100
      }}>
        {/* Header du sidebar */}
        <div style={{
          padding: isCollapsed ? '1.5rem 1rem' : '2rem',
          borderBottom: '1px solid #f1f5f9',
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background pattern */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            opacity: 0.3
          }}></div>

          {!isCollapsed && (
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.75rem'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)'
                }}>
                  <Home size={18} color="white" />
                </div>
                <h2 style={{
                  margin: 0,
                  color: 'white',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  letterSpacing: '-0.025em'
                }}>
                  Gestion Club
                </h2>
              </div>
              <p style={{
                margin: 0,
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.85rem',
                fontWeight: '500'
              }}>
                Club Africain • Saison 2025/26
              </p>
            </div>
          )}

          {/* Toggle button */}
          <button
            onClick={handleToggle}
            style={{
              position: 'absolute',
              top: '50%',
              right: isCollapsed ? '50%' : '1rem',
              transform: isCollapsed ? 'translate(50%, -50%)' : 'translateY(-50%)',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '12px',
              padding: '0.75rem',
              cursor: 'pointer',
              color: 'white',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              backdropFilter: 'blur(10px)',
              zIndex: 3
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
              e.target.style.transform = isCollapsed ? 'translate(50%, -50%) scale(1.1)' : 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = isCollapsed ? 'translate(50%, -50%) scale(1)' : 'translateY(-50%) scale(1)';
            }}
          >
            {isCollapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>

        {/* Actions rapides */}
        {!isCollapsed && (
          <div style={{
            padding: '1.5rem 2rem 1rem 2rem',
            borderBottom: '1px solid #f1f5f9'
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              color: '#64748b',
              fontSize: '0.75rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>
              Actions Rapides
            </h3>
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={action.action}
                    style={{
                      flex: 1,
                      padding: '1rem 0.75rem',
                      border: 'none',
                      borderRadius: '16px',
                      background: `${action.color}08`,
                      color: action.color,
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transform: 'translateY(0)',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = `${action.color}15`;
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = `0 8px 25px ${action.color}25`;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = `${action.color}08`;
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                    }}
                  >
                    <Icon size={18} />
                    <span style={{ fontSize: '0.7rem' }}>{action.label.split(' ')[0]}</span>
                    {action.badge && (
                      <div style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        color: 'white',
                        borderRadius: '12px',
                        padding: '2px 6px',
                        fontSize: '0.6rem',
                        fontWeight: '700',
                        minWidth: '18px',
                        textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                      }}>
                        {action.badge}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Menu principal */}
        <div style={{ padding: isCollapsed ? '1rem 0.5rem' : '1.5rem 2rem' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem'
          }}>
            {menuItems.map((item, index) => {
              // Séparateur
              if (item.type === 'separator') {
                if (isCollapsed) return null;
                return (
                  <div key={item.id} style={{ margin: '1.5rem 0 1rem 0' }}>
                    <div style={{
                      height: '1px',
                      background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)',
                      margin: '0 0 1rem 0'
                    }}></div>
                    <h3 style={{
                      margin: 0,
                      color: '#64748b',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                        borderRadius: '50%'
                      }}></div>
                      {item.label}
                    </h3>
                  </div>
                );
              }

              const isActive = currentPage === item.id;
              const Icon = item.icon;
              const isHovered = hoveredItem === item.id;
              const isNewFeature = item.badge === 'NEW';

              return (
                <div key={item.id} style={{ position: 'relative' }}>
                  <button
                    onClick={() => onPageChange(item.id, item.intervenantTypeId)}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={isNewFeature ? 'glow-animation' : ''}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: isCollapsed ? '0' : '1rem',
                      padding: isCollapsed ? '1rem 0.5rem' : '1.25rem 1.5rem',
                      border: 'none',
                      borderRadius: '16px',
                      background: isActive ? item.gradient : (isHovered ? `${item.color}08` : 'transparent'),
                      color: isActive ? 'white' : (isHovered ? item.color : '#64748b'),
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      fontWeight: isActive ? '700' : '600',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      textAlign: 'left',
                      width: '100%',
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                      boxShadow: isActive ? `0 8px 25px ${item.color}30` : 'none',
                      transform: isHovered && !isActive ? 'translateX(4px)' : 'translateX(0)'
                    }}
                  >
                    {/* Indicateur actif */}
                    {isActive && (
                      <div className="pulse-animation" style={{
                        position: 'absolute',
                        left: '-2rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '4px',
                        height: '32px',
                        background: `linear-gradient(180deg, ${item.color}, ${item.color}cc)`,
                        borderRadius: '0 4px 4px 0',
                        boxShadow: `0 0 20px ${item.color}50`
                      }}></div>
                    )}

                    {/* Icône */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '24px',
                      height: '24px',
                      position: 'relative',
                      transform: isHovered && !isActive ? 'scale(1.1)' : 'scale(1)',
                      transition: 'transform 0.2s'
                    }}>
                      <Icon size={20} />
                      {item.urgent && (
                        <div className="ping-animation" style={{
                          position: 'absolute',
                          top: '-2px',
                          right: '-2px',
                          width: '6px',
                          height: '6px',
                          background: '#ef4444',
                          borderRadius: '50%'
                        }}></div>
                      )}
                    </div>

                    {!isCollapsed && (
                      <>
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            fontWeight: 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            {item.label}
                            {item.urgent && (
                              <div className="pulse-animation" style={{
                                width: '4px',
                                height: '4px',
                                background: isActive ? 'rgba(255, 255, 255, 0.8)' : '#ef4444',
                                borderRadius: '50%'
                              }}></div>
                            )}
                          </div>
                          {item.description && !isActive && (
                            <div style={{
                              fontSize: '0.75rem',
                              opacity: 0.7,
                              marginTop: '0.125rem',
                              color: 'inherit'
                            }}>
                              {item.description}
                            </div>
                          )}
                        </div>

                        {/* Badge/Count */}
                        {(item.count || item.badge) && (
                          <div style={{
                            background: item.badge === 'NEW' ? 'linear-gradient(135deg, #ec4899, #be185d)' : 
                                        (isActive ? 'rgba(255, 255, 255, 0.2)' : `${item.color}15`),
                            color: item.badge === 'NEW' ? 'white' : (isActive ? 'white' : item.color),
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            minWidth: '24px',
                            textAlign: 'center',
                            border: isActive ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
                            transition: 'all 0.2s',
                            boxShadow: item.badge === 'NEW' ? '0 2px 8px rgba(236, 72, 153, 0.3)' : 'none'
                          }}>
                            {item.count || item.badge}
                          </div>
                        )}

                        {/* Flèche */}
                        {isHovered && !isActive && (
                          <ChevronRight 
                            size={16} 
                            style={{
                              opacity: 0.6,
                              transition: 'all 0.2s'
                            }}
                          />
                        )}
                      </>
                    )}

                    {/* Tooltip pour mode réduit */}
                    {isCollapsed && isHovered && (
                      <div style={{
                        position: 'absolute',
                        left: '100%',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        marginLeft: '1rem',
                        background: 'linear-gradient(135deg, #1f2937, #111827)',
                        color: 'white',
                        padding: '1rem 1.25rem',
                        borderRadius: '16px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                        zIndex: 1000,
                        pointerEvents: 'none',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)'
                      }}>
                        <div style={{ 
                          fontWeight: '700', 
                          marginBottom: '0.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          {item.label}
                          {item.badge === 'NEW' && (
                            <span style={{
                              background: 'linear-gradient(135deg, #ec4899, #be185d)',
                              padding: '2px 6px',
                              borderRadius: '8px',
                              fontSize: '0.6rem'
                            }}>
                              NEW
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                            {item.description}
                          </div>
                        )}
                        <div style={{
                          position: 'absolute',
                          left: '-6px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 0,
                          height: 0,
                          borderTop: '6px solid transparent',
                          borderBottom: '6px solid transparent',
                          borderRight: '6px solid #1f2937'
                        }}></div>
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pied du sidebar */}
        {!isCollapsed && (
          <div style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            padding: '1.5rem 2rem',
            borderTop: '1px solid #f1f5f9',
            background: 'linear-gradient(180deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.95) 100%)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1.25rem',
              background: 'white',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Indicateur de statut */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div className="pulse-animation" style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: '0 0 15px #10b98150'
                }}></div>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  Système actif
                </div>
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <div style={{
                    width: '4px',
                    height: '4px',
                    background: '#64748b',
                    borderRadius: '50%'
                  }}></div>
                  Saison 2025/2026
                </div>
              </div>

              {/* Background pattern */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '60px',
                height: '100%',
                background: 'linear-gradient(135deg, #10b98108, transparent)',
                pointerEvents: 'none'
              }}></div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default ModernSidebar;