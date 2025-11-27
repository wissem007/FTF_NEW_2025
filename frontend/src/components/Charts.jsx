// src/components/Charts.jsx
import React from 'react';
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Area,
  AreaChart
} from 'recharts';

// Composant BarChart moderne
export const ModernBarChart = ({ data, title, height = 300, color = '#dc2626' }) => (
  <div style={{ 
    background: 'white', 
    padding: '2rem', 
    borderRadius: '16px', 
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #f1f5f9'
  }}>
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      marginBottom: '1.5rem',
      gap: '0.75rem'
    }}>
      <BarChart3 size={24} style={{ color: color }} />
      <h3 style={{ 
        fontSize: '1.3rem', 
        fontWeight: '600', 
        margin: 0, 
        color: '#1e293b'
      }}>
        {title}
      </h3>
    </div>
    
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ bottom: 80, left: 20, right: 20, top: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis 
          dataKey="label" 
          tick={{ fontSize: 11, fill: '#6b7280' }}
          angle={-45}
          textAnchor="end"
          height={80}
          interval={0}
        />
        <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
            fontSize: '0.9rem'
          }}
          cursor={{ fill: 'rgba(220, 38, 38, 0.1)' }}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  </div>
);

// Composant PieChart moderne
export const ModernPieChart = ({ data, title, color = '#10b981' }) => (
  <div style={{ 
    background: 'white', 
    padding: '2rem', 
    borderRadius: '16px', 
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #f1f5f9'
  }}>
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      marginBottom: '1.5rem',
      gap: '0.75rem'
    }}>
      <PieChartIcon size={24} style={{ color: color }} />
      <h3 style={{ 
        fontSize: '1.3rem', 
        fontWeight: '600', 
        margin: 0, 
        color: '#1e293b'
      }}>
        {title}
      </h3>
    </div>
    
    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
      <ResponsiveContainer width="55%" height={300}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={90}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
              fontSize: '0.9rem'
            }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>

      <div style={{ flex: 1 }}>
        {data.map((item, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            marginBottom: '1rem',
            padding: '0.75rem',
            borderRadius: '8px',
            background: '#f8fafc',
            border: '1px solid #f1f5f9'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: item.color,
              flexShrink: 0
            }}></div>
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontSize: '0.9rem', 
                fontWeight: '600',
                color: '#374151' 
              }}>
                {item.label}
              </div>
              <div style={{ 
                fontSize: '0.8rem', 
                color: '#6b7280' 
              }}>
                {Math.round(item.value / data.reduce((sum, d) => sum + d.value, 0) * 100)}%
              </div>
            </div>
            <div style={{ 
              fontSize: '1rem', 
              fontWeight: '700', 
              color: '#1f2937' 
            }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Composant LineChart pour évolutions
export const ModernLineChart = ({ data, title, color = '#f59e0b' }) => (
  <div style={{ 
    background: 'white', 
    padding: '2rem', 
    borderRadius: '16px', 
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #f1f5f9'
  }}>
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      marginBottom: '1.5rem',
      gap: '0.75rem'
    }}>
      <TrendingUp size={24} style={{ color: color }} />
      <h3 style={{ 
        fontSize: '1.3rem', 
        fontWeight: '600', 
        margin: 0, 
        color: '#1e293b'
      }}>
        {title}
      </h3>
    </div>
    
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis 
          dataKey="label" 
          tick={{ fontSize: 12, fill: '#6b7280' }}
        />
        <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
            fontSize: '0.9rem'
          }}
        />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          strokeWidth={3}
          dot={{ fill: color, strokeWidth: 2, r: 6 }}
          activeDot={{ r: 8, fill: color }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// Composant AreaChart pour les tendances
export const ModernAreaChart = ({ data, title, color = '#8b5cf6' }) => (
  <div style={{ 
    background: 'white', 
    padding: '2rem', 
    borderRadius: '16px', 
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #f1f5f9'
  }}>
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      marginBottom: '1.5rem',
      gap: '0.75rem'
    }}>
      <TrendingUp size={24} style={{ color: color }} />
      <h3 style={{ 
        fontSize: '1.3rem', 
        fontWeight: '600', 
        margin: 0, 
        color: '#1e293b'
      }}>
        {title}
      </h3>
    </div>
    
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis 
          dataKey="label" 
          tick={{ fontSize: 12, fill: '#6b7280' }}
        />
        <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
            fontSize: '0.9rem'
          }}
        />
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          fillOpacity={0.2}
          fill={color}
          strokeWidth={3}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

