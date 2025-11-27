# ⚡ Démarrage Rapide - Déploiement CI/CD

Guide de démarrage rapide pour déployer l'application Football Management sur le serveur Debian 178.33.210.146.

---

## 🚀 En 5 minutes

### 1️⃣ Sur le serveur Debian (178.33.210.146)

```bash
# Se connecter en SSH
ssh root@178.33.210.146

# Télécharger et exécuter le script de configuration
cd /tmp
# Copier les fichiers depuis votre machine locale (voir commande ci-dessous)
chmod +x setup-server.sh
sudo ./setup-server.sh
```

**Sur votre machine locale**, copiez les scripts :

```bash
cd c:\projetp\football-club-frontend
scp deploy-scripts/* root@178.33.210.146:/tmp/
```

### 2️⃣ Configurer PostgreSQL

```bash
# Sur le serveur
sudo nano /etc/systemd/system/football-management.service
```

Modifiez ces lignes :
```ini
Environment="DB_USERNAME=VOTRE_UTILISATEUR"
Environment="DB_PASSWORD=VOTRE_MOT_DE_PASSE"
```

Sauvegardez (Ctrl+O, Entrée, Ctrl+X) puis :

```bash
sudo systemctl daemon-reload
```

### 3️⃣ Créer la clé SSH pour GitHub Actions

```bash
# Sur le serveur, en tant qu'utilisateur 'football'
sudo su - football
ssh-keygen -t rsa -b 4096 -C "github-deploy"
# Appuyez 3x sur Entrée

# Autoriser la clé
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# COPIEZ cette clé (vous en aurez besoin pour GitHub)
cat ~/.ssh/id_rsa
```

### 4️⃣ Configurer GitHub

1. **Créer le repository** :
   ```bash
   cd c:\projetp\football-club-frontend
   git init
   git add .
   git commit -m "Initial commit with CI/CD"
   git branch -M main
   git remote add origin https://github.com/VOTRE_USERNAME/football-management.git
   git push -u origin main
   ```

2. **Ajouter les secrets** (Settings → Secrets → Actions → New secret) :

   | Secret | Valeur |
   |--------|--------|
   | `SSH_PRIVATE_KEY` | Contenu de `/home/football/.ssh/id_rsa` (étape 3) |
   | `SERVER_HOST` | `178.33.210.146` |
   | `SERVER_USER` | `football` |
   | `SERVER_PORT` | `22` |

### 5️⃣ Déployer !

```bash
# Faire un changement et pousser
git add .
git commit -m "Trigger first deployment"
git push origin main
```

🎉 Votre application sera automatiquement déployée !

---

## 📍 Accès à l'application

- **Frontend** : http://178.33.210.146/
- **Backend API** : http://178.33.210.146/api/

---

## 🔧 Commandes utiles

```bash
# Sur le serveur

# Voir les logs du backend
tail -f /home/football/football-management/logs/application.log

# Redémarrer le backend
sudo systemctl restart football-management

# Status des services
sudo systemctl status football-management
sudo systemctl status nginx

# Logs Nginx
tail -f /var/log/nginx/football-management-error.log
```

---

## 📚 Documentation complète

Pour plus de détails, consultez [DEPLOYMENT.md](DEPLOYMENT.md)

---

## ❓ Problèmes courants

### Le service ne démarre pas
```bash
sudo journalctl -u football-management -n 50
```

### Nginx retourne 502
```bash
# Vérifier que le backend est lancé
sudo systemctl status football-management
sudo netstat -tlnp | grep 8082
```

### GitHub Actions échoue
- Vérifiez que les secrets sont bien configurés
- Vérifiez les logs dans l'onglet Actions

---

**Support** : Consultez [DEPLOYMENT.md](DEPLOYMENT.md) pour le guide complet
