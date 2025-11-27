import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Search, User, AlertTriangle, CheckCircle, X, Loader, Eye } from 'lucide-react';

const FacialRecognitionPage = ({ user }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchStatus, setSearchStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [cameraMode, setCameraMode] = useState(false);
  const [statistics, setStatistics] = useState(null);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    loadStatistics();
  }, [user?.seasonId]);

  const loadStatistics = async () => {
    try {
      const response = await fetch(`/api/v1/facial-recognition/statistics?seasonId=${user?.seasonId || ''}`);
      const data = await response.json();
      if (data.success) {
        setStatistics(data.data);
      }
    } catch (err) {
      console.error('Erreur chargement statistiques:', err);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setError(null);
      } else {
        setError('Veuillez sélectionner un fichier image valide');
      }
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setCameraMode(true);
      setError(null);
    } catch (err) {
      setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraMode(false);
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
      setSelectedFile(file);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      stopCamera();
    });
  };

  const performFacialSearch = async () => {
    if (!selectedFile) return;

    setSearchStatus('searching');
    setSearchResults([]);
    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);
      if (user?.seasonId) formData.append('seasonId', user.seasonId);
      if (user?.teamId) formData.append('teamId', user.teamId);

      const response = await fetch('/api/v1/facial-recognition/search', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSearchResults(data.data);
        setSearchStatus('success');
      } else {
        setError(data.error || 'Erreur lors de la recherche');
        setSearchStatus('error');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      setSearchStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const resetSearch = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setSearchResults([]);
    setSearchStatus('idle');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getConfidenceText = (confidence) => {
    if (confidence >= 0.9) return 'Très haute';
    if (confidence >= 0.7) return 'Haute';
    if (confidence >= 0.5) return 'Moyenne';
    return 'Faible';
  };

  return (
    <div style={{ padding: '2rem', background: '#fafbfc', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', 
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ 
                fontSize: '2rem', 
                fontWeight: '700', 
                color: '#111827', 
                margin: '0 0 0.5rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <Search style={{ color: '#3b82f6' }} />
                Reconnaissance Faciale
              </h1>
              <p style={{ color: '#6b7280', margin: 0 }}>
                Recherchez un intervenant dans la base de données à partir d'une photo
              </p>
            </div>
            
            {statistics && (
              <div style={{ 
                background: '#dbeafe', 
                padding: '1rem', 
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e40af', margin: '0 0 0.5rem 0' }}>
                  Statistiques
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#1e40af' }}>
                  <div>Total: {statistics.totalIntervenants}</div>
                  <div>Avec photos: {statistics.intervenantsWithPhotos}</div>
                  <div>Couverture: {Math.round(statistics.photosCoveragePercent)}%</div>
                </div>
              </div>
            )}
          </div>
          
          {/* Avertissement légal */}
          <div style={{ 
            padding: '1rem', 
            background: '#fef3c7', 
            border: '1px solid #f59e0b', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem'
          }}>
            <AlertTriangle style={{ width: '1.25rem', height: '1.25rem', color: '#d97706', flexShrink: 0, marginTop: '0.125rem' }} />
            <div style={{ fontSize: '0.875rem', color: '#92400e' }}>
              <strong>Avertissement :</strong> Cette fonctionnalité traite des données biométriques sensibles. 
              Assurez-vous d'avoir le consentement approprié et de respecter les réglementations RGPD.
            </div>
          </div>
        </div>

        {/* Zone de sélection/capture d'image */}
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', 
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#111827' }}>
            Sélection de la photo
          </h2>
          
          <div style={{ 
            border: '2px dashed #d1d5db', 
            borderRadius: '12px', 
            padding: '2rem',
            textAlign: 'center'
          }}>
            {!previewUrl ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1.5rem',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    <Upload size={16} />
                    Télécharger une photo
                  </button>
                  
                  <button
                    onClick={cameraMode ? stopCamera : startCamera}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1.5rem',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    <Camera size={16} />
                    {cameraMode ? 'Arrêter' : 'Utiliser'} la caméra
                  </button>
                </div>
                
                {cameraMode && (
                  <div style={{ marginBottom: '1rem' }}>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      style={{ 
                        maxWidth: '400px', 
                        borderRadius: '8px', 
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        marginBottom: '1rem'
                      }}
                    />
                    <br />
                    <button
                      onClick={capturePhoto}
                      style={{
                        padding: '0.75rem 2rem',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      📸 Capturer la photo
                    </button>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                
                <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
                  Formats acceptés: JPEG, PNG, GIF (max 5MB)
                </p>
              </div>
            ) : (
              <div>
                <img
                  src={previewUrl}
                  alt="Photo à analyser"
                  style={{ 
                    maxWidth: '400px', 
                    maxHeight: '300px', 
                    borderRadius: '8px', 
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    marginBottom: '1.5rem'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                  <button
                    onClick={performFacialSearch}
                    disabled={isLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 2rem',
                      background: isLoading ? '#9ca3af' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    {isLoading ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={16} />}
                    {isLoading ? 'Recherche...' : 'Lancer la recherche'}
                  </button>
                  
                  <button
                    onClick={resetSearch}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1.5rem',
                      background: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    <X size={16} />
                    Nouvelle recherche
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <div style={{ 
            background: 'white', 
            borderRadius: '16px', 
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', 
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <div style={{ 
              padding: '1rem', 
              background: '#fef2f2', 
              border: '1px solid #fecaca', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertTriangle style={{ color: '#dc2626' }} />
              <p style={{ color: '#dc2626', fontWeight: '500', margin: 0 }}>{error}</p>
            </div>
          </div>
        )}

        {/* Résultats de la recherche */}
        {searchStatus === 'success' && (
          <div style={{ 
            background: 'white', 
            borderRadius: '16px', 
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', 
            padding: '2rem'
          }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              marginBottom: '1rem', 
              color: '#111827',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle style={{ color: '#10b981' }} />
              Résultats de la recherche
            </h2>
            
            {searchResults.length === 0 ? (
              <div style={{ 
                padding: '3rem', 
                textAlign: 'center', 
                background: '#f9fafb', 
                borderRadius: '12px'
              }}>
                <User style={{ width: '4rem', height: '4rem', color: '#9ca3af', margin: '0 auto 1rem' }} />
                <p style={{ color: '#6b7280', fontSize: '1.125rem', fontWeight: '500', margin: '0 0 0.5rem 0' }}>
                  Aucun intervenant trouvé
                </p>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>
                  Essayez avec une photo de meilleure qualité ou vérifiez que la personne est dans la base de données.
                </p>
              </div>
            ) : (
              <div>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                  {searchResults.length} correspondance{searchResults.length > 1 ? 's' : ''} trouvée{searchResults.length > 1 ? 's' : ''}
                </p>
                
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {searchResults.map((result, index) => (
                    <div
                      key={`${result.intervenantId}-${index}`}
                      style={{
                        padding: '1.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f9fafb';
                        e.target.style.borderColor = '#d1d5db';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.borderColor = '#e5e7eb';
                      }}
                    >
                      <div style={{ 
                        width: '5rem', 
                        height: '5rem', 
                        background: '#f3f4f6', 
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}>
                        {result.photoId ? (
                          <img
                            src={`/api/v1/facial-recognition/photos/${result.photoId}`}
                            alt={`Photo de ${result.name}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User style={{ width: '2rem', height: '2rem', color: '#9ca3af' }} />
                        </div>
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: '0 0 0.5rem 0' }}>
                          {result.lastName} {result.name}
                        </h3>
                        <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                          <div style={{ marginBottom: '0.25rem' }}>Licence: {result.licenceNum}</div>
                          <div style={{ marginBottom: '0.25rem' }}>Équipe: {result.teamName}</div>
                          <div style={{ marginBottom: '0.25rem' }}>Maillot: {result.jerseyNumber}</div>
                          {result.cinNumber && <div>CIN: {result.cinNumber}</div>}
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          marginBottom: '0.25rem'
                        }}>
                          <CheckCircle size={20} className={getConfidenceColor(result.confidence)} />
                          <div>
                            <div style={{ 
                              fontSize: '1.5rem', 
                              fontWeight: '700',
                              color: result.confidence >= 0.9 ? '#059669' : result.confidence >= 0.7 ? '#d97706' : '#ea580c'
                            }}>
                              {Math.round(result.confidence * 100)}%
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                              {getConfidenceText(result.confidence)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <button
                          style={{
                            padding: '0.5rem',
                            background: '#dbeafe',
                            color: '#2563eb',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}
                          title="Voir les détails"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Canvas caché pour la capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Styles pour l'animation de rotation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default FacialRecognitionPage;