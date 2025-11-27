#!/bin/bash

# ========================================
# Script de configuration initiale du serveur Debian
# À exécuter UNE SEULE FOIS sur le serveur 178.33.210.146
# ========================================

set -e  # Arrêter en cas d'erreur

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 CONFIGURATION DU SERVEUR DEBIAN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ========================================
# ÉTAPE 1: Mise à jour du système
# ========================================
echo "📦 Mise à jour du système..."
sudo apt update
sudo apt upgrade -y

# ========================================
# ÉTAPE 2: Installation de Java 17
# ========================================
echo "☕ Installation de Java 17..."
sudo apt install -y openjdk-17-jdk openjdk-17-jre

# Vérifier l'installation
java -version
javac -version

# ========================================
# ÉTAPE 3: Installation de Nginx
# ========================================
echo "🌐 Installation de Nginx..."
sudo apt install -y nginx

# Activer Nginx au démarrage
sudo systemctl enable nginx
sudo systemctl start nginx

# ========================================
# ÉTAPE 4: Installation de Node.js (pour npm si besoin)
# ========================================
echo "📦 Installation de Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Vérifier l'installation
node --version
npm --version

# ========================================
# ÉTAPE 5: Création de l'utilisateur 'football'
# ========================================
echo "👤 Création de l'utilisateur 'football'..."
if ! id -u football &>/dev/null; then
    sudo useradd -m -s /bin/bash football
    echo "✅ Utilisateur 'football' créé"
else
    echo "⚠️  L'utilisateur 'football' existe déjà"
fi

# ========================================
# ÉTAPE 6: Création de la structure des répertoires
# ========================================
echo "📁 Création des répertoires..."
sudo -u football mkdir -p /home/football/football-management/backend
sudo -u football mkdir -p /home/football/football-management/frontend
sudo -u football mkdir -p /home/football/football-management/logs

# ========================================
# ÉTAPE 7: Configuration de PostgreSQL (si pas déjà fait)
# ========================================
echo "🐘 Vérification de PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "📦 Installation de PostgreSQL..."
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl enable postgresql
    sudo systemctl start postgresql
else
    echo "✅ PostgreSQL est déjà installé"
fi

# ========================================
# ÉTAPE 8: Configuration du service systemd
# ========================================
echo "⚙️  Configuration du service systemd..."
sudo cp football-management.service /etc/systemd/system/

# IMPORTANT: Modifier les variables d'environnement dans le fichier
echo "⚠️  IMPORTANT: Modifiez /etc/systemd/system/football-management.service"
echo "   pour configurer les identifiants PostgreSQL et autres variables"
read -p "Appuyez sur Entrée quand c'est fait..."

# Recharger systemd
sudo systemctl daemon-reload
sudo systemctl enable football-management

# ========================================
# ÉTAPE 9: Configuration de Nginx
# ========================================
echo "🌐 Configuration de Nginx..."
sudo cp nginx-site.conf /etc/nginx/sites-available/football-management

# Créer le lien symbolique
sudo ln -sf /etc/nginx/sites-available/football-management /etc/nginx/sites-enabled/

# Supprimer le site par défaut (optionnel)
sudo rm -f /etc/nginx/sites-enabled/default

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx

# ========================================
# ÉTAPE 10: Configuration du pare-feu (si ufw est utilisé)
# ========================================
echo "🔒 Configuration du pare-feu..."
if command -v ufw &> /dev/null; then
    sudo ufw allow 22/tcp   # SSH
    sudo ufw allow 80/tcp   # HTTP
    sudo ufw allow 443/tcp  # HTTPS
    sudo ufw allow 8082/tcp # Backend (optionnel, pour debug)
    # sudo ufw enable  # Décommenter si ufw n'est pas encore activé
    sudo ufw status
else
    echo "⚠️  UFW n'est pas installé. Pare-feu non configuré."
fi

# ========================================
# ÉTAPE 11: Permissions
# ========================================
echo "🔐 Configuration des permissions..."
sudo chown -R football:football /home/football/football-management
sudo chmod -R 755 /home/football/football-management

# ========================================
# ÉTAPE 12: Résumé de la configuration
# ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ CONFIGURATION TERMINÉE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Résumé de la configuration:"
echo "   👤 Utilisateur: football"
echo "   📁 Répertoire: /home/football/football-management/"
echo "   ☕ Java: $(java -version 2>&1 | head -n 1)"
echo "   🌐 Nginx: $(nginx -v 2>&1)"
echo "   📦 Node.js: $(node --version)"
echo "   🐘 PostgreSQL: $(psql --version)"
echo ""
echo "🔧 Prochaines étapes:"
echo "   1. Configurez les secrets GitHub Actions:"
echo "      - SSH_PRIVATE_KEY: Votre clé SSH privée"
echo "      - SERVER_HOST: 178.33.210.146"
echo "      - SERVER_USER: football"
echo "      - SERVER_PORT: 22"
echo ""
echo "   2. Modifiez /etc/systemd/system/football-management.service"
echo "      pour configurer les variables d'environnement PostgreSQL"
echo ""
echo "   3. Poussez votre code sur GitHub pour déclencher le déploiement"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