// Composant pour graphiques avec types de licence (spécialisé)
export const LicenseTypeChart = ({ data, title = "Demandes par Type de Licence" }) => {
  // Données spécifiques pour les types de licence
  const licenseTypeData = [
    { label: 'NOUVELLE', value: 45, color: '#007bff' },
    { label: 'RENOUVELLEMENT', value: 78, color: '#17a2b8' },
    { label: 'RETOUR PRET', value: 12, color: '#ffc107' },
    { label: 'MUTATION', value: 18, color: '#6c757d' },
    { label: 'PRET', value: 8, color: '#6f42c1' },
    { label: 'DEMISSION', value: 3, color: '#e83e8c' },
    { label: 'MUTATION EXCEPT.', value: 5, color: '#20c997' },
    { label: 'TRANSFERT', value: 15, color: '#fd7e14' },
    { label: 'RETOUR MUTATION', value: 4, color: '#6610f2' },
    { label: 'SURCLASSEMENT', value: 6, color: '#6f42c1' },
    { label: 'LIBRE (AMATEUR)', value: 7, color: '#d63384' },
    { label: 'TRANSFERT LIBRE', value: 2, color: '#0dcaf0' },
    { label: 'TRANSFERT ETRANGER', value: 1, color: '#198754' },
    { label: 'ANCIEN LICENCIÉ', value: 0, color: '#6c757d' }
  ].filter(item => item.value > 0); // Ne montrer que les types avec des valeurs

  return <ModernBarChart data={licenseTypeData} title={title} height={350} color="#dc2626" />;
};

// Composant pour graphiques avec régimes (spécialisé)
export const RegimeChart = ({ data, title = "Demandes par Régime" }) => {
  // Données spécifiques pour les régimes
  const regimeData = [
    { label: 'AMATEUR', value: 120, color: '#007bff' },
    { label: 'STAGIAIRE', value: 35, color: '#17a2b8' },
    { label: 'SEMI-PROFESSIONNEL', value: 30, color: '#ffc107' },
    { label: 'PROFESSIONNEL', value: 15, color: '#6c757d' },
    { label: 'CP', value: 4, color: '#6f42c1' }
  ].filter(item => item.value > 0);

  return <ModernPieChart data={regimeData} title={title} color="#10b981" />;
};

// Composant pour graphiques avec statuts de demandes (spécialisé)
export const StatusChart = ({ players = [], title = "Répartition par Statut" }) => {
  // Mapping des statuts avec couleurs
  const statusMapping = {
    1: { label: 'Initial', color: '#6b7280' },
    2: { label: 'A imprimer', color: '#3b82f6' },
    3: { label: 'Vers Commission', color: '#8b5cf6' },
    4: { label: 'En anomalie', color: '#f59e0b' },
    5: { label: 'Rejetée', color: '#ef4444' },
    6: { label: 'En attente', color: '#f59e0b' },
    7: { label: 'Imprimée', color: '#10b981' },
    8: { label: 'Validée par club', color: '#059669' },
    9: { label: 'Vers Direction Tech.', color: '#16a34a' },
    10: { label: 'A imprimer (Ligue)', color: '#0891b2' },
    11: { label: 'A vérifier', color: '#eab308' }
  };

  // Calculer les données dynamiquement à partir des joueurs
  const statusCounts = {};
  
  // Initialiser les compteurs
  Object.keys(statusMapping).forEach(statusId => {
    statusCounts[statusId] = 0;
  });

  // Compter les statuts
  players.forEach(player => {
    const statusId = player.demandeStatuId;
    if (statusCounts[statusId] !== undefined) {
      statusCounts[statusId]++;
    }
  });

  // Convertir en format pour le graphique (ne montrer que les statuts avec des valeurs > 0)
  const statusData = Object.entries(statusCounts)
    .filter(([statusId, count]) => count > 0)
    .map(([statusId, count]) => ({
      label: statusMapping[statusId].label,
      value: count,
      color: statusMapping[statusId].color
    }));

  // Si aucune donnée, afficher un message
  if (statusData.length === 0) {
    return (
      <div style={{ 
        background: 'white', 
        padding: '2rem', 
        borderRadius: '16px', 
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        border: '1px solid #f1f5f9',
        textAlign: 'center'
      }}>
        <h3 style={{ 
          fontSize: '1.3rem', 
          fontWeight: '600', 
          margin: '0 0 1rem 0', 
          color: '#1e293b'
        }}>
          {title}
        </h3>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Aucune donnée de statut disponible
        </p>
      </div>
    );
  }

  return <ModernPieChart data={statusData} title={title} color="#10b981" />;
};