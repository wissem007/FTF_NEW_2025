#!/bin/bash

# Script de déploiement React.js (Vite) + Spring Boot sur Debian 11
# Auteur: Assistant Claude
# Version: 1.0

set -e  # Arrêter le script en cas d'erreur

# Configuration
APP_NAME="mon-application"
APP_USER="appuser"
FRONTEND_DIR="/var/www/frontend"
BACKEND_DIR="/opt/backend"
NGINX_CONFIG="/etc/nginx/sites-available/$APP_NAME"
DOMAIN_NAME="votre-domaine.com"  # Modifier avec votre domaine
DB_NAME="app_database"
DB_USER="app_db_user"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# Vérifier si l'utilisateur est root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "Ce script doit être exécuté en tant que root"
    fi
}

# Mise à jour du système
update_system() {
    log "Mise à jour du système Debian 11..."
    apt update && apt upgrade -y
    apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates
}

# Installation de Java 17
install_java() {
    log "Installation de Java 17..."
    apt install -y openjdk-17-jdk
    
    # Configuration de JAVA_HOME
    echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> /etc/environment
    echo 'export PATH=$PATH:$JAVA_HOME/bin' >> /etc/environment
    source /etc/environment
}

# Installation de Node.js et npm
install_nodejs() {
    log "Installation de Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    
    # Installation de PM2 pour la gestion des processus
    npm install -g pm2
}

# Installation de Nginx
install_nginx() {
    log "Installation de Nginx..."
    apt install -y nginx
    systemctl enable nginx
}

# Installation de PostgreSQL
install_postgresql() {
    log "Installation de PostgreSQL..."
    apt install -y postgresql postgresql-contrib
    systemctl enable postgresql
    systemctl start postgresql
    
    # Création de la base de données et utilisateur
    sudo -u postgres psql << EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
EOF
}

# Installation de Certbot pour SSL
install_certbot() {
    log "Installation de Certbot pour SSL..."
    apt install -y certbot python3-certbot-nginx
}

# Création de l'utilisateur application
create_app_user() {
    log "Création de l'utilisateur application..."
    if ! id "$APP_USER" &>/dev/null; then
        useradd -r -s /bin/bash -d /home/$APP_USER -m $APP_USER
        usermod -aG sudo $APP_USER
    fi
}

# Configuration du firewall
configure_firewall() {
    log "Configuration du firewall UFW..."
    apt install -y ufw
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 'Nginx Full'
    ufw allow 8080  # Port Spring Boot
    ufw --force enable
}

# Déploiement du frontend React
deploy_frontend() {
    log "Déploiement du frontend React..."
    
    # Création du répertoire frontend
    mkdir -p $FRONTEND_DIR
    chown -R $APP_USER:$APP_USER $FRONTEND_DIR
    
    # Configuration Nginx pour le frontend
    cat > $NGINX_CONFIG << 'EOF'
server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER;
    root /var/www/frontend/dist;
    index index.html;

    # Gestion des assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
        access_log off;
    }

    # Gestion du SPA (Single Page Application)
    location / {
        try_files $uri $uri/ /index.html;
        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-Content-Type-Options "nosniff";
        add_header X-XSS-Protection "1; mode=block";
    }

    # Proxy vers l'API Spring Boot
    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Sécurité supplémentaire
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin";
}
EOF

    # Remplacer le placeholder du domaine
    sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN_NAME/g" $NGINX_CONFIG
    
    # Activation du site
    ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test et reload Nginx
    nginx -t && systemctl reload nginx
}

# Déploiement du backend Spring Boot
deploy_backend() {
    log "Déploiement du backend Spring Boot..."
    
    # Création du répertoire backend
    mkdir -p $BACKEND_DIR
    chown -R $APP_USER:$APP_USER $BACKEND_DIR
    
    # Configuration du service systemd pour Spring Boot
    cat > /etc/systemd/system/$APP_NAME-backend.service << EOF
[Unit]
Description=$APP_NAME Spring Boot Application
After=network.target postgresql.service

[Service]
Type=simple
User=$APP_USER
ExecStart=/usr/bin/java -jar $BACKEND_DIR/app.jar
ExecReload=/bin/kill -HUP \$MAINPID
KillMode=process
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=$APP_NAME-backend

# Variables d'environnement pour la production
Environment=SPRING_PROFILES_ACTIVE=prod
Environment=DATABASE_URL=jdbc:postgresql://localhost:5432/$DB_NAME
Environment=DATABASE_USERNAME=$DB_USER
Environment=DATABASE_PASSWORD=$DB_PASSWORD
Environment=SERVER_PORT=8080

# Sécurité
PrivateTmp=true
ProtectHome=true
ProtectSystem=strict
ReadWritePaths=$BACKEND_DIR

[Install]
WantedBy=multi-user.target
EOF

    # Activation du service
    systemctl daemon-reload
    systemctl enable $APP_NAME-backend.service
}

# Configuration des logs
setup_logging() {
    log "Configuration des logs..."
    
    # Rotation des logs Nginx
    cat > /etc/logrotate.d/nginx-$APP_NAME << EOF
/var/log/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}
EOF

    # Configuration des logs pour Spring Boot
    mkdir -p /var/log/$APP_NAME
    chown -R $APP_USER:$APP_USER /var/log/$APP_NAME
}

