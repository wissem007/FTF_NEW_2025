package com.football.management.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.Base64;
import java.security.MessageDigest;

@Component
public class DefaultPasswordHashing implements PasswordHashing {

    private final BCryptPasswordEncoder bcryptEncoder = new BCryptPasswordEncoder();

    @Override
    public String encryptPassword(String password) {
        // Utiliser BCrypt par défaut pour les nouveaux mots de passe
        return bcryptEncoder.encode(password);
    }

    @Override
    public boolean isPasswordValid(String password, String encryptedPassword) {
        try {
            // Détection automatique du format de hash

            // Test 1: BCrypt (commence par $2a$, $2b$, $2y$)
            if (encryptedPassword != null && encryptedPassword.startsWith("$2")) {
                System.out.println("═══════════════════════════════════════════════════════════");
                System.out.println("DEBUG BCrypt - Vérification du mot de passe");
                System.out.println("Mot de passe saisi : [" + password + "] (longueur: " + password.length() + ")");
                System.out.println("Hash en base       : " + encryptedPassword);
                boolean isValid = bcryptEncoder.matches(password, encryptedPassword);
                System.out.println("Résultat           : " + (isValid ? "✓ VALIDE - Connexion autorisée" : "✗ INVALIDE - Mot de passe incorrect"));
                System.out.println("═══════════════════════════════════════════════════════════");
                return isValid;
            }

            // Test 2: Base64 simple (pour compatibilité avec anciens mots de passe)
            String base64Test = Base64.getEncoder().encodeToString(password.getBytes());
            System.out.println("DEBUG - Test Base64: " + base64Test);

            // Test 3: MD5 + Base64
            String md5Test = getMd5Base64(password);
            System.out.println("DEBUG - Test MD5+Base64: " + md5Test);

            // Test 4: SHA-1 + Base64
            String sha1Test = getSha1Base64(password);
            System.out.println("DEBUG - Test SHA1+Base64: " + sha1Test);

            System.out.println("DEBUG - Hash en base: " + encryptedPassword);

            // Vérifier quel test correspond
            if (base64Test.equals(encryptedPassword)) {
                System.out.println("TROUVÉ: Base64 simple");
                return true;
            }
            if (md5Test.equals(encryptedPassword)) {
                System.out.println("TROUVÉ: MD5 + Base64");
                return true;
            }
            if (sha1Test.equals(encryptedPassword)) {
                System.out.println("TROUVÉ: SHA1 + Base64");
                return true;
            }

            return false;
        } catch (Exception e) {
            System.err.println("ERREUR lors de la validation du mot de passe: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    private String getMd5Base64(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hash = md.digest(password.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            return "";
        }
    }

    private String getSha1Base64(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-1");
            byte[] hash = md.digest(password.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            return "";
        }
    }
}