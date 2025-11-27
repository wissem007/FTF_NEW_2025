#!/bin/bash

# ========================================
# Script de vérification du déploiement
# À exécuter sur le serveur pour vérifier la configuration
# ========================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 VÉRIFICATION DE LA CONFIGURATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ERRORS=0
WARNINGS=0

# ========================================
# Fonction d'aide
# ========================================
check_pass() {
    echo "✅ $1"
}

check_fail() {
    echo "❌ $1"
    ((ERRORS++))
}

check_warn() {
    echo "⚠️  $1"
    ((WARNINGS++))
}

# ========================================
# 1. Vérifier Java
# ========================================
echo "📦 Vérification de Java..."
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | awk -F '"' '{print $2}')
    if [[ "$JAVA_VERSION" == 17.* ]]; then
        check_pass "Java 17 installé : $JAVA_VERSION"
    else
        check_warn "Java installé mais version incorrecte : $JAVA_VERSION (requis: 17)"
    fi
else
    check_fail "Java non installé"
fi
echo ""

# ========================================
# 2. Vérifier Nginx
# ========================================
echo "🌐 Vérification de Nginx..."
if command -v nginx &> /dev/null; then
    NGINX_VERSION=$(nginx -v 2>&1 | awk '{print $3}')
    check_pass "Nginx installé : $NGINX_VERSION"

    if systemctl is-active --quiet nginx; then
        check_pass "Nginx en cours d'exécution"
    else
        check_fail "Nginx installé mais non démarré"
    fi

    if nginx -t &> /dev/null; then
        check_pass "Configuration Nginx valide"
    else
        check_fail "Configuration Nginx invalide"
    fi
else
    check_fail "Nginx non installé"
fi
echo ""

# ========================================
# 3. Vérifier PostgreSQL
# ========================================
echo "🐘 Vérification de PostgreSQL..."
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version | awk '{print $3}')
    check_pass "PostgreSQL installé : $PSQL_VERSION"

    if systemctl is-active --quiet postgresql; then
        check_pass "PostgreSQL en cours d'exécution"
    else
        check_fail "PostgreSQL installé mais non démarré"
    fi
else
    check_fail "PostgreSQL non installé"
fi
echo ""

# ========================================
# 4. Vérifier l'utilisateur football
# ========================================
echo "👤 Vérification de l'utilisateur 'football'..."
if id -u football &>/dev/null; then
    check_pass "Utilisateur 'football' existe"

    if [ -d /home/football ]; then
        check_pass "Répertoire home existe : /home/football"
    else
        check_fail "Répertoire home manquant"
    fi
else
    check_fail "Utilisateur 'football' n'existe pas"
fi
echo ""

# ========================================
# 5. Vérifier les répertoires
# ========================================
echo "📁 Vérification de la structure des répertoires..."
DIRS=(
    "/home/football/football-management"
    "/home/football/football-management/backend"
    "/home/football/football-management/frontend"
    "/home/football/football-management/logs"
)

for dir in "${DIRS[@]}"; do
    if [ -d "$dir" ]; then
        check_pass "Répertoire existe : $dir"
    else
        check_fail "Répertoire manquant : $dir"
    fi
done
echo ""

# ========================================
# 6. Vérifier le service systemd
# ========================================
echo "⚙️  Vérification du service systemd..."
if [ -f /etc/systemd/system/football-management.service ]; then
    check_pass "Fichier service existe"

    if systemctl is-enabled --quiet football-management 2>/dev/null; then
        check_pass "Service activé au démarrage"
    else
        check_warn "Service non activé au démarrage"
    fi

    if systemctl is-active --quiet football-management 2>/dev/null; then
        check_pass "Service en cours d'exécution"
    else
        check_warn "Service non démarré (normal si premier déploiement)"
    fi
else
    check_fail "Fichier service manquant : /etc/systemd/system/football-management.service"
fi
echo ""

# ========================================
# 7. Vérifier la configuration Nginx
# ========================================
echo "📄 Vérification de la configuration Nginx..."
if [ -f /etc/nginx/sites-available/football-management ]; then
    check_pass "Configuration Nginx existe"

    if [ -L /etc/nginx/sites-enabled/football-management ]; then
        check_pass "Site activé (lien symbolique)"
    else
        check_fail "Site non activé"
    fi
else
    check_fail "Configuration Nginx manquante"
fi
echo ""

