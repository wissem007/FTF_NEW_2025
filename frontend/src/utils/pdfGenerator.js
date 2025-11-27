// utils/pdfGenerator.js - Générateur PDF amélioré pour la FTF

export const generateImprovedPDF = (userData, playersData = []) => {
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const currentDateTime = new Date().toLocaleString('fr-FR');

    // Calculer les statistiques
    const totalPlayers = playersData.length;
    const tunisianPlayers = playersData.filter(p => p.nationalite === 'TUNISIE').length;
    const completionRate = totalPlayers > 0 ? Math.round((tunisianPlayers / totalPlayers) * 100) : 100;

    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bordereau d'envoi - FTF</title>
    <style>
        @page {
            margin: 15mm;
            size: A4;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            font-size: 11px;
            line-height: 1.4;
            color: #333;
            background: white;
        }
        
        .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 3px solid #dc2626;
            margin-bottom: 25px;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #dc2626 0%, #ef4444 50%, #dc2626 100%);
        }
        
       .logo { width: 80px; height: 80px; margin: 0 auto 15px; background: #dc2626; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3); position: relative; }
.logo::before { content: '⚽'; font-size: 20px; position: absolute; top: -5px; right: -5px; background: white; color: #dc2626; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; border: 2px solid #dc2626; }
.club-logo { width: 60px; height: 60px; background: linear-gradient(45deg, #dc2626, #b91c1c); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px; margin: 0 auto 10px; box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3); }
.header-section { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.logos-container { display: flex; align-items: center; gap: 30px; }
        
        .federation-title {
            font-size: 20px;
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .document-title {
            font-size: 16px;
            color: #64748b;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .info-section {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 25px;
            border-left: 5px solid #dc2626;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin-bottom: 15px;
        }
        
        .info-item {
            background: white;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        
        .info-label {
            font-weight: bold;
            color: #dc2626;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        
        .info-value {
            font-size: 12px;
            color: #1e293b;
            font-weight: 600;
        }
        
        .table-container {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
        }
        
        .table-header {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            color: white;
            padding: 15px;
            text-align: center;
            font-weight: bold;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
        }
        
        th {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            border-bottom: 2px solid #dc2626;
        }
        
        td {
            padding: 10px 8px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: middle;
        }
        
        tr:nth-child(even) {
            background: #f8fafc;
        }
        
        .type-badge {
            background: #dc2626;
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        
        .nationality-flag {
            display: inline-block;
            width: 20px;
            height: 14px;
            background: #dc2626;
            border-radius: 2px;
            margin-right: 5px;
            vertical-align: middle;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
        }
        
        .signature-section {
            text-align: center;
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        
        .signature-title {
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 10px;
            font-size: 11px;
            text-transform: uppercase;
        }
        
        .signature-line {
            border-bottom: 2px solid #64748b;
            margin: 30px auto 10px;
            width: 150px;
        }
        
        .stats-section {
            background: linear-gradient(135deg, #fef7f7 0%, #fee2e2 100%);
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #fecaca;
            margin-bottom: 20px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            text-align: center;
        }
        
        .stat-item {
            background: white;
            padding: 10px;
            border-radius: 6px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .stat-number {
            font-size: 18px;
            font-weight: bold;
            color: #dc2626;
            display: block;
        }
        
        .stat-label {
            font-size: 9px;
            color: #64748b;
            text-transform: uppercase;
            margin-top: 2px;
        }
        
        .watermark {
            position: fixed;
            bottom: 50px;
            right: 50px;
            opacity: 0.1;
            font-size: 48px;
            color: #dc2626;
            font-weight: bold;
            transform: rotate(-45deg);
            z-index: -1;
        }

        .page-number {
            position: fixed;
            bottom: 20px;
            right: 20px;
            font-size: 10px;
            color: #64748b;
        }
        
        .club-name {
            font-size: 14px;
            color: #dc2626;
            font-weight: bold;
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    <div class="watermark">FTF</div>
    <div class="page-number">Page 1/1</div>
    
    <header class="header">
    <div class="header-section">
        <div>
            <div class="logo">FTF</div>
            <div style="text-align: center; font-size: 10px; color: #64748b;">Fédération Officielle</div>
        </div>
        
        <div style="text-align: center; flex: 1;">
            <h1 class="federation-title">Fédération Tunisienne de Football</h1>
            <h2 class="document-title">Bordereau d'Envoi des Licences</h2>
            ${userData.clubName ? `<div class="club-name">${userData.clubName}</div>` : ''}
        </div>
        
        <div>
            <div class="club-logo">${userData.clubName ? userData.clubName.substring(0, 2).toUpperCase() : 'CA'}</div>
            <div style="text-align: center; font-size: 10px; color: #64748b;">Club Officiel</div>
        </div>
    </div>
</header>
    
    <div class="info-section">
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Club ID</div>
                <div class="info-value">${userData.teamId || 'N/A'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Saison</div>
                <div class="info-value">${userData.seasonId || '2025'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Date d'émission</div>
                <div class="info-value">${currentDate}</div>
            </div>
        </div>
        
        <div class="stats-section">
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-number">${totalPlayers}</span>
                    <span class="stat-label">Total Joueurs</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${tunisianPlayers}</span>
                    <span class="stat-label">Nationalité TUN</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${completionRate}%</span>
                    <span class="stat-label">Complétude</span>
                </div>
            </div>
        </div>
    </div>
    
    <div class="table-container">
        <div class="table-header">
            Liste des Joueurs - Bordereau d'Envoi
        </div>
        
        <table>
            <thead>
                <tr>
                    <th style="width: 12%">Type</th>
                    <th style="width: 25%">Nom & Prénom</th>
                    <th style="width: 15%">CIN/Passeport</th>
                    <th style="width: 12%">Date Naissance</th>
                    <th style="width: 15%">Lieu Naissance</th>
                    <th style="width: 12%">Nationalité</th>
                    <th style="width: 12%">Date d'Envoi</th>
                </tr>
            </thead>
            <tbody>
                ${playersData.map(player => `
                <tr>
                    <td><span class="type-badge">${player.type || 'Joueur'}</span></td>
                    <td>
                        <strong>${player.nom || 'N/A'}</strong>
                        ${player.prenom ? `<br><small style="color: #64748b;">${player.prenom}</small>` : ''}
                    </td>
                    <td>${player.cin_passport || 'N/A'}</td>
                    <td>${player.date_naissance || 'N/A'}</td>
                    <td>${player.lieu_naissance || 'N/A'}</td>
                    <td>
                        <span class="nationality-flag"></span>${player.nationalite || 'N/A'}
                    </td>
                    <td>${player.date_envoi || currentDate}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    
    <footer class="footer">
        <div class="signature-section">
            <div class="signature-title">Signature du Responsable Club</div>
            <div class="signature-line"></div>
            <small style="color: #64748b;">Nom et signature</small>
        </div>
        
        <div class="signature-section">
            <div class="signature-title">Cachet de la FTF</div>
            <div class="signature-line"></div>
            <small style="color: #64748b;">Visa et cachet officiel</small>
        </div>
    </footer>
    
    <div style="margin-top: 20px; text-align: center; font-size: 9px; color: #64748b;">
        Document généré le ${currentDateTime} - Système FTF v2.0
    </div>
</body>
</html>`;

    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Attendre que le contenu soit chargé avant d'imprimer
    printWindow.onload = function () {
        setTimeout(() => {
            printWindow.print();
            // Optionnel : fermer la fenêtre après impression
            // printWindow.close();
        }, 500);
    };
};

// Fonction pour intégrer dans votre composant existant
export const handlePrintImproved = (userData, playersData) => {
    try {
        generateImprovedPDF(userData, playersData);
    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    }
};