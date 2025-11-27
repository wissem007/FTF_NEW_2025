#!/bin/bash
# Script de configuration rapide du serveur
# À exécuter en tant que root sur le serveur

echo "🚀 CONFIGURATION RAPIDE DU SERVEUR"
echo "=================================="

# Mise à jour
apt update && apt upgrade -y

# Installation Java 17
apt install -y openjdk-17-jdk

# Installation Nginx
apt install -y nginx
systemctl enable nginx
systemctl start nginx

# Installation Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Création utilisateur football
if ! id -u football &>/dev/null; then
    useradd -m -s /bin/bash football
    echo "✅ Utilisateur football créé"
fi

# Création répertoires
sudo -u football mkdir -p /home/football/football-management/{backend,frontend,logs}

# Génération clé SSH pour football
sudo -u football bash << 'EOF'
if [ ! -f ~/.ssh/id_rsa ]; then
    ssh-keygen -t rsa -b 4096 -C "github-deploy" -N "" -f ~/.ssh/id_rsa
    cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
    chmod 600 ~/.ssh/authorized_keys
    echo "✅ Clé SSH générée"
fi
EOF

echo ""
echo "✅ Configuration terminée !"
echo ""
echo "📋 PROCHAINES ÉTAPES :"
echo "1. Copiez cette clé SSH dans GitHub secrets (SSH_PRIVATE_KEY):"
echo ""
sudo -u football cat /home/football/.ssh/id_rsa
echo ""
echo "2. Configurez PostgreSQL dans: /etc/systemd/system/football-management.service"
echo ""
