#!/bin/bash

# ================================================================
# Script de déploiement automatique FTF
# Fédération Tunisienne de Football
# Version: 2.0 - Optimisé pour production
# ================================================================

set -euo pipefail  # Mode strict bash

# Configuration
readonly APP_NAME="FTF"
readonly APP_DIR="/var/www/frontend"
readonly BACKUP_DIR="/var/backups/ftf"
readonly LOG_FILE="/var/log/ftf-deploy.log"
readonly BRANCH="master"
readonly MAX_BACKUPS=5
readonly BUILD_TIMEOUT=300

# Couleurs
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

# Variables globales
DEPLOY_START_TIME=$(date +%s)
DEPLOYMENT_ID="deploy-$(date +%Y%m%d-%H%M%S)"

# ================================================================
# FONCTIONS UTILITAIRES
# ================================================================

log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $*" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[✓]${NC} $*" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[!]${NC} $*" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[✗]${NC} $*" | tee -a "$LOG_FILE"
    cleanup_on_error
    exit 1
}

# ================================================================
# FONCTIONS PRINCIPALES
# ================================================================

init_deployment() {
    log "Initialisation du déploiement $DEPLOYMENT_ID"
    mkdir -p "$BACKUP_DIR"
    
    # Vérifier les permissions
    if [[ ! -w "$APP_DIR" ]]; then
        error "Permissions insuffisantes sur $APP_DIR"
    fi
    
    # Vérifier l'espace disque (minimum 1GB)
    local available_space
    available_space=$(df "$APP_DIR" | awk 'NR==2 {print $4}')
    if [[ $available_space -lt 1048576 ]]; then
        error "Espace disque insuffisant (< 1GB disponible)"
    fi
    
    success "Initialisation terminée"
}

check_prerequisites() {
    log "Vérification des prérequis..."
    
    local required_commands=("node" "npm" "git")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            error "$cmd n'est pas installé"
        fi
    done
    
    # Vérifier les versions minimales
    local node_version
    node_version=$(node --version | sed 's/v//')
    if [[ $(echo "$node_version 16.0.0" | tr " " "\n" | sort -V | head -n1) != "16.0.0" ]]; then
        warning "Version Node.js recommandée: >= 16.0.0 (actuelle: $node_version)"
    fi
    
    success "Prérequis validés"
}

backup_current_version() {
    log "Sauvegarde de la version actuelle..."
    
    if [[ -d "$APP_DIR/dist" ]]; then
        local backup_path="$BACKUP_DIR/$DEPLOYMENT_ID"
        mkdir -p "$backup_path"
        
        cp -r "$APP_DIR/dist" "$backup_path/"
        
        # Sauvegarder les métadonnées
        {
            echo "BACKUP_DATE=$(date -Iseconds)"
            echo "GIT_COMMIT=$(cd "$APP_DIR" && git rev-parse HEAD 2>/dev/null || echo 'unknown')"
            echo "BUILD_SIZE=$(du -sh "$APP_DIR/dist" 2>/dev/null | cut -f1 || echo 'unknown')"
        } > "$backup_path/metadata.txt"
        
        success "Sauvegarde créée: $backup_path"
    else
        warning "Aucune version précédente à sauvegarder"
    fi
}

fetch_latest_code() {
    log "Récupération du code source..."
    
    cd "$APP_DIR"
    
    # Vérifier l'état du repository
    if ! git status --porcelain &> /dev/null; then
        error "Repository Git corrompu"
    fi
    
    # Nettoyer les fichiers non trackés si nécessaire
    if [[ -n $(git status --porcelain) ]]; then
        warning "Fichiers modifiés détectés, nettoyage..."
        git clean -fd
        git checkout .
    fi
    
    # Fetch et pull
    git fetch origin "$BRANCH" --prune
    
    local local_commit remote_commit
    local_commit=$(git rev-parse HEAD)
    remote_commit=$(git rev-parse "origin/$BRANCH")
    
    if [[ "$local_commit" == "$remote_commit" ]]; then
        warning "Aucune nouvelle modification (commit: ${local_commit:0:8})"
        return 0
    fi
    
    git pull origin "$BRANCH"
    
    local new_commit
    new_commit=$(git rev-parse --short HEAD)
    success "Code mis à jour vers commit: $new_commit"
}

install_dependencies() {
    log "Gestion des dépendances..."
    
    cd "$APP_DIR"
    
    # Vérifier si les dépendances ont changé
    if git diff HEAD~1 --name-only 2>/dev/null | grep -qE "(package\.json|package-lock\.json)" || [[ ! -d "node_modules" ]]; then
        log "Installation complète des dépendances..."
        rm -rf node_modules package-lock.json
        npm install --production=false --audit=false --fund=false
    else
        log "Vérification des dépendances existantes..."
        npm ci --audit=false --fund=false
    fi
    
    success "Dépendances installées"
}

build_application() {
    log "Build de l'application React..."
    
    cd "$APP_DIR"
    
    # Nettoyer le cache build précédent
    rm -rf dist/ .vite/
    
    # Build avec timeout
    timeout "$BUILD_TIMEOUT" npm run build || error "Build échoué (timeout: ${BUILD_TIMEOUT}s)"
    
    # Vérifications post-build
    if [[ ! -d "dist" ]] || [[ ! -f "dist/index.html" ]]; then
        error "Build incomplet - fichiers manquants"
    fi
    
    # Vérifier la taille du build
    local build_size
    build_size=$(du -sh dist/ | cut -f1)
    
    # Alerte si le build est trop volumineux (> 50MB)
    local size_mb
    size_mb=$(du -sm dist/ | cut -f1)
    if [[ $size_mb -gt 50 ]]; then
        warning "Build volumineux détecté: $build_size"
    fi
    
    success "Build terminé ($build_size)"
}

