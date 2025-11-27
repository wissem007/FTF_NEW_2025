package com.football.management.service;

import org.springframework.stereotype.Component;
import java.util.Base64;
import java.security.MessageDigest;

@Component
public class DefaultPasswordHashing implements PasswordHashing {
    
    @Override
    public String encryptPassword(String password) {
        // Test avec Base64 simple
        return Base64.getEncoder().encodeToString(password.getBytes());
    }
    
    @Override
    public boolean isPasswordValid(String password, String encryptedPassword) {
        try {
            // Test 1: Base64 simple
            String base64Test = Base64.getEncoder().encodeToString(password.getBytes());
            System.out.println("DEBUG - Test Base64: " + base64Test);
            
            // Test 2: MD5 + Base64
            String md5Test = getMd5Base64(password);
            System.out.println("DEBUG - Test MD5+Base64: " + md5Test);
            
            // Test 3: SHA-1 + Base64
            String sha1Test = getSha1Base64(password);
            System.out.println("DEBUG - Test SHA1+Base64: " + sha1Test);
            
            System.out.println("DEBUG - Password en base: " + encryptedPassword);
            
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