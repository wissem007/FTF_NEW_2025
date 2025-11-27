# 🚀 Guide de Déploiement CI/CD - Football Management

Ce guide explique comment configurer le déploiement automatique de l'application Football Management sur le serveur Debian 178.33.210.146.

## 📋 Table des matières

1. [Architecture du déploiement](#architecture)
2. [Prérequis](#prérequis)
3. [Configuration du serveur](#configuration-serveur)
4. [Configuration GitHub Actions](#configuration-github)
5. [Déploiement](#déploiement)
6. [Maintenance](#maintenance)
7. [Dépannage](#dépannage)

---

## 🏗️ Architecture du déploiement {#architecture}

```
┌─────────────────────────────────────────────────────────────┐
│                    DÉVELOPPEUR                              │
│                                                             │
│  git push  ──────────────────────────────────────────┐     │
└──────────────────────────────────────────────────────┼─────┘
                                                       │
                                                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  GITHUB ACTIONS                             │
│                                                             │
│  1. Build Backend (Maven)  ──►  JAR file                   │
│  2. Build Frontend (Vite)  ──►  Static files               │
│  3. SSH Deploy to Server                                   │
└──────────────────────────────────────────────────────────────┘
                                                       │
                                                       ▼
┌─────────────────────────────────────────────────────────────┐
│            SERVEUR DEBIAN 178.33.210.146                    │
│                                                             │
│  ┌───────────────────┐      ┌───────────────────────┐     │
│  │  NGINX (Port 80)  │◄─────┤   Frontend (React)    │     │
│  │                   │      │   /frontend/          │     │
│  │  Reverse Proxy    │      └───────────────────────┘     │
│  │                   │                                     │
│  │  /api/* ──────────┼──┐                                 │
│  └───────────────────┘  │                                 │
│                         │                                 │
│                         ▼                                 │
│              ┌──────────────────────┐                     │
│              │  Spring Boot (8082)  │                     │
│              │  football-mgmt.jar   │                     │
│              │  (systemd service)   │                     │
│              └──────────────────────┘                     │
│                         │                                 │
│                         ▼                                 │
│              ┌──────────────────────┐                     │
│              │   PostgreSQL (5432)  │                     │
│              │  sss_competition_db  │                     │
│              └──────────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Prérequis {#prérequis}

### Sur votre machine locale

- [x] Git installé
- [x] Compte GitHub
- [x] Accès SSH au serveur 178.33.210.146

### Sur le serveur Debian 178.33.210.146

- [ ] Java 17 installé
- [ ] Nginx installé
- [ ] PostgreSQL installé et configuré
- [ ] Utilisateur `football` créé
- [ ] Clé SSH configurée

---

## 🔧 Configuration du serveur {#configuration-serveur}

### ÉTAPE 1: Connexion au serveur

```bash
ssh root@178.33.210.146
```

### ÉTAPE 2: Copier le script de configuration

Depuis votre machine locale :

```bash
scp deploy-scripts/setup-server.sh root@178.33.210.146:/tmp/
scp deploy-scripts/football-management.service root@178.33.210.146:/tmp/
scp deploy-scripts/nginx-site.conf root@178.33.210.146:/tmp/
```

### ÉTAPE 3: Exécuter le script de configuration

Sur le serveur :

```bash
cd /tmp
chmod +x setup-server.sh
sudo ./setup-server.sh
```

Ce script va installer et configurer :
- Java 17
- Nginx
- Node.js
- Utilisateur `football`
- Service systemd
- Configuration Nginx

### ÉTAPE 4: Configurer PostgreSQL

Modifiez le fichier `/etc/systemd/system/football-management.service` :

```bash
sudo nano /etc/systemd/system/football-management.service
```

Remplacez les valeurs suivantes :

```ini
Environment="DB_HOST=localhost"
Environment="DB_PORT=5432"
Environment="DB_NAME=sss_competition_db"
Environment="DB_USERNAME=VOTRE_UTILISATEUR_DB"
Environment="DB_PASSWORD=VOTRE_MOT_DE_PASSE_DB"
```

Sauvegardez et rechargez systemd :

```bash
sudo systemctl daemon-reload
```

### ÉTAPE 5: Créer une clé SSH pour le déploiement

Sur le serveur, connectez-vous en tant qu'utilisateur `football` :

```bash
sudo su - football
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy"
```

Appuyez sur Entrée 3 fois pour accepter les valeurs par défaut.

Ajoutez la clé publique aux clés autorisées :

```bash
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

**IMPORTANT**: Copiez le contenu de la clé privée :

```bash
cat ~/.ssh/id_rsa
```

Gardez cette clé, vous en aurez besoin pour GitHub Actions.

---

## 🔐 Configuration GitHub Actions {#configuration-github}

### ÉTAPE 1: Créer un repository GitHub

Si ce n'est pas déjà fait :

```bash
cd c:\projetp\football-club-frontend
git init
git add .
git commit -m "Initial commit with CI/CD pipeline"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/football-management.git
git push -u origin main
```

### ÉTAPE 2: Configurer les secrets GitHub

1. Allez sur votre repository GitHub
2. Cliquez sur **Settings** > **Secrets and variables** > **Actions**
3. Cliquez sur **New repository secret**
4. Ajoutez les secrets suivants :

| Nom du secret | Valeur | Description |
|--------------|---------|-------------|
| `SSH_PRIVATE_KEY` | Contenu de `/home/football/.ssh/id_rsa` | Clé SSH privée pour le déploiement |
| `SERVER_HOST` | `178.33.210.146` | Adresse IP du serveur |
| `SERVER_USER` | `football` | Utilisateur SSH |
| `SERVER_PORT` | `22` | Port SSH (22 par défaut) |

**Pour SSH_PRIVATE_KEY** :

```bash
# Sur le serveur (en tant que 'football')
cat ~/.ssh/id_rsa
```

Copiez TOUT le contenu (y compris `-----BEGIN RSA PRIVATE KEY-----` et `-----END RSA PRIVATE KEY-----`)

### ÉTAPE 3: Vérifier le workflow

Le fichier [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) est déjà créé et configuré.

Il se déclenchera automatiquement à chaque `git push` sur les branches `main` ou `master`.

---

## 🚀 Déploiement {#déploiement}

### Déploiement automatique

Une fois la configuration terminée, chaque `git push` déclenchera automatiquement :

```bash
git add .
git commit -m "Mon message de commit"
git push origin main
```

Le workflow GitHub Actions va :

1. ✅ Build le backend Spring Boot (Maven)
2. ✅ Build le frontend React (Vite)
3. ✅ Copier les fichiers sur le serveur via SSH
4. ✅ Redémarrer le service backend
5. ✅ Recharger Nginx

### Vérifier le déploiement

Sur GitHub :
1. Allez dans l'onglet **Actions**
2. Vous verrez l'historique des déploiements
3. Cliquez sur un déploiement pour voir les logs détaillés

Sur le serveur :

```bash
# Vérifier le service backend
sudo systemctl status football-management

# Voir les logs
tail -f /home/football/football-management/logs/application.log

# Vérifier Nginx
sudo systemctl status nginx
sudo nginx -t
```

### Accéder à l'application

- **Frontend** : http://178.33.210.146/
- **Backend API** : http://178.33.210.146/api/

---

## 🔧 Maintenance {#maintenance}

### Commandes utiles sur le serveur

```bash
# Redémarrer le backend
sudo systemctl restart football-management

# Voir les logs en temps réel
tail -f /home/football/football-management/logs/application.log
tail -f /home/football/football-management/logs/error.log

# Voir les logs Nginx
tail -f /var/log/nginx/football-management-access.log
tail -f /var/log/nginx/football-management-error.log

# Recharger Nginx (sans redémarrage)
sudo systemctl reload nginx

# Redémarrer Nginx
sudo systemctl restart nginx

# Vérifier l'état des services
sudo systemctl status football-management
sudo systemctl status nginx
sudo systemctl status postgresql
```

### Mise à jour manuelle

Si vous voulez déployer manuellement sans passer par GitHub Actions :

```bash
# Sur votre machine locale
cd c:\projetp\football-club-frontend

# Build backend
cd backend
mvn clean package -DskipTests
cd ..

# Build frontend
cd frontend
npm run build
cd ..

# Copier sur le serveur
scp backend/target/*.jar football@178.33.210.146:~/football-management/backend/football-management.jar
scp -r frontend/dist/* football@178.33.210.146:~/football-management/frontend/

# Redémarrer le service
ssh football@178.33.210.146 'sudo systemctl restart football-management'
```

### Rollback (retour arrière)

Si un déploiement pose problème :

```bash
# Sur le serveur
cd /home/football/football-management/backend

# Restaurer la version précédente (si vous avez fait une backup)
cp football-management.jar.backup football-management.jar

# Redémarrer
sudo systemctl restart football-management
```

**Conseil** : Modifiez le workflow GitHub Actions pour créer des backups automatiques :

```yaml
# Ajouter avant le déploiement
ssh -i ~/.ssh/deploy_key $SERVER_USER@$SERVER_HOST << 'EOF'
  cp ~/football-management/backend/football-management.jar \
     ~/football-management/backend/football-management.jar.backup
EOF
```

---

## 🐛 Dépannage {#dépannage}

### Le service ne démarre pas

```bash
# Vérifier les logs systemd
sudo journalctl -u football-management -n 100 --no-pager

# Vérifier les logs applicatifs
tail -n 100 /home/football/football-management/logs/error.log

# Vérifier que Java est bien installé
java -version

# Tester le JAR manuellement
cd /home/football/football-management/backend
java -jar football-management.jar
```

### Erreur de connexion à PostgreSQL

```bash
# Vérifier que PostgreSQL fonctionne
sudo systemctl status postgresql

# Vérifier les identifiants dans le service
sudo nano /etc/systemd/system/football-management.service

# Tester la connexion manuellement
psql -h localhost -U VOTRE_USER -d sss_competition_db
```

### Nginx retourne 502 Bad Gateway

```bash
# Le backend n'est probablement pas démarré
sudo systemctl status football-management

# Vérifier que le port 8082 est bien écouté
sudo netstat -tlnp | grep 8082

# Vérifier la configuration Nginx
sudo nginx -t

# Voir les logs Nginx
tail -f /var/log/nginx/football-management-error.log
```

### Le déploiement GitHub Actions échoue

**Erreur SSH** :
- Vérifiez que `SSH_PRIVATE_KEY` est bien configuré dans les secrets GitHub
- Vérifiez que la clé SSH est bien dans `/home/football/.ssh/authorized_keys`

**Erreur de build** :
- Vérifiez les logs dans l'onglet Actions de GitHub
- Corrigez le code et poussez à nouveau

**Timeout** :
- Le serveur peut être lent. Augmentez les timeouts dans le workflow

---

## 🔒 Sécurité

### HTTPS avec Let's Encrypt (optionnel mais recommandé)

```bash
# Installer certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtenir un certificat SSL (remplacez par votre domaine)
sudo certbot --nginx -d football.yourdomain.com

# Le certificat se renouvellera automatiquement
sudo systemctl status certbot.timer
```

Ensuite, décommentez la section HTTPS dans `/etc/nginx/sites-available/football-management`.

### Pare-feu

```bash
# Activer UFW
sudo ufw enable

# Autoriser uniquement les ports nécessaires
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS

# Bloquer l'accès direct au port 8082
sudo ufw deny 8082/tcp

# Vérifier
sudo ufw status
```

---

## 📚 Ressources supplémentaires

- [Documentation Spring Boot](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Documentation Nginx](https://nginx.org/en/docs/)
- [Documentation GitHub Actions](https://docs.github.com/en/actions)
- [Systemd Service Documentation](https://www.freedesktop.org/software/systemd/man/systemd.service.html)

---

## 📞 Support

En cas de problème :

1. Vérifiez les logs (voir section Maintenance)
2. Consultez la section Dépannage
3. Vérifiez l'historique des déploiements dans GitHub Actions

---

**Auteur** : Football Management Team
**Version** : 1.0.0
**Dernière mise à jour** : 2025-11-02
