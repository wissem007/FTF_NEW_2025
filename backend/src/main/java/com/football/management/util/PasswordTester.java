package com.football.management.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Utilitaire pour tester les mots de passe BCrypt
 * Usage: Lancer cette classe en standalone pour tester un mot de passe
 */
public class PasswordTester {

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        // Le hash BCrypt de votre base de données
        String hashedPassword = "$2a$12$mqHtjI8uYTNOGNZX/7H6dOZy5zUfYEimZFI4wTx28Eu9NjMopmDFC";

        // Tester différents mots de passe
        String[] testPasswords = {
            "admin",
            "password",
            "123456",
            "Admin123",
            "test123",
            "ariana"
        };

        System.out.println("=".repeat(60));
        System.out.println("TEST DE MOT DE PASSE BCRYPT");
        System.out.println("=".repeat(60));
        System.out.println("Hash en base: " + hashedPassword);
        System.out.println("-".repeat(60));

        for (String password : testPasswords) {
            boolean matches = encoder.matches(password, hashedPassword);
            String result = matches ? "✓ CORRECT" : "✗ Incorrect";
            System.out.printf("Mot de passe '%s': %s%n", password, result);
        }

        System.out.println("=".repeat(60));

        // Générer un nouveau hash BCrypt pour référence
        System.out.println("\nGénération de nouveaux hash BCrypt pour référence:");
        System.out.println("-".repeat(60));
        for (String password : new String[]{"admin", "test123"}) {
            String newHash = encoder.encode(password);
            System.out.printf("'%s' -> %s%n", password, newHash);
        }
    }
}
