package com.football.management.service;

import com.football.management.dto.DemandePlayersDTO;
import com.football.management.entity.DemandePlayers;
import com.football.management.repository.DemandePlayersRepository;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.itextpdf.text.pdf.draw.LineSeparator;  // ✅ AJOUTEZ CETTE LIGNE

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class PdfGenerationService {
    
    @Autowired
    private DemandePlayersRepository demandeRepository;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    
    /**
     * Générer le PDF d'une licence
     */
    public byte[] generateLicencePdf(Long demandeId) throws Exception {
        DemandePlayers demande = demandeRepository.findById(BigDecimal.valueOf(demandeId))
            .orElseThrow(() -> new IllegalArgumentException("Demande non trouvée"));
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        PdfWriter writer = PdfWriter.getInstance(document, baos);
        
        document.open();
        
        // Ajouter le contenu
        addHeader(document);
        addLicenceInfo(document, demande);
        addPlayerInfo(document, demande);
        addFooter(document);
        
        document.close();
        writer.close();
        
        return baos.toByteArray();
    }
    
    /**
     * Ajouter l'en-tête du PDF
     */
    private void addHeader(Document document) throws DocumentException {
        // Logo et titre
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, BaseColor.DARK_GRAY);
        Paragraph title = new Paragraph("FÉDÉRATION TUNISIENNE DE FOOTBALL", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(10);
        document.add(title);
        
        Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 14, BaseColor.GRAY);
        Paragraph subtitle = new Paragraph("LICENCE DE JOUEUR", subtitleFont);
        subtitle.setAlignment(Element.ALIGN_CENTER);
        subtitle.setSpacingAfter(20);
        document.add(subtitle);
        
        // Ligne de séparation
        LineSeparator line = new LineSeparator();
        line.setLineColor(BaseColor.LIGHT_GRAY);
        document.add(new Chunk(line));
        document.add(Chunk.NEWLINE);
    }
    
    /**
     * Ajouter les informations de la licence
     */
    private void addLicenceInfo(Document document, DemandePlayers demande) throws DocumentException {
        Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
        Font valueFont = FontFactory.getFont(FontFactory.HELVETICA, 12);
        
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingBefore(10);
        table.setSpacingAfter(15);
        
        // Style des cellules
        PdfPCell labelCell = new PdfPCell();
        labelCell.setBackgroundColor(new BaseColor(240, 240, 240));
        labelCell.setPadding(8);
        labelCell.setBorder(Rectangle.NO_BORDER);
        
        PdfPCell valueCell = new PdfPCell();
        valueCell.setPadding(8);
        valueCell.setBorder(Rectangle.NO_BORDER);
        
        // Numéro de licence
        addTableRow(table, "Numéro de Licence :", 
            demande.getLicenceNum() != null ? demande.getLicenceNum() : "N/A", 
            labelFont, valueFont);
        
        // ID de la demande
        addTableRow(table, "Numéro de Demande :", 
            String.valueOf(demande.getDemandeId()), 
            labelFont, valueFont);
        
        // Date d'émission
        addTableRow(table, "Date d'émission :", 
            LocalDate.now().format(DATE_FORMATTER), 
            labelFont, valueFont);
        
        // Saison
        if (demande.getSeasonId() != null) {
            addTableRow(table, "Saison :", 
                demande.getSeasonId().toString(), 
                labelFont, valueFont);
        }
        
        document.add(table);
    }
    
    /**
     * Ajouter les informations du joueur
     */
    private void addPlayerInfo(Document document, DemandePlayers demande) throws DocumentException {
        Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, BaseColor.DARK_GRAY);
        Paragraph sectionTitle = new Paragraph("INFORMATIONS DU JOUEUR", sectionFont);
        sectionTitle.setSpacingBefore(20);
        sectionTitle.setSpacingAfter(10);
        document.add(sectionTitle);
        
        Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
        Font valueFont = FontFactory.getFont(FontFactory.HELVETICA, 11);
        
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingAfter(20);
        
        // Nom complet
        addTableRow(table, "Nom :", 
            demande.getName() != null ? demande.getName().toUpperCase() : "N/A", 
            labelFont, valueFont);
        
        addTableRow(table, "Prénom :", 
            demande.getLastName() != null ? demande.getLastName() : "N/A", 
            labelFont, valueFont);
        
        // Date de naissance
        if (demande.getDateOfBirth() != null) {
            addTableRow(table, "Date de naissance :", 
                demande.getDateOfBirth().format(DATE_FORMATTER), 
                labelFont, valueFont);
        }
        
        // CIN ou Passeport
        if (demande.getCinNumber() != null) {
            addTableRow(table, "N° CIN :", 
                demande.getCinNumber(), 
                labelFont, valueFont);
        } else if (demande.getPassportNum() != null) {
            addTableRow(table, "N° Passeport :", 
                demande.getPassportNum(), 
                labelFont, valueFont);
        }
        
        // Catégorie
        if (demande.getPlayerCategoryId() != null) {
            addTableRow(table, "Catégorie :", 
                getCategoryName(demande.getPlayerCategoryId()), 
                labelFont, valueFont);
        }
        
        // Email
        if (demande.getEmail() != null) {
            addTableRow(table, "Email :", 
                demande.getEmail(), 
                labelFont, valueFont);
        }
        
        document.add(table);
    }
    
    /**
     * Ajouter le pied de page
     */
    private void addFooter(Document document) throws DocumentException {
        document.add(Chunk.NEWLINE);
        document.add(Chunk.NEWLINE);
        
        // Ligne de séparation
        LineSeparator line = new LineSeparator();
        line.setLineColor(BaseColor.LIGHT_GRAY);
        document.add(new Chunk(line));
        
        Font footerFont = FontFactory.getFont(FontFactory.HELVETICA, 9, BaseColor.GRAY);
        
        Paragraph footer = new Paragraph();
        footer.setAlignment(Element.ALIGN_CENTER);
        footer.setSpacingBefore(10);
        
        footer.add(new Chunk("Fédération Tunisienne de Football\n", footerFont));
        footer.add(new Chunk("Rue XYZ, Tunis - Tunisie\n", footerFont));
        footer.add(new Chunk("Tél: +216 71 123 456 | Email: contact@ftf.tn\n", footerFont));
        footer.add(new Chunk("www.ftf.tn", footerFont));
        
        document.add(footer);
        
        // Cachet et signature
        document.add(Chunk.NEWLINE);
        document.add(Chunk.NEWLINE);
        
        PdfPTable signatureTable = new PdfPTable(2);
        signatureTable.setWidthPercentage(100);
        signatureTable.setSpacingBefore(20);
        
        Font signFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
        
        PdfPCell leftCell = new PdfPCell(new Phrase("Cachet de la Fédération", signFont));
        leftCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        leftCell.setBorder(Rectangle.NO_BORDER);
        leftCell.setPaddingTop(30);
        
        PdfPCell rightCell = new PdfPCell(new Phrase("Signature du Président", signFont));
        rightCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        rightCell.setBorder(Rectangle.NO_BORDER);
        rightCell.setPaddingTop(30);
        
        signatureTable.addCell(leftCell);
        signatureTable.addCell(rightCell);
        
        document.add(signatureTable);
    }
    
    /**
     * Ajouter une ligne au tableau
     */
    private void addTableRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBackgroundColor(new BaseColor(245, 245, 245));
        labelCell.setPadding(8);
        labelCell.setBorder(Rectangle.NO_BORDER);
        
        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setPadding(8);
        valueCell.setBorder(Rectangle.NO_BORDER);
        
        table.addCell(labelCell);
        table.addCell(valueCell);
    }
    
    /**
     * Obtenir le nom de la catégorie
     */
    private String getCategoryName(BigDecimal categoryId) {
        return switch (categoryId.intValue()) {
            case 1 -> "POUSSINS";
            case 2 -> "BENJAMINS";
            case 3 -> "MINIMES";
            case 4 -> "CADETS";
            case 5 -> "JUNIORS";
            case 6 -> "ESPOIRS";
            case 7 -> "SENIORS";
            default -> "INCONNU";
        };
    }
    
    /**
     * Générer un récépissé de demande
     */
    public byte[] generateRecepissePdf(Long demandeId) throws Exception {
        DemandePlayers demande = demandeRepository.findById(BigDecimal.valueOf(demandeId))
            .orElseThrow(() -> new IllegalArgumentException("Demande non trouvée"));
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, baos);
        
        document.open();
        
        // Titre
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Paragraph title = new Paragraph("RÉCÉPISSÉ DE DEMANDE", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(30);
        document.add(title);
        
        // Informations
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12);
        
        document.add(new Paragraph("Demande N° : " + demande.getDemandeId(), normalFont));
        document.add(new Paragraph("Nom : " + demande.getName() + " " + demande.getLastName(), normalFont));
        document.add(new Paragraph("Date : " + LocalDate.now().format(DATE_FORMATTER), normalFont));
        document.add(Chunk.NEWLINE);
        
        Paragraph text = new Paragraph(
            "Nous accusons réception de votre demande de licence. " +
            "Vous serez notifié par email dès que votre demande sera traitée.",
            normalFont
        );
        document.add(text);
        
        document.close();
        
        return baos.toByteArray();
    }
}