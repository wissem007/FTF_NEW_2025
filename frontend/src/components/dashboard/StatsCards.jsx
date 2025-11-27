import './StatsCards.css';

function StatsCards({ stats }) {
  const cards = [
    {
      title: 'Total Demandes',
      value: stats.totalDemandes,
      icon: '📋',
      color: '#3b82f6'
    },
    {
      title: 'En Attente',
      value: stats.demandesEnAttente,
      icon: '⏳',
      color: '#f59e0b'
    },
    {
      title: 'Validées',
      value: stats.demandesValidees,
      icon: '✅',
      color: '#10b981'
    },
    {
      title: 'Rejetées',
      value: stats.demandesRejetees,
      icon: '❌',
      color: '#ef4444'
    },
    {
      title: 'Imprimées',
      value: stats.demandesImprimees,
      icon: '🖨️',
      color: '#8b5cf6'
    },
    {
      title: 'Ce Mois',
      value: stats.demandesThisMonth,
      icon: '📅',
      color: '#06b6d4'
    },
    {
      title: 'Cette Semaine',
      value: stats.demandesThisWeek,
      icon: '🗓️',
      color: '#ec4899'
    },
    {
      title: 'Taux Validation',
      value: `${stats.tauxValidation.toFixed(2)}%`,
      icon: '📊',
      color: '#14b8a6'
    }
  ];

  return (
    <div className="stats-cards">
      {cards.map((card, index) => (
        <div 
          key={index} 
          className="stat-card"
          style={{ borderLeftColor: card.color }}
        >
          <div className="stat-icon" style={{ backgroundColor: card.color }}>
            {card.icon}
          </div>
          <div className="stat-content">
            <h3>{card.title}</h3>
            <p className="stat-value">
              {typeof card.value === 'number' 
                ? card.value.toLocaleString() 
                : card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsCards;