import React from 'react';
import { Users, FileText, Eye, Plus, Edit, Trash2, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart as RechartsPieChart, Cell, ResponsiveContainer, LineChart, Line } from 'recharts';
import { StatsCard } from '../../ui/StatsCard';

export const Dashboard = ({ user }) => {
  // Données pour les graphiques
  const licenseTypeData = [
    { name: 'NOUVELLE', value: 45, color: '#007bff' },
    { name: 'RENOUVELLEMENT', value: 78, color: '#17a2b8' },
    { name: 'RETOUR PRET', value: 12, color: '#ffc107' },
    { name: 'MUTATION', value: 18, color: '#6c757d' },
    { name: 'PRET', value: 8, color: '#6f42c1' },
    { name: 'DEMISSION', value: 3, color: '#e83e8c' },
    { name: 'MUTATION EXCEPT.', value: 5, color: '#20c997' },
    { name: 'TRANSFERT', value: 15, color: '#fd7e14' },
    { name: 'RETOUR MUTATION', value: 4, color: '#6610f2' },
    { name: 'SURCLASSEMENT', value: 6, color: '#6f42c1' },
    { name: 'LIBRE (AMATEUR)', value: 7, color: '#d63384' },
    { name: 'TRANSFERT LIBRE', value: 2, color: '#0dcaf0' },
    { name: 'TRANSFERT ETRANGER', value: 1, color: '#198754' },
    { name: 'ANCIEN LICENCIÉ', value: 0, color: '#6c757d' }
  ];

  const regimeData = [
    { name: 'AMATEUR', value: 120, color: '#007bff' },
    { name: 'STAGIAIRE', value: 35, color: '#17a2b8' },
    { name: 'SEMI-PROFESSIONNEL', value: 30, color: '#ffc107' },
    { name: 'PROFESSIONNEL', value: 15, color: '#6c757d' },
    { name: 'CP', value: 4, color: '#6f42c1' }
  ];

  const categoryData = [
    { name: 'ECOLES', value: 8, color: '#28a745' },
    { name: 'MINIMES', value: 15, color: '#fd7e14' },
    { name: 'CADETS', value: 12, color: '#17a2b8' },
    { name: 'JUNIORS', value: 18, color: '#dc3545' },
    { name: 'ELITE', value: 25, color: '#6f42c1' },
    { name: 'SENIORS', value: 95, color: '#343a40' },
    { name: 'AUTRES', value: 31, color: '#28a745' }
  ];

  const monthlyData = [
    { month: 'Jan', demandes: 15, validées: 12 },
    { month: 'Fév', demandes: 22, validées: 18 },
    { month: 'Mar', demandes: 35, validées: 28 },
    { month: 'Avr', demandes: 42, validées: 35 },
    { month: 'Mai', demandes: 38, validées: 32 },
    { month: 'Jun', demandes: 52, validées: 45 }
  ];

  return (
    <div style={{ padding: '2rem', background: '#fafbfc', minHeight: '100vh' }}>
      {/* En-tête */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2.25rem', 
          fontWeight: '700', 
          marginBottom: '0.5rem',
          color: '#1e293b'
        }}>
          Gestion des demandes
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem' }}>
          {user?.clubName || 'Association Sp. Ariana'} - Saison 2025/2026
        </p>
      </div>

      {/* Cards modules */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Card Joueur */}
        <div style={{ 
          background: 'white', 
          padding: '2rem', 
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #f1f5f9',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '5px',
            background: 'linear-gradient(90deg, #10b981, #059669)'
          }}></div>
          
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              background: '#10b98115',
              padding: '0.75rem',
              borderRadius: '12px',
              marginRight: '1rem'
            }}>
              <Users size={28} color="#10b981" />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '600', margin: 0, color: '#1e293b' }}>
              Joueur
            </h3>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '0.75rem', 
            fontSize: '0.9rem',
            marginBottom: '1.5rem'
          }}>
            {[
              { icon: Eye, label: 'Consulter', color: '#3b82f6' },
              { icon: Edit, label: 'Modifier', color: '#10b981' },
              { icon: Plus, label: 'Enregistrer', color: '#8b5cf6' },
              { icon: Trash2, label: 'Supprimer', color: '#ef4444' }
            ].map((action, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                padding: '0.5rem',
                borderRadius: '8px',
                background: '#f8fafc'
              }}>
                <action.icon size={16} color={action.color} />
                <span style={{ fontWeight: '500', color: '#475569' }}>{action.label}</span>
              </div>
            ))}
          </div>

          <div style={{ 
            paddingTop: '1rem', 
            borderTop: '1px solid #f1f5f9',
            fontSize: '0.85rem'
          }}>
            {[
              { label: 'Valider', color: '#10b981', symbol: '✓' },
              { label: 'Confirmer contrat', color: '#3b82f6', symbol: '📋' },
              { label: 'Ajouter des fichiers', color: '#8b5cf6', symbol: '📎' }
            ].map((item, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                marginBottom: '0.5rem' 
              }}>
                <span style={{ color: item.color, fontSize: '1rem' }}>{item.symbol}</span>
                <span style={{ color: '#64748b', fontWeight: '500' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Autres modules */}
        {[
          { title: 'Entraîneur', color: '#f59e0b' },
          { title: 'Staff Médical', color: '#8b5cf6' },
          { title: 'Dirigeant', color: '#ef4444' }
        ].map((module) => (
          <div key={module.title} style={{ 
            background: 'white', 
            padding: '2rem', 
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #f1f5f9',
            opacity: 0.7,
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '5px',
              background: `linear-gradient(90deg, ${module.color}, ${module.color}cc)`
            }}></div>
            
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{
                background: `${module.color}15`,
                padding: '0.75rem',
                borderRadius: '12px',
                marginRight: '1rem'
              }}>
                <Users size={28} color={module.color} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '600', margin: 0, color: '#64748b' }}>
                {module.title}
              </h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: 0 }}>
              Module disponible prochainement
            </p>
          </div>
        ))}
      </div>

      {/* Statistiques */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        <StatsCard 
          title="Demandes en cours" 
          value="12" 
          color="#3b82f6" 
          icon={FileText} 
          change="+5%"
          trend="up"
        />
        <StatsCard 
          title="Validées cette semaine" 
          value="8" 
          color="#10b981" 
          icon={Eye} 
          change="+12%"
          trend="up"
        />
        <StatsCard 
          title="En attente" 
          value="4" 
          color="#f59e0b" 
          icon={Plus} 
          change="-2%"
          trend="down"
        />
      </div>

      {/* Section des graphiques */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', 
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Graphique par Type de Licence */}
        <div style={{ 
          background: 'white', 
          padding: '2rem', 
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
            <BarChart3 size={24} color="#dc2626" style={{ marginRight: '0.75rem' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: '600', margin: 0, color: '#1e293b' }}>
              Demandes par Type de Licence
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={licenseTypeData} margin={{ bottom: 100 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {licenseTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique par Régime */}
        <div style={{ 
          background: 'white', 
          padding: '2rem', 
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
            <PieChart size={24} color="#10b981" style={{ marginRight: '0.75rem' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: '600', margin: 0, color: '#1e293b' }}>
              Demandes par Régime
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <RechartsPieChart>
              <Pie
                data={regimeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {regimeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Graphiques supplémentaires */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', 
        gap: '2rem'
      }}>
        {/* Graphique par Catégorie d'Âge */}
        <div style={{ 
          background: 'white', 
          padding: '2rem', 
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
            <BarChart3 size={24} color="#8b5cf6" style={{ marginRight: '0.75rem' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: '600', margin: 0, color: '#1e293b' }}>
              Demandes par Catégorie d'Âge
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Évolution mensuelle */}
        <div style={{ 
          background: 'white', 
          padding: '2rem', 
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
            <TrendingUp size={24} color="#f59e0b" style={{ marginRight: '0.75rem' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: '600', margin: 0, color: '#1e293b' }}>
              Évolution Mensuelle
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="demandes" 
                stroke="#dc2626" 
                strokeWidth={3}
                dot={{ fill: '#dc2626', strokeWidth: 2, r: 6 }}
                name="Demandes"
              />
              <Line 
                type="monotone" 
                dataKey="validées" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                name="Validées"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};