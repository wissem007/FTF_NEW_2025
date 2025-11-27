// PDFImportAdvanced.js
// COPIEZ CE CODE EXACTEMENT DANS src/components/PDFImportAdvanced.js

import React, { useState } from 'react';
import { Upload, FileText, Check, X, AlertCircle } from 'lucide-react';

const PDFImportAdvanced = ({ user, onImportComplete }) => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);

  // Fonction simple pour changer de fichier
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      console.log('Fichier sélectionné:', selectedFile.name);
    } else {
      alert('Veuillez choisir un fichier PDF');
    }
  };

  // Fonction simple pour simuler l'import
  const handleImport = () => {
    setImporting(true);
    
    // Simulation d'un délai de traitement
    setTimeout(() => {
      setImporting(false);
      alert('Import simulé terminé !');
      if (onImportComplete) {
        onImportComplete();
      }
    }, 2000);
  };

  // Interface simple
  return (
    <div style={{
      background: 'white',
      padding: '2rem',
      borderRadius: '12px',
      maxWidth: '600px',
      margin: '2rem auto'
    }}>
      <h2 style={{
        color: '#dc2626',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <FileText size={24} />
        Import de Joueurs PDF
      </h2>

      {!file && (
        <div style={{
          border: '2px dashed #d1d5db',
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center',
          background: '#f9fafb'
        }}>
          <Upload size={48} color="#9ca3af" style={{ marginBottom: '1rem' }} />
          <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
            Sélectionnez un fichier PDF à importer
          </p>
          
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            style={{
              margin: '1rem 0',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px'
            }}
          />
        </div>
      )}

      {file && !importing && (
        <div style={{
          background: '#f0f9ff',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          <h3 style={{ color: '#0c4a6e', marginBottom: '0.5rem' }}>
            Fichier sélectionné :
          </h3>
          <p style={{ color: '#374151', marginBottom: '1rem' }}>
            {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </p>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={handleImport}
              style={{
                background: '#dc2626',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Importer le PDF
            </button>
            
            <button
              onClick={() => setFile(null)}
              style={{
                background: '#6b7280',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {importing && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          background: '#fef3c7',
          borderRadius: '8px'
        }}>
          <p style={{ color: '#92400e', fontWeight: '600' }}>
            Import en cours... Veuillez patienter
          </p>
        </div>
      )}
    </div>
  );
};

export default PDFImportAdvanced;