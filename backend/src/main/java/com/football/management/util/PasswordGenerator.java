package com.football.management.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Générateur de hash BCrypt pour les mots de passe
 * Usage: java PasswordGenerator <mot_de_passe>
 */
public class PasswordGenerator {

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        if (args.length == 0) {
            System.out.println("Usage: java PasswordGenerator <mot_de_passe>");
            System.out.println("\nExemples de génération :");
            generateExamples(encoder);
            return;
        }

        String password = args[0];
        String hash = encoder.encode(password);

        System.out.println("=".repeat(80));
        System.out.println("GÉNÉRATEUR DE HASH BCRYPT");
        System.out.println("=".repeat(80));
        System.out.println("\nMot de passe en clair : " + password);
        System.out.println("\nHash BCrypt généré :");
        System.out.println(hash);
        System.out.println("\n" + "=".repeat(80));
        System.out.println("\nPour mettre à jour dans la base de données PostgreSQL :");
        System.out.println("UPDATE ac_user SET passe_word = '" + hash + "' WHERE user_name = 'votre_username';");
        System.out.println("=".repeat(80));
    }

    private static void generateExamples(BCryptPasswordEncoder encoder) {
        String[] examples = {"admin", "admin123", "test", "password123"};

        System.out.println("\n" + "=".repeat(80));
        System.out.println("EXEMPLES DE HASH BCRYPT");
        System.out.println("=".repeat(80));

        for (String password : examples) {
            String hash = encoder.encode(password);
            System.out.println("\nMot de passe : " + password);
            System.out.println("Hash BCrypt  : " + hash);
            System.out.println("-".repeat(80));
        }
    }
}
