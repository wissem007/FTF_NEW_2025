# 📁 Fichiers CI/CD créés

Ce document liste tous les fichiers créés pour le pipeline CI/CD.

## ✅ Fichiers créés

### 1. Workflow GitHub Actions

📄 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
- Pipeline CI/CD complet
- Build automatique du backend (Maven) et frontend (Vite)
- Déploiement SSH sur le serveur Debian
- Se déclenche automatiquement à chaque `git push`

### 2. Scripts de déploiement

📁 **`deploy-scripts/`**

#### 📄 [`football-management.service`](deploy-scripts/football-management.service)
- Fichier service systemd pour le backend Spring Boot
- À copier dans `/etc/systemd/system/` sur le serveur
- **⚠️ IMPORTANT** : Configurez les variables d'environnement PostgreSQL

#### 📄 [`nginx-site.conf`](deploy-scripts/nginx-site.conf)
- Configuration Nginx pour servir le frontend et proxifier le backend
- À copier dans `/etc/nginx/sites-available/` sur le serveur
- Support HTTPS avec Let's Encrypt (commenté)

#### 📄 [`setup-server.sh`](deploy-scripts/setup-server.sh)
- Script d'installation automatique sur le serveur Debian
- Installe Java 17, Nginx, Node.js, PostgreSQL
- Crée l'utilisateur `football`
- Configure systemd et Nginx
- **À exécuter UNE SEULE FOIS** lors de la première installation

#### 📄 [`verify-deployment.sh`](deploy-scripts/verify-deployment.sh)
- Script de vérification de la configuration serveur
- Vérifie tous les prérequis (Java, Nginx, PostgreSQL, etc.)
- Teste les ports et la connectivité
- À exécuter après `setup-server.sh` pour valider la configuration

### 3. Documentation

#### 📄 [`DEPLOYMENT.md`](DEPLOYMENT.md)
- **Guide complet de déploiement** (documentation détaillée)
- Architecture du système
- Configuration étape par étape
- Maintenance et dépannage
- Commandes utiles
- Sécurité (HTTPS, pare-feu)

#### 📄 [`QUICK_START_DEPLOYMENT.md`](QUICK_START_DEPLOYMENT.md)
- **Guide de démarrage rapide** (5 minutes)
- Résumé des étapes essentielles
- Commandes de base
- Problèmes courants

#### 📄 [`CI-CD-FILES.md`](CI-CD-FILES.md)
- Ce fichier ! Liste de tous les fichiers CI/CD

---

## 🗂️ Structure complète

```
football-club-frontend/
│
├── .github/
│   └── workflows/
│       └── deploy.yml                    # ✅ Pipeline GitHub Actions
│
├── backend/
│   ├── src/
│   ├── pom.xml
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── deploy-scripts/
│   ├── setup-server.sh                   # ✅ Installation serveur
│   ├── verify-deployment.sh              # ✅ Vérification configuration
│   ├── football-management.service       # ✅ Service systemd
│   └── nginx-site.conf                   # ✅ Configuration Nginx
│
├── DEPLOYMENT.md                         # ✅ Documentation complète
├── QUICK_START_DEPLOYMENT.md             # ✅ Guide rapide
└── CI-CD-FILES.md                        # ✅ Ce fichier
```

---

## 🚀 Utilisation

### Première installation (sur le serveur Debian)

```bash
# 1. Copier les scripts sur le serveur
scp deploy-scripts/* root@178.33.210.146:/tmp/

# 2. Se connecter au serveur
ssh root@178.33.210.146

# 3. Exécuter le script de configuration
cd /tmp
chmod +x setup-server.sh verify-deployment.sh
sudo ./setup-server.sh

# 4. Vérifier la configuration
./verify-deployment.sh
```

### Configuration GitHub

```bash
# 1. Initialiser Git et pousser le code
git init
git add .
git commit -m "Add CI/CD pipeline"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/football-management.git
git push -u origin main

# 2. Configurer les secrets GitHub (voir QUICK_START_DEPLOYMENT.md)
#    - SSH_PRIVATE_KEY
#    - SERVER_HOST
#    - SERVER_USER
#    - SERVER_PORT
```

### Déploiement automatique

```bash
# Chaque push déclenche le déploiement
git add .
git commit -m "Mon changement"
git push origin main
```

---

## 📋 Checklist de configuration

### Sur le serveur Debian

- [ ] Exécuter `setup-server.sh`
- [ ] Configurer PostgreSQL dans `/etc/systemd/system/football-management.service`
- [ ] Générer la clé SSH pour GitHub Actions
- [ ] Exécuter `verify-deployment.sh` pour valider
- [ ] Tester l'accès HTTP (http://178.33.210.146)

### Sur GitHub

- [ ] Créer le repository
- [ ] Pousser le code avec les fichiers CI/CD
- [ ] Configurer les 4 secrets (SSH_PRIVATE_KEY, SERVER_HOST, SERVER_USER, SERVER_PORT)
- [ ] Vérifier que le workflow apparaît dans l'onglet Actions

### Premier déploiement

- [ ] Faire un commit et push
- [ ] Vérifier le workflow dans Actions
- [ ] Vérifier que l'application est accessible
- [ ] Vérifier les logs sur le serveur

---

## 🔧 Personnalisation

### Modifier le workflow GitHub Actions

Éditez [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) pour :
- Changer la branche de déploiement (actuellement `main` et `master`)
- Ajouter des tests automatiques
- Ajouter des notifications (Slack, Discord, email)
- Modifier les commandes de build

### Modifier la configuration systemd

Éditez [`deploy-scripts/football-management.service`](deploy-scripts/football-management.service) pour :
- Changer les variables d'environnement
- Ajuster la mémoire JVM (`-Xms`, `-Xmx`)
- Modifier le port du backend (défaut: 8082)
- Changer l'utilisateur (défaut: `football`)

### Modifier la configuration Nginx

Éditez [`deploy-scripts/nginx-site.conf`](deploy-scripts/nginx-site.conf) pour :
- Changer le nom de domaine
- Activer HTTPS
- Modifier les timeouts
- Ajouter des restrictions d'accès
- Changer le port du backend

---

## 📊 Architecture du déploiement

```
Développeur → Git Push → GitHub Actions → Build → SSH Deploy → Serveur Debian
                                                                      │
                                                                      ├── Nginx (Port 80)
                                                                      │     ├── Frontend (React)
                                                                      │     └── Proxy → Backend
                                                                      │
                                                                      ├── Spring Boot (Port 8082)
                                                                      │     └── JAR file
                                                                      │
                                                                      └── PostgreSQL (Port 5432)
```

---

## 🆘 Support

- **Guide complet** : [`DEPLOYMENT.md`](DEPLOYMENT.md)
- **Guide rapide** : [`QUICK_START_DEPLOYMENT.md`](QUICK_START_DEPLOYMENT.md)
- **Vérification** : Exécutez `verify-deployment.sh` sur le serveur

---

**Version** : 1.0.0
**Dernière mise à jour** : 2025-11-02
