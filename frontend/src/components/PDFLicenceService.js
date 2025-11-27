// PDFLicenceService.js - Service dédié à la génération de PDF (Refactorisé)
import QRCode from 'qrcode';

class PDFLicenceService {
  // Fonction utilitaire pour convertir en chaîne de manière sécurisée
  static safeString = (value, fallback = '') => {
    if (value === null || value === undefined) {
      return String(fallback);
    }
    return String(value);
  };

  // Fonction pour formater les dates au format JJ/MM/AAAA
  static formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return '';
    }
  };

  // Fonction pour générer et dessiner le QR Code
  static drawQRCode = async (doc, x, y, width, height, code) => {
    try {
      console.log('Generating QR code with content:', code);
      const qrCodeDataUrl = await QRCode.toDataURL(code, {
        width: width * 3,
        margin: 1,
      });
      doc.addImage(qrCodeDataUrl, 'PNG', x, y, width, height);
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
    }
  };

  // Fonction pour charger et ajouter le logo FTF
  static addFTFLogo = async (doc, x, y, width, height) => {
    try {
      const logoPath = '/ftf-logo.png';
      
      const loadImage = (url) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = url;
        });
      };
      
      const img = await loadImage(logoPath);
      doc.addImage(img, 'PNG', x, y, width, height);
    } catch (error) {
      console.error('Erreur lors du chargement du logo FTF:', error);
      // Fallback: dessiner un cercle rouge avec le texte FTF
      doc.setDrawColor(220, 38, 38);
      doc.setLineWidth(2);
      doc.circle(x + width/2, y + height/2, width/2);
      doc.setTextColor(220, 38, 38);
      doc.setFontSize(8);
      doc.setFont('times', 'bold');
      doc.text('FTF', x + width/2 - 3, y + height/2 + 2);
    }
  };

  // Fonctions de mapping des données
  static getCategoryName = (categoryId) => {
    const categories = {
      1: 'BENJAMINS', 2: 'ECOLES', 3: 'MINIMES', 4: 'CADETS',
      5: 'JUNIORS', 6: 'ELITE', 7: 'SENIORS', 8: 'JEUNE', 9: 'CP'
    };
    return categories[categoryId] || 'Non définie';
  };

  static getRegimeType = (regimeId) => {
    const regimes = {
      1: 'AMATEUR', 2: 'STAGIAIRE', 3: 'SEMI-PROFESSIONNEL',
      4: 'PROFESSIONNEL', 5: 'CP'
    };
    return regimes[regimeId] || 'Non défini';
  };

  static getTypeLicence = (typeLicenceId) => {
    const types = {
      1: 'NOUVELLE', 2: 'RENOUVELLEMENT', 3: 'RETOUR PRET', 4: 'MUTATION',
      5: 'PRET', 6: 'DEMISSION', 7: 'Mutation Exceptionelle', 8: 'TRANSFERT',
      9: 'RETOUR MUTATION', 10: 'SURCLASSEMENT', 11: 'LIBRE (AMATEUR)',
      12: 'TRANSFERT LIBRE', 14: 'Transfert à l\'etranger', 15: 'ANCIEN LICENCIÉ'
    };
    return types[typeLicenceId] || 'Non défini';
  };

  static getTypeCompetition = (typeCompetitionId) => {
    const types = {
      1: 'Football 11', 2: 'Football 7', 3: 'Football Féminin', 4: 'Futsal'
    };
    return types[typeCompetitionId] || 'Non défini';
  };

  // Fonction helper pour créer une section avec fond gris
  static createSectionHeader = (doc, yPos, width, title) => {
    doc.setFillColor(204, 204, 204);
    doc.rect(7, yPos, width, 8, 'F');
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(7, yPos, width, 8);
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(title, 7 + width/2, yPos + 5, { align: 'center' });
    return yPos + 12;
  };

  // Fonction helper pour dessiner les informations sous forme de liste
  static drawInfoList = (doc, data, startY, startX = 20, labelX = 20, valueX = 65) => {
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    data.forEach(([label, value], index) => {
      const currentY = startY + (index * 8);
      doc.setFont('times', 'bold');
      doc.text(label, labelX, currentY);
      doc.setFont('times', 'normal');
      doc.text(this.safeString(value), valueX, currentY);
    });

    return startY + (data.length * 8);
  };

  // Fonction helper pour dessiner l'en-tête du document
  static drawHeader = async (doc, playerData) => {
    // Bordure rectangulaire principale
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(7, 7, 198, 284);

    // Informations FTF
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Fédération Tunisienne de Football', 15, 12);
    doc.text('Tél. : +216 71 793 760', 15, 20);
    doc.text('Fax : +216 71 282 566', 15, 28);
    doc.text('E-Mail : Directeur@ftf.org.tn', 15, 36);

    // QR Code et contenu
    const demandeCode = this.safeString(playerData?.demandeId, '980859');
    const typeIntervenant = this.safeString(playerData?.ctIntervenantTypeId, '1');
    const qrContent = `${demandeCode}#${typeIntervenant}`;
    
    await this.drawQRCode(doc, 110, 14, 20, 20, qrContent);
    await this.addFTFLogo(doc, 170, 10, 25, 25);

    // Titre principal
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('times', 'bold');
    const titleY = 42;
    doc.rect(7, titleY - 4, 198, 5);
    doc.text(`Formulaire de demande de licence N° ${demandeCode}`, 102.5, titleY, { align: 'center' });

    // Date de validation
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.text(`Date de validation : ${this.formatDate(playerData?.dateEnregistrement) || '23/08/2025'}    Date d'arrivée :`, 15, 50);

    return { qrContent, startY: 53 };
  };

 
    // Fonction helper pour dessiner les rectangles de signature séparés
  // Fonction helper pour dessiner les rectangles de signature séparés
  static drawSignatures = (doc, yPos) => {
    // Ligne horizontale de séparation
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(15, yPos, 190, yPos);

    yPos += 2;
    const sigWidth = 47.5; // Largeur augmentée de 40 à 45
    const sigHeight = 28;
    const spacing = 1.5; // Espacement réduit pour compenser la largeur
    const totalWidth = 175; // Largeur totale disponible
    const startX = 9; // Position de départ

    const signatureLabels = [
      'Signature du porteur',
      'Signature du SG/P du club', 
      'Signature du médecin',
      'Cachet du médecin'
    ];

    for (let i = 0; i < 4; i++) {
      const xPos = startX + (i * (sigWidth + spacing));
      
      // Rectangle de signature séparé
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(xPos, yPos + 8, sigWidth, sigHeight);
      
      // Label au-dessus du rectangle
      doc.setFontSize(7);
      doc.setTextColor(0, 0, 0);
      doc.setFont('times', 'bold');
      doc.text(signatureLabels[i], xPos + sigWidth/2, yPos + 5, { align: 'center' });
    }
  };

  // Fonction principale pour générer le contenu d'une licence sur une page
  static generateSingleLicencePage = async (doc, playerData) => {
    // Dessiner l'en-tête et récupérer les informations de base
    const { qrContent, startY } = await this.drawHeader(doc, playerData);
    let yPos = startY;

    // Section Licence
    yPos = this.createSectionHeader(doc, yPos, 130, 'Licence');
    const licenseData = [
      ['Saison :', playerData?.seasonId ? `${String(playerData.seasonId)}/2026` : '2025/2026'],
      ['Compétition :', this.getTypeCompetition(playerData?.typeCompetitionId) || 'Football 11'],
      ['Régime :', this.getRegimeType(playerData?.regimeId) || 'Non défini'],
      ['Catégorie :', this.getCategoryName(playerData?.playerCategoryId) || 'JUNIORS'],
      ['Type de demande :', this.getTypeLicence(playerData?.typeLicenceId) || 'RENOUVELLEMENT'],
      ['Club :', playerData?.teamName || 'Non défini'] 
    ];
    yPos = this.drawInfoList(doc, licenseData, yPos) + 5;

    // Section Porteur

    yPos = yPos - 8;
    yPos = this.createSectionHeader(doc, yPos, 130, 'Porteur');
    
    // Rectangle pour photo
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(150, yPos + 5, 44, 55);
    doc.setFont('times', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text('Photo', 173, yPos + 35, { align: 'center' });

    // QR Code à côté de la section Porteur
    await this.drawQRCode(doc, 149, yPos - 55, 45, 45, qrContent);

    const playerInfo = [
      ['Nom :', playerData?.lastName || 'MOHAMED ESSAYEH'],
      ['Prénom :', playerData?.name || 'BADR'],
      ['Date de naissance :', this.formatDate(playerData?.dateOfBirth) || '16/12/1993'],
      ['Lieu de naissance :', playerData?.placeOfBirth || 'TUNIS'],
      ['Nationalité :', playerData?.paysLibelle || 'TUNISIE'],
      ['N° CIN/Passeport :', playerData?.passportNum || playerData?.cinNumber || '04843030'],
      ['N° licence :', this.safeString(playerData?.licenceNum || '931216024')]
    ];
    yPos = this.drawInfoList(doc, playerInfo, yPos) + 5;

    // Section Contrat
    yPos = yPos - 15;
    yPos = this.createSectionHeader(doc, yPos, 130, 'Contrat');
    const contractEndLabel = String(playerData?.typeLicenceId || '') === '5' ? 'Durée du prêt :' : 'Date fin contrat :';
    const contractEndText = String(playerData?.typeLicenceId || '') === '5' ? 
      this.safeString(playerData?.dureePret || '') : this.formatDate(playerData?.contractDateFin) || '';
    
    const contractData = [
      ['Date début contrat :', this.formatDate(playerData?.contractDate) || ''],
      [contractEndLabel, contractEndText]
    ];
    yPos = this.drawInfoList(doc, contractData, yPos) + 5;

    // Section Médecin du club
    yPos = yPos - 8;
    yPos = this.createSectionHeader(doc, yPos, 130, 'Médecin du club');
    const doctorData = [
      ['Nom :', this.safeString(playerData?.nameDoctor || '')],
      ['Prénom :', this.safeString(playerData?.lastNameDoctor || '')],
      ['Date de consultation :', this.formatDate(playerData?.dateConsultationDoctor) || '']
    ];
    yPos = this.drawInfoList(doc, doctorData, yPos) + 10;

      // Rectangle vignette - DÉPLACÉ VERS LE HAUT
    const vignetteY = yPos - 15; // Position Y pour la vignette
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(142, vignetteY - 4, 55, 25);
    doc.setFont('times', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text('Vignette', 169.5, vignetteY + 9, { align: 'center' });

    // QR Code en bas à droite
    await this.drawQRCode(doc, 175, yPos - 45, 20, 20, qrContent);

    // Signatures
    this.drawSignatures(doc, yPos + 10);
  };

  // Fonction pour charger jsPDF
  static loadJsPDF = async () => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    document.head.appendChild(script);
    
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
      setTimeout(() => reject(new Error('Timeout loading jsPDF')), 10000);
    });

    return { jsPDF: window.jspdf.jsPDF, script };
  };

  // Fonction principale de génération PDF pour une seule licence
  static generateLicencePDF = async (playerData) => {
    try {
      const { jsPDF, script } = await this.loadJsPDF();
      const doc = new jsPDF('p', 'mm', 'a4');

      await this.generateSingleLicencePage(doc, playerData);

      // Sauvegarder
      const sanitizedLastName = this.safeString(playerData?.lastName || 'JOUEUR').replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `licence_${sanitizedLastName}_${Date.now()}.pdf`;
      console.log('Saving PDF with filename:', fileName);
      doc.save(fileName);
      
      // Nettoyer
      document.head.removeChild(script);
      
      return fileName;
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      throw error;
    }
  };

  // Fonction pour générer un PDF avec plusieurs licences
  static generateMultipleLicencesPDF = async (playersData) => {
    try {
      const { jsPDF, script } = await this.loadJsPDF();
      const doc = new jsPDF('p', 'mm', 'a4');

      // Générer une page pour chaque joueur
      for (let i = 0; i < playersData.length; i++) {
        const playerData = playersData[i];
        
        // Ajouter une nouvelle page sauf pour la première
        if (i > 0) {
          doc.addPage();
        }

        await this.generateSingleLicencePage(doc, playerData);
      }

      // Sauvegarder avec un nom qui indique le nombre de licences
      const fileName = `licences_multiples_${playersData.length}_demandes_${Date.now()}.pdf`;
      console.log('Saving multiple licenses PDF:', fileName);
      doc.save(fileName);
      
      // Nettoyer
      document.head.removeChild(script);
      
      return fileName;
    } catch (error) {
      console.error('Erreur lors de la génération du PDF multiple:', error);
      throw error;
    }
  };
}

export default PDFLicenceService;