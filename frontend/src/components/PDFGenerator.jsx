import React, { useState } from 'react';
import { Download } from 'lucide-react';
import QRCode from 'qrcode';

const PDFGenerator = ({ playerData = {} }) => {
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Fonction pour formater les dates au format JJ/MM/AAAA
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Fonction pour générer et dessiner le QR Code
  const drawQRCode = async (doc, x, y, size, code) => {
    try {
      // Générer l'image QR code en base64
      const qrCodeDataUrl = await QRCode.toDataURL(`Formulaire de demande de licence N° ${code}`, {
        width: size * 3, // Augmenter la résolution pour une meilleure qualité
        margin: 1,
      });
      
      // Ajouter l'image QR code au PDF
      doc.addImage(qrCodeDataUrl, 'PNG', x, y, size, size);
      
      // Ajouter le texte du code sous le QR code
      doc.setFontSize(6);
      doc.setTextColor(0, 0, 0);
      doc.text(`Code: ${code}`, x + size / 2, y + size + 4, { align: 'center' });
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
    }
  };

  const generatePDF = async () => {
    setGeneratingPdf(true);
    
    try {
      // Charger dynamiquement jsPDF
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      document.head.appendChild(script);
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4');
      
      // Bordure arrondie autour de la page
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.roundedRect(10, 10, 190, 277, 5, 5);
      
      // En-tête FTF
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Fédération Tunisienne de Football', 105, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Tél. : +216 71 793 760', 15, 30);
      doc.text('Fax : +216 71 282 566', 15, 35);
      doc.text('E-Mail : Directeur@ftf.org.tn', 15, 40);
      
      // QR Code en haut à droite contenant le code de la demande
      const demandeCode = playerData.demandeId || '980172';
      await drawQRCode(doc, 160, 15, 20, demandeCode);
      
      // Logo FTF (cercle avec texte)
      doc.setDrawColor(220, 38, 38);
      doc.setLineWidth(2);
      doc.circle(185, 25, 8);
      doc.setTextColor(220, 38, 38);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.text('FTF', 182, 26);
      
      // Titre principal
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Formulaire de demande de licence N° ${demandeCode}`, 105, 55, { align: 'center' });
      
      // Ligne séparatrice sous le titre
      doc.setLineWidth(0.5);
      doc.line(15, 60, 195, 60);
      
      // Dates
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Date de validation : ${formatDate(playerData.dateEnregistrement) || '16/08/2025'}`, 15, 70);
      doc.text('Date d\'arrivée :', 140, 70);
      
      // Section Licence avec fond gris
      let yPos = 85;
      doc.setFillColor(200, 200, 200);
      doc.rect(15, yPos, 180, 8, 'F');
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Licence', 105, yPos + 5, { align: 'center' });
      
      yPos += 15;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      // Informations licence
      doc.text('Saison :', 20, yPos + 5);
      doc.text(playerData.season || '2025/2026', 50, yPos + 5);
      
      doc.text('Compétition :', 100, yPos + 5);
      doc.text(playerData.typeCompetition || 'Football 11', 130, yPos + 5);
      
      doc.text('Régime :', 20, yPos + 12);
      doc.text(playerData.regime || 'AMATEUR', 50, yPos + 12);
      
      doc.text('Catégorie :', 100, yPos + 12);
      doc.text(playerData.category || 'CADETS', 130, yPos + 12);
      
      doc.text('Type de demande :', 20, yPos + 19);
      doc.text(playerData.typeLicence || 'RENOUVELLEMENT', 60, yPos + 19);
      
      doc.text('Club :', 100, yPos + 19);
      doc.text(playerData.club || 'Club Africain', 130, yPos + 19);
      
      // Section Porteur
      yPos += 35;
      doc.setFillColor(200, 200, 200);
      doc.rect(15, yPos, 180, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('Porteur', 105, yPos + 5, { align: 'center' });
      
      // Rectangle pour photo
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(150, yPos + 15, 40, 50);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Photo', 170, yPos + 42, { align: 'center' });
      
      // QR Code dans la section porteur
      await drawQRCode(doc, 160, yPos + 70, 25, demandeCode);
      
      yPos += 20;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      // Informations du porteur
      doc.text('Nom :', 20, yPos);
      doc.text(playerData.lastName || 'MARZOUGUI', 50, yPos);
      
      yPos += 8;
      doc.text('Prénom :', 20, yPos);
      doc.text(playerData.name || 'AYOUB', 50, yPos);
      
      yPos += 8;
      doc.text('Date de naissance :', 20, yPos);
      doc.text(formatDate(playerData.dateOfBirth) || '01/06/2009', 60, yPos);
      
      yPos += 8;
      doc.text('Lieu de naissance:', 20, yPos);
      doc.text(playerData.placeOfBirth || 'TUNIS', 60, yPos);
      
      yPos += 8;
      doc.text('Nationalité :', 20, yPos);
      doc.text(playerData.nationality || 'TUNISIE', 50, yPos);
      
      yPos += 8;
      doc.text('N° CIN/Passeport :', 20, yPos);
      doc.text(playerData.cinNumber || '14685807', 50, yPos);
      
      yPos += 8;
      doc.text('N° licence :', 20, yPos);
      doc.text(playerData.licenceNum || '090601009', 50, yPos);
      
      // Section Contrat
      yPos += 25;
      doc.setFillColor(200, 200, 200);
      doc.rect(15, yPos, 180, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('Contrat', 105, yPos + 5, { align: 'center' });
      
      yPos += 15;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Date début contrat :', 20, yPos);
      doc.text(formatDate(playerData.contractStartDate) || '16/08/2025', 60, yPos);
      
      yPos += 8;
      doc.text('Date fin contrat :', 20, yPos);
      doc.text(formatDate(playerData.contractEndDate) || '', 60, yPos);
      
      // Section Médecin du club
      yPos += 25;
      doc.setFillColor(200, 200, 200);
      doc.rect(15, yPos, 180, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('Médecin du club', 105, yPos + 5, { align: 'center' });
      
      yPos += 15;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      doc.text('Nom complet :', 20, yPos);
      doc.text(playerData.doctorName || 'OUAJIH BEN SAID', 50, yPos);
      
      yPos += 8;
      doc.text('Date de consultation :', 20, yPos);
      doc.text(formatDate(playerData.dateConsultationDoctor) || '16/08/2025', 65, yPos);
      
      // Section signatures
      yPos += 20;
      const sigWidth = 80;
      const sigHeight = 30;
      
      // Signature du porteur
      doc.rect(20, yPos, sigWidth, sigHeight);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Signature du porteur', 60, yPos - 2, { align: 'center' });
      
      // Cachet du médecin
      doc.rect(120, yPos, sigWidth, sigHeight);
      doc.text('Cachet du médecin', 160, yPos - 2, { align: 'center' });
      
      // Signature du médecin
      doc.rect(20, yPos + 35, sigWidth, sigHeight);
      doc.text('Signature du médecin', 60, yPos + 33, { align: 'center' });
      
      // Signature du SG/P du club
      doc.rect(120, yPos + 35, sigWidth, sigHeight);
      doc.text('Signature du SG/P du club', 160, yPos + 33, { align: 'center' });
      
      // QR Code en bas à droite
      await drawQRCode(doc, 160, yPos, 20, demandeCode);
      
      // Rectangle pour vignette
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(150, yPos - 65, 40, 20);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Vignette', 170, yPos - 50, { align: 'center' });
      
      // Sauvegarder
      const fileName = `licence_${(playerData.lastName || 'JOUEUR').replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      doc.save(fileName);
      
      document.head.removeChild(script);
      
    } catch (error) {
      console.error('Erreur PDF:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={generatePDF}
        disabled={generatingPdf}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {generatingPdf ? (
          <>Génération en cours...</>
        ) : (
          <>
            <Download size={18} className="mr-2" />
            Télécharger le PDF
          </>
        )}
      </button>
    </div>
  );
};

// Données par défaut pour tester
PDFGenerator.defaultProps = {
  playerData: {
    demandeId: '980172',
    dateEnregistrement: '2025-08-16',
    typeCompetition: 'Football 11',
    regime: 'AMATEUR',
    category: 'CADETS',
    typeLicence: 'RENOUVELLEMENT',
    club: 'Club Africain',
    name: 'AYOUB',
    lastName: 'MARZOUGUI',
    dateOfBirth: '2009-06-01',
    placeOfBirth: 'TUNIS',
    nationality: 'TUNISIE',
    cinNumber: '14685807',
    licenceNum: '090601009',
    contractStartDate: '2025-08-16',
    contractEndDate: '',
    doctorName: 'OUAJIH BEN SAID',
    dateConsultationDoctor: '2025-08-16'
  }
};

export default PDFGenerator;