validate_build() {
    log "Validation du build..."
    
    cd "$APP_DIR/dist"
    
    # Fichiers critiques
    local critical_files=("index.html" "ftf-logo.png")
    for file in "${critical_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            error "Fichier critique manquant: $file"
        fi
    done
    
    # Vérifier les assets JS/CSS
    local js_files css_files
    js_files=$(find assets/ -name "*.js" 2>/dev/null | wc -l)
    css_files=$(find assets/ -name "*.css" 2>/dev/null | wc -l)
    
    if [[ $js_files -eq 0 ]] || [[ $css_files -eq 0 ]]; then
        error "Assets JS/CSS manquants (JS: $js_files, CSS: $css_files)"
    fi
    
    # Test syntaxe HTML
    if ! grep -q "<html" index.html; then
        error "index.html invalide"
    fi
    
    success "Build validé (JS: $js_files, CSS: $css_files)"
}

restart_services() {
    log "Redémarrage des services..."
    
    # Nginx reload
    if systemctl is-active --quiet nginx; then
        systemctl reload nginx
        success "Nginx rechargé"
    else
        error "Nginx n'est pas actif"
    fi
    
    # Vérifier le backend
    if command -v pm2 &> /dev/null; then
        local backend_status
        backend_status=$(pm2 jlist 2>/dev/null | jq -r '.[] | select(.name=="football-backend") | .pm2_env.status' 2>/dev/null || echo "not_found")
        
        case $backend_status in
            "online")
                success "Backend opérationnel"
                ;;
            "not_found")
                warning "Backend non trouvé dans PM2"
                ;;
            *)
                warning "Backend en état: $backend_status"
                ;;
        esac
    fi
}

run_health_checks() {
    log "Tests de santé post-déploiement..."
    
    # Test HTTP local
    if curl -sf "http://localhost/health" &> /dev/null; then
        success "Test HTTP local: OK"
    else
        warning "Test HTTP local: échec (normal si pas d'endpoint /health)"
    fi
    
    # Test HTTPS public
    if curl -sf --max-time 10 "https://licencesftf.com/" &> /dev/null; then
        success "Test HTTPS public: OK"
    else
        warning "Test HTTPS public: échec"
    fi
    
    # Test taille réponse
    local response_size
    response_size=$(curl -s "https://licencesftf.com/" | wc -c)
    if [[ $response_size -gt 1000 ]]; then
        success "Réponse HTML valide ($response_size octets)"
    else
        warning "Réponse HTML suspecte ($response_size octets)"
    fi
}

cleanup_old_backups() {
    log "Nettoyage des anciennes sauvegardes..."
    
    if [[ -d "$BACKUP_DIR" ]]; then
        cd "$BACKUP_DIR"
        # Garder les N dernières sauvegardes
        ls -1t | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm -rf
        local remaining
        remaining=$(ls -1 | wc -l)
        success "$remaining sauvegardes conservées (max: $MAX_BACKUPS)"
    fi
    
    # Nettoyer les logs (garder 100 dernières lignes)
    if [[ -f "$LOG_FILE" ]] && [[ $(wc -l < "$LOG_FILE") -gt 100 ]]; then
        tail -100 "$LOG_FILE" > "${LOG_FILE}.tmp"
        mv "${LOG_FILE}.tmp" "$LOG_FILE"
    fi
}

cleanup_on_error() {
    warning "Nettoyage suite à l'erreur..."
    
    # Restaurer la dernière sauvegarde si possible
    local latest_backup
    latest_backup=$(ls -1t "$BACKUP_DIR" 2>/dev/null | head -n1)
    
    if [[ -n "$latest_backup" ]] && [[ -d "$BACKUP_DIR/$latest_backup/dist" ]]; then
        warning "Tentative de restauration: $latest_backup"
        rm -rf "$APP_DIR/dist"
        cp -r "$BACKUP_DIR/$latest_backup/dist" "$APP_DIR/"
        systemctl reload nginx 2>/dev/null || true
        warning "Version précédente restaurée"
    fi
}

finalize_deployment() {
    local duration=$(($(date +%s) - DEPLOY_START_TIME))
    local minutes=$((duration / 60))
    local seconds=$((duration % 60))
    
    log "================================================"
    success "$APP_NAME déployé avec succès en ${minutes}m${seconds}s"
    log "Deployment ID: $DEPLOYMENT_ID"
    log "Application: https://licencesftf.com"
    log "Commit: $(cd "$APP_DIR" && git rev-parse --short HEAD)"
    log "Build size: $(du -sh "$APP_DIR/dist" | cut -f1)"
    log "================================================"
}

# ================================================================
# FONCTION PRINCIPALE
# ================================================================

main() {
    # Header
    log "================================================"
    log "Déploiement automatique $APP_NAME"
    log "Début: $(date)"
    log "================================================"
    
    # Étapes de déploiement
    init_deployment
    check_prerequisites
    backup_current_version
    fetch_latest_code
    install_dependencies
    build_application
    validate_build
    restart_services
    run_health_checks
    cleanup_old_backups
    finalize_deployment
}

# ================================================================
# EXÉCUTION
# ================================================================

# Gestion des signaux
trap cleanup_on_error ERR
trap 'error "Déploiement interrompu par signal"' INT TERM

# Vérifier si exécuté en root ou avec sudo
if [[ $EUID -ne 0 ]]; then
    error "Ce script doit être exécuté en root ou avec sudo"
fi

# Exécution
main "$@"