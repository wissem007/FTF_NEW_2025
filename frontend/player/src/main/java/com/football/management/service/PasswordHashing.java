package com.football.management.service;

public interface PasswordHashing {
    String encryptPassword(String password);
    boolean isPasswordValid(String password, String encryptedPassword);
}