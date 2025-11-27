import React, { useState } from 'react';

// Logo FTF amélioré
const FTFLogo = ({ size = 80 }) => (
  <div style={{
    width: size,
    height: size,
    margin: '0 auto',
    position: 'relative',
    borderRadius: '50%',
    background: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 20px rgba(220, 38, 38, 0.3)',
    border: '2px solid #dc2626',
    padding: '5px'
  }}>
    <img
      src="/ftf-logo.png"
      alt="Logo FTF"
      style={{
        width: size * 0.8,
        height: size * 0.8,
        objectFit: 'contain'
      }}
    />
  </div>
);

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!credentials.username || !credentials.password) {
      setError('Veuillez saisir un nom d\'utilisateur et un mot de passe');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8082/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Stocker dans localStorage
        localStorage.setItem('userInfo', JSON.stringify({
          username: data.username,
          clubName: data.clubName,
          teamId: data.teamId,
          seasonId: data.seasonId
        }));

        console.log('Infos club stockées:', data.clubName, 'Team ID:', data.teamId);

        onLogin({
          username: data.username,
          clubName: data.clubName,
          teamId: data.teamId,
          seasonId: data.seasonId
        });
      } else {
        setError(data.message || 'Erreur de connexion');
      }

    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '1rem 1.2rem',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
    backgroundColor: '#fafafa',
  };

  const inputFocusStyle = {
    borderColor: '#dc2626',
    backgroundColor: '#ffffff',
    boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.1)'
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 30%, #fecaca 70%, #f87171 100%)',
      padding: '1rem',
      position: 'relative'
    }}>
      {/* Éléments décoratifs de fond */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '200px',
        height: '200px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '15%',
        width: '150px',
        height: '150px',
        background: 'rgba(220, 38, 38, 0.1)',
        borderRadius: '50%',
        filter: 'blur(30px)',
        zIndex: 0
      }} />

      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        padding: '3rem',
        borderRadius: '24px',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.5)',
        width: '480px',
        maxWidth: '95%',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* En-tête */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <FTFLogo size={90} />

          <h1 style={{
            background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: '1.8rem',
            fontWeight: '800',
            margin: '1.5rem 0 0.5rem 0',
            letterSpacing: '-0.02em'
          }}>
            Fédération Tunisienne de Football
          </h1>

          <div style={{
            width: '60px',
            height: '3px',
            background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
            margin: '1rem auto',
            borderRadius: '2px'
          }} />

          <p style={{
            color: '#64748b',
            fontSize: '1.1rem',
            margin: 0,
            fontWeight: '500'
          }}>
            Système de Gestion des Clubs
          </p>
        </div>

        {/* Section de connexion */}
        <div style={{
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)',
          padding: '2rem',
          borderRadius: '18px',
          marginBottom: '2rem',
          color: 'white',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '100%',
            height: '100%',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            transform: 'rotate(45deg)'
          }} />
          
          <h2 style={{ 
            margin: '0 0 0.5rem 0', 
            fontSize: '1.5rem',
            fontWeight: '700',
            position: 'relative',
            zIndex: 1
          }}>
            Connexion
          </h2>
          <p style={{ 
            margin: 0, 
            opacity: 0.95, 
            fontSize: '1rem',
            position: 'relative',
            zIndex: 1
          }}>
            Accédez à votre espace de gestion
          </p>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div style={{
            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
            color: '#dc2626',
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            fontSize: '0.95rem',
            textAlign: 'center',
            border: '1px solid #fecaca',
            fontWeight: '500'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Formulaire */}
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.7rem',
              fontWeight: '600',
              color: '#1f2937',
              fontSize: '1rem'
            }}>
              📧 Identifiant
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              placeholder="Nom d'utilisateur"
              disabled={loading}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.backgroundColor = '#fafafa';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.7rem',
              fontWeight: '600',
              color: '#1f2937',
              fontSize: '1rem'
            }}>
              🔒 Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="Entrez votre mot de passe"
                disabled={loading}
                style={{...inputStyle, paddingRight: '3rem'}}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.backgroundColor = '#fafafa';
                  e.target.style.boxShadow = 'none';
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280',
                  fontSize: '1.2rem'
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              padding: '1.2rem',
              border: 'none',
              borderRadius: '12px',
              background: loading 
                ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' 
                : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: loading 
                ? 'none' 
                : '0 4px 15px rgba(220, 38, 38, 0.3)',
              transform: loading ? 'none' : 'translateY(0)',
              letterSpacing: '0.5px'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(220, 38, 38, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(220, 38, 38, 0.3)';
              }
            }}
          >
            {loading ? '⏳ Connexion en cours...' : '🚀 Se connecter'}
          </button>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #e2e8f0',
          color: '#6b7280',
          fontSize: '0.9rem'
        }}>
          <p style={{ margin: 0 }}>
            © 2025 STS et Fédération Tunisienne de Football
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem' }}>
            Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;