# Script de build et déploiement
create_deploy_script() {
    log "Création du script de déploiement..."
    
    cat > /home/$APP_USER/deploy.sh << 'EOF'
#!/bin/bash

# Script de déploiement de l'application
APP_NAME="mon-application"
FRONTEND_DIR="/var/www/frontend"
BACKEND_DIR="/opt/backend"
GIT_REPO="https://github.com/votre-username/votre-repo.git"  # À modifier
BRANCH="main"

set -e

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Téléchargement du code source
log "Téléchargement du code source..."
cd /tmp
rm -rf app-deploy
git clone -b $BRANCH $GIT_REPO app-deploy
cd app-deploy

# Build du frontend
log "Build du frontend React..."
cd frontend
npm install
npm run build
sudo rm -rf $FRONTEND_DIR/dist
sudo cp -r dist $FRONTEND_DIR/
sudo chown -R www-data:www-data $FRONTEND_DIR/dist

# Build du backend
log "Build du backend Spring Boot..."
cd ../backend
./mvnw clean package -DskipTests
sudo systemctl stop $APP_NAME-backend || true
sudo cp target/*.jar $BACKEND_DIR/app.jar
sudo chown $APP_USER:$APP_USER $BACKEND_DIR/app.jar
sudo systemctl start $APP_NAME-backend
sudo systemctl reload nginx

log "Déploiement terminé avec succès!"
EOF

    chmod +x /home/$APP_USER/deploy.sh
    chown $APP_USER:$APP_USER /home/$APP_USER/deploy.sh
}

# Script de monitoring
create_monitoring_script() {
    log "Création du script de monitoring..."
    
    cat > /home/$APP_USER/monitor.sh << EOF
#!/bin/bash

# Script de monitoring de l'application
APP_NAME="$APP_NAME"

check_service() {
    if systemctl is-active --quiet \$1; then
        echo "✅ \$1 est actif"
    else
        echo "❌ \$1 n'est pas actif"
        systemctl status \$1 --no-pager -l
    fi
}

echo "=== Monitoring de l'application $APP_NAME ==="
echo "Date: \$(date)"
echo ""

echo "Services:"
check_service nginx
check_service postgresql
check_service $APP_NAME-backend

echo ""
echo "Utilisation des ressources:"
echo "Mémoire: \$(free -h | grep Mem | awk '{print \$3 "/" \$2}')"
echo "Disque: \$(df -h / | tail -1 | awk '{print \$3 "/" \$2 " (" \$5 ")"}')"
echo "CPU: \$(uptime | awk -F'load average:' '{ print \$2 }')"

echo ""
echo "Logs récents du backend:"
journalctl -u $APP_NAME-backend --no-pager -n 5

echo ""
echo "Statut Nginx:"
nginx -t 2>&1
EOF

    chmod +x /home/$APP_USER/monitor.sh
    chown $APP_USER:$APP_USER /home/$APP_USER/monitor.sh
}

# Configuration SSL
setup_ssl() {
    log "Configuration SSL avec Let's Encrypt..."
    warn "Assurez-vous que votre domaine $DOMAIN_NAME pointe vers ce serveur"
    read -p "Continuer avec la configuration SSL? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        certbot --nginx -d $DOMAIN_NAME --non-interactive --agree-tos --email admin@$DOMAIN_NAME
        
        # Configuration du renouvellement automatique
        crontab -l | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | crontab -
    fi
}

# Fonction principale
main() {
    log "Début du déploiement sur Debian 11..."
    
    # Demander le mot de passe de la base de données
    read -s -p "Mot de passe pour la base de données: " DB_PASSWORD
    echo
    export DB_PASSWORD
    
    check_root
    update_system
    install_java
    install_nodejs
    install_nginx
    install_postgresql
    install_certbot
    create_app_user
    configure_firewall
    deploy_frontend
    deploy_backend
    setup_logging
    create_deploy_script
    create_monitoring_script
    
    log "Configuration de base terminée!"
    log ""
    log "Prochaines étapes:"
    log "1. Vérifiez que votre base de données PostgreSQL existante est accessible"
    log "2. Modifier le script deploy.sh avec votre repository Git"
    log "3. Adaptez les paramètres de connexion DB dans le service systemd si nécessaire"
    log "4. Placez vos fichiers d'application dans les bons répertoires"
    log "5. Exécutez: sudo -u $APP_USER /home/$APP_USER/deploy.sh"
    log "6. Configurez SSL: bash $0 ssl"
    log "7. Monitoring: sudo -u $APP_USER /home/$APP_USER/monitor.sh"
    log ""
    log "Base de données configurée:"
    log "  - Nom: $DB_NAME"
    log "  - Utilisateur: $DB_USER"
    log "  - Host: localhost:5432"
    
    warn "N'oubliez pas de:"
    warn "- Vérifier les paramètres de connexion à votre DB existante"
    warn "- Configurer vos variables d'environnement dans le service systemd"
    warn "- Adapter les configurations à votre application spécifique"
    warn "- Tester votre application avant la mise en production"
}

# Gestion des arguments
case "${1:-}" in
    ssl)
        setup_ssl
        ;;
    *)
        main
        ;;
esac