# ========================================
# 8. Vérifier les ports
# ========================================
echo "🔌 Vérification des ports..."

# Port 80 (Nginx)
if netstat -tlnp 2>/dev/null | grep -q ":80 "; then
    check_pass "Port 80 (HTTP) en écoute"
else
    check_fail "Port 80 (HTTP) non en écoute"
fi

# Port 8082 (Backend)
if netstat -tlnp 2>/dev/null | grep -q ":8082 "; then
    check_pass "Port 8082 (Backend) en écoute"
else
    check_warn "Port 8082 (Backend) non en écoute (normal si service non démarré)"
fi

# Port 5432 (PostgreSQL)
if netstat -tlnp 2>/dev/null | grep -q ":5432 "; then
    check_pass "Port 5432 (PostgreSQL) en écoute"
else
    check_fail "Port 5432 (PostgreSQL) non en écoute"
fi
echo ""

# ========================================
# 9. Vérifier les clés SSH
# ========================================
echo "🔐 Vérification des clés SSH..."
if [ -f /home/football/.ssh/id_rsa ]; then
    check_pass "Clé SSH privée existe"

    if [ -f /home/football/.ssh/id_rsa.pub ]; then
        check_pass "Clé SSH publique existe"
    else
        check_warn "Clé SSH publique manquante"
    fi

    if [ -f /home/football/.ssh/authorized_keys ]; then
        check_pass "Fichier authorized_keys existe"
    else
        check_warn "Fichier authorized_keys manquant"
    fi
else
    check_warn "Clé SSH non générée (requis pour GitHub Actions)"
fi
echo ""

# ========================================
# 10. Vérifier les permissions
# ========================================
echo "🔒 Vérification des permissions..."
if [ -O /home/football/football-management ]; then
    OWNER=$(stat -c '%U' /home/football/football-management 2>/dev/null)
    if [ "$OWNER" = "football" ]; then
        check_pass "Propriétaire correct : football"
    else
        check_warn "Propriétaire incorrect : $OWNER (devrait être 'football')"
    fi
else
    check_warn "Impossible de vérifier le propriétaire"
fi
echo ""

# ========================================
# 11. Vérifier les fichiers déployés
# ========================================
echo "📦 Vérification des fichiers déployés..."
if [ -f /home/football/football-management/backend/football-management.jar ]; then
    JAR_SIZE=$(du -h /home/football/football-management/backend/football-management.jar | awk '{print $1}')
    check_pass "JAR backend déployé ($JAR_SIZE)"
else
    check_warn "JAR backend non déployé (normal si premier déploiement)"
fi

if [ -f /home/football/football-management/frontend/index.html ]; then
    check_pass "Frontend déployé (index.html trouvé)"
else
    check_warn "Frontend non déployé (normal si premier déploiement)"
fi
echo ""

# ========================================
# 12. Test de connectivité HTTP
# ========================================
echo "🌐 Test de connectivité HTTP..."
if command -v curl &> /dev/null; then
    # Test frontend
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ 2>/dev/null)
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
        check_pass "Frontend accessible (HTTP $HTTP_CODE)"
    else
        check_warn "Frontend non accessible (HTTP $HTTP_CODE)"
    fi

    # Test backend
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/actuator/health 2>/dev/null)
    if [ "$HTTP_CODE" = "200" ]; then
        check_pass "Backend accessible (HTTP $HTTP_CODE)"
    else
        check_warn "Backend non accessible (HTTP $HTTP_CODE)"
    fi
else
    check_warn "curl non installé, impossible de tester HTTP"
fi
echo ""

# ========================================
# RÉSUMÉ
# ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RÉSUMÉ DE LA VÉRIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "🎉 PARFAIT ! Tout est correctement configuré."
    echo ""
    echo "Prochaines étapes :"
    echo "  1. Configurez les secrets GitHub Actions"
    echo "  2. Poussez votre code sur GitHub"
    echo "  3. Le déploiement se fera automatiquement"
elif [ $ERRORS -eq 0 ]; then
    echo "✅ Configuration OK avec $WARNINGS avertissement(s)"
    echo ""
    echo "Les avertissements sont normaux si c'est la première"
    echo "configuration (avant le premier déploiement)."
else
    echo "❌ $ERRORS erreur(s) et $WARNINGS avertissement(s) détecté(s)"
    echo ""
    echo "Veuillez corriger les erreurs avant de continuer."
    echo "Relancez le script setup-server.sh si nécessaire."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit $ERRORS
