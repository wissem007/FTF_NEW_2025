# ⚽ Football Management System

Système de gestion des demandes de licences de joueurs pour la Fédération Tunisienne de Football.

## 🚀 Déploiement rapide

**Nouveau !** Pipeline CI/CD automatique avec GitHub Actions.

👉 **[Guide de démarrage rapide (5 min)](QUICK_START_DEPLOYMENT.md)**

👉 **[Documentation complète](DEPLOYMENT.md)**

---

## 📋 Description

Application web complète pour la gestion des demandes de licences de joueurs :

- **Backend** : Spring Boot 3.2.0 + Java 17 + PostgreSQL
- **Frontend** : React 19 + Vite + Tailwind CSS
- **CI/CD** : GitHub Actions avec déploiement automatique

### Fonctionnalités principales

✅ Gestion des demandes de licences (Nouvelle, Renouvellement, Transfert, Mutation, Prêt)
✅ Validation automatique des quotas par catégorie et régime
✅ Génération de PDF avec QR Code
✅ Reconnaissance faciale (OpenCV)
✅ Dashboard statistiques
✅ Export et impression des licences

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    UTILISATEUR                              │
│                                                             │
│          http://178.33.210.146/                             │
└──────────────────────────────────┬──────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────┐
│                 NGINX (Port 80)                             │
│                                                             │
│  ┌───────────────────┐      ┌──────────────────────┐      │
│  │  Frontend React   │      │  Proxy /api/* →      │      │
│  │  Static Files     │      │  Backend :8082       │      │
│  └───────────────────┘      └──────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────┐
│            Spring Boot Backend (Port 8082)                  │
│                                                             │
│  Controllers → Services → Validators → JdbcTemplate        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL (Port 5432)                         │
│              sss_competition_db                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technologies utilisées

### Backend
- **Framework** : Spring Boot 3.2.0
- **Langage** : Java 17
- **Base de données** : PostgreSQL
- **Build** : Maven
- **Librairies** :
  - Spring Data JPA
  - JdbcTemplate
  - OpenCV (reconnaissance faciale)
  - jsPDF (génération PDF)
  - QRCode

### Frontend
- **Framework** : React 19
- **Build** : Vite
- **Styling** : Tailwind CSS
- **Librairies** :
  - Axios (HTTP)
  - React Toastify (notifications)
  - Recharts (graphiques)
  - QRCode.js

### DevOps
- **CI/CD** : GitHub Actions
- **Serveur web** : Nginx
- **Service** : systemd
- **OS** : Debian 12

---

## 📦 Installation locale

### Prérequis

- Java 17
- Maven 3.8+
- Node.js 20+
- PostgreSQL 14+

### Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Le backend sera accessible sur `http://localhost:8082`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173`

---

## 🚀 Déploiement en production

### Option 1 : Déploiement automatique (recommandé)

Le projet utilise **GitHub Actions** pour déployer automatiquement à chaque `git push`.

📖 **[Guide complet de déploiement](DEPLOYMENT.md)**

📖 **[Guide rapide (5 min)](QUICK_START_DEPLOYMENT.md)**

### Option 2 : Déploiement manuel

```bash
# Build backend
cd backend
mvn clean package -DskipTests

# Build frontend
cd ../frontend
npm run build

# Copier sur le serveur
scp backend/target/*.jar user@server:/path/to/deploy/
scp -r frontend/dist/* user@server:/path/to/frontend/
```

---

## 📁 Structure du projet

```
football-club-frontend/
│
├── .github/
│   └── workflows/
│       └── deploy.yml              # Pipeline CI/CD GitHub Actions
│
├── backend/                        # Backend Spring Boot
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/football/management/
│   │   │   │       ├── controller/
│   │   │   │       ├── service/
│   │   │   │       │   └── validation/  # Validateurs de licences
│   │   │   │       ├── dto/
│   │   │   │       └── entity/
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml
│
├── frontend/                       # Frontend React
│   ├── src/
│   │   ├── components/
│   │   │   ├── PlayerRequestForm.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── ...
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── deploy-scripts/                 # Scripts de déploiement
│   ├── setup-server.sh
│   ├── verify-deployment.sh
│   ├── football-management.service
│   └── nginx-site.conf
│
├── DEPLOYMENT.md                   # Documentation déploiement complète
├── QUICK_START_DEPLOYMENT.md       # Guide rapide
├── CI-CD-FILES.md                  # Liste des fichiers CI/CD
└── README.md                       # Ce fichier
```

---

## 🧪 Tests

### Backend

```bash
cd backend
mvn test
```

### Frontend

```bash
cd frontend
npm run test
```

---

## 📊 Validation des licences

Le système implémente des validateurs pour chaque type de licence :

- **Type 1** : NOUVELLE - Création d'une nouvelle licence
- **Type 2** : RENOUVELLEMENT - Renouvellement de licence existante
- **Type 3** : RETOUR PRÊT - Retour d'un joueur prêté
- **Type 4** : MUTATION - Changement d'équipe
- **Type 5** : PRÊT - Prêt de joueur (4 quotas : PRO, AMATEUR L1/L2/L3)
- **Type 9** : RETOUR MUTATION - Retour d'un joueur muté

Chaque validateur vérifie :
- Existence du joueur
- Quotas par catégorie et régime
- Documents requis (CIN, Passeport)
- Doublons

---

## 🔒 Sécurité

### Variables d'environnement sensibles

**NE JAMAIS COMMITTER** :
- Identifiants PostgreSQL
- Clés SSH
- Tokens API
- Fichiers `.env`

Ces valeurs sont configurées sur le serveur dans le fichier systemd.

### HTTPS

Pour activer HTTPS avec Let's Encrypt :

```bash
sudo certbot --nginx -d votre-domaine.com
```

Voir [DEPLOYMENT.md](DEPLOYMENT.md) pour plus de détails.

---

## 📝 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guide complet de déploiement
- **[QUICK_START_DEPLOYMENT.md](QUICK_START_DEPLOYMENT.md)** - Démarrage rapide (5 min)
- **[CI-CD-FILES.md](CI-CD-FILES.md)** - Liste des fichiers CI/CD

### Scripts de test

- **[TEST_PRET_SCENARIOS.md](backend/TEST_PRET_SCENARIOS.md)** - Tests PRÊT
- **[GUIDE_TEST_PRET_RAPIDE.md](backend/GUIDE_TEST_PRET_RAPIDE.md)** - Tests rapides

---

## 🤝 Contribution

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add amazing feature'`)
4. Poussez vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

Le pipeline CI/CD testera et validera automatiquement vos changements.

---

## 🐛 Problèmes courants

### Backend ne démarre pas

```bash
# Vérifier les logs
tail -f logs/application.log

# Vérifier PostgreSQL
psql -h localhost -U user -d sss_competition_db
```

### Frontend affiche une erreur 502

```bash
# Vérifier que le backend est lancé
systemctl status football-management

# Vérifier Nginx
nginx -t
systemctl status nginx
```

### Déploiement GitHub Actions échoue

- Vérifier les secrets GitHub (SSH_PRIVATE_KEY, SERVER_HOST, etc.)
- Consulter les logs dans l'onglet Actions
- Voir [DEPLOYMENT.md](DEPLOYMENT.md) section Dépannage

---

## 📞 Support

- **Issues** : Ouvrez une issue sur GitHub
- **Documentation** : Consultez [DEPLOYMENT.md](DEPLOYMENT.md)
- **Vérification serveur** : Exécutez `deploy-scripts/verify-deployment.sh`

---

## 📄 Licence

[À définir]

---

## 👥 Auteurs

**Football Management Team**

---

## 🎯 Roadmap

- [x] Système de validation des licences
- [x] Pipeline CI/CD automatique
- [x] Dashboard statistiques
- [x] Génération PDF avec QR Code
- [ ] Tests automatisés complets
- [ ] Monitoring avec Prometheus/Grafana
- [ ] Notifications par email
- [ ] API mobile

---

**Version** : 1.0.0
**Dernière mise à jour** : 2025-11-02
