#!/bin/bash

# Script d'audit de sécurité pour serveur Debian
# Auteur: Assistant Claude
# Version: 1.0
# Compatible: Debian 10/11/12

set -e

# Configuration
SCRIPT_NAME="Audit de Sécurité Debian"
HOSTNAME=$(hostname)
DATE=$(date '+%Y-%m-%d %H:%M:%S')
REPORT_FILE="/tmp/security_audit_$(date +%Y%m%d_%H%M%S).html"
LOG_FILE="/tmp/security_audit.log"

# Compteurs pour le score de sécurité
TOTAL_CHECKS=0
PASSED_CHECKS=0
WARNINGS=0
CRITICAL_ISSUES=0

# Couleurs pour l'affichage terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Fonctions d'affichage
print_header() {
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}     $SCRIPT_NAME${NC}"
    echo -e "${BLUE}     Serveur: $HOSTNAME${NC}"
    echo -e "${BLUE}     Date: $DATE${NC}"
    echo -e "${BLUE}============================================${NC}"
    echo ""
}

log_check() {
    ((TOTAL_CHECKS++))
    echo "[$DATE] CHECK: $1" >> "$LOG_FILE"
}

log_pass() {
    ((PASSED_CHECKS++))
    echo -e "${GREEN}✅ PASS:${NC} $1"
    echo "[$DATE] PASS: $1" >> "$LOG_FILE"
}

log_warn() {
    ((WARNINGS++))
    echo -e "${YELLOW}⚠️  WARN:${NC} $1"
    echo "[$DATE] WARN: $1" >> "$LOG_FILE"
}

log_fail() {
    ((CRITICAL_ISSUES++))
    echo -e "${RED}❌ FAIL:${NC} $1"
    echo "[$DATE] FAIL: $1" >> "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}ℹ️  INFO:${NC} $1"
    echo "[$DATE] INFO: $1" >> "$LOG_FILE"
}

# Initialisation du rapport HTML
init_html_report() {
    cat > "$REPORT_FILE" << 'EOF'
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport d'Audit de Sécurité</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; margin: -20px -20px 20px -20px; border-radius: 10px 10px 0 0; }
        .score { font-size: 2em; text-align: center; margin: 20px 0; }
        .score.good { color: #27ae60; }
        .score.warning { color: #f39c12; }
        .score.critical { color: #e74c3c; }
        .section { margin: 20px 0; border: 1px solid #ddd; border-radius: 8px; }
        .section-header { background: #f8f9fa; padding: 15px; border-bottom: 1px solid #ddd; font-weight: bold; border-radius: 8px 8px 0 0; }
        .section-content { padding: 15px; }
        .check { margin: 10px 0; padding: 10px; border-radius: 5px; }
        .check.pass { background: #d4edda; border-left: 4px solid #28a745; }
        .check.warn { background: #fff3cd; border-left: 4px solid #ffc107; }
        .check.fail { background: #f8d7da; border-left: 4px solid #dc3545; }
        .check.info { background: #cce7ff; border-left: 4px solid #007bff; }
        .summary-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #dee2e6; }
        .stat-number { font-size: 2em; font-weight: bold; color: #495057; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; font-weight: bold; }
        .recommendation { background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #007bff; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔒 Rapport d'Audit de Sécurité</h1>
            <p><strong>Serveur:</strong> HOSTNAME_PLACEHOLDER</p>
            <p><strong>Date:</strong> DATE_PLACEHOLDER</p>
        </div>
EOF

    sed -i "s/HOSTNAME_PLACEHOLDER/$HOSTNAME/g" "$REPORT_FILE"
    sed -i "s/DATE_PLACEHOLDER/$DATE/g" "$REPORT_FILE"
}

add_to_html() {
    echo "$1" >> "$REPORT_FILE"
}

# Fonction pour ajouter un check au rapport HTML
add_check_to_html() {
    local status=$1
    local title=$2
    local description=$3
    local recommendation=$4
    
    case $status in
        "pass") class="pass"; icon="✅";;
        "warn") class="warn"; icon="⚠️";;
        "fail") class="fail"; icon="❌";;
        "info") class="info"; icon="ℹ️";;
    esac
    
    cat >> "$REPORT_FILE" << EOF
        <div class="check $class">
            <strong>$icon $title</strong><br>
            <p>$description</p>
            $(if [ -n "$recommendation" ]; then echo "<div class=\"recommendation\"><strong>Recommandation:</strong> $recommendation</div>"; fi)
        </div>
EOF
}

# Vérifications de sécurité

check_system_updates() {
    echo -e "\n${PURPLE}=== MISES À JOUR SYSTÈME ===${NC}"
    add_to_html "<div class=\"section\"><div class=\"section-header\">🔄 Mises à jour système</div><div class=\"section-content\">"
    
    log_check "Vérification des mises à jour système"
    
    apt list --upgradable 2>/dev/null > /tmp/updates.txt
    updates_count=$(grep -c "upgradable" /tmp/updates.txt 2>/dev/null || echo "0")
    
    if [ "$updates_count" -eq 0 ]; then
        log_pass "Système à jour (0 mise à jour disponible)"
        add_check_to_html "pass" "Mises à jour système" "Le système est à jour" ""
    elif [ "$updates_count" -le 5 ]; then
        log_warn "Quelques mises à jour disponibles ($updates_count)"
        add_check_to_html "warn" "Mises à jour système" "$updates_count mises à jour disponibles" "Exécutez: apt update && apt upgrade"
    else
        log_fail "Nombreuses mises à jour disponibles ($updates_count)"
        add_check_to_html "fail" "Mises à jour système" "$updates_count mises à jour disponibles - système obsolète" "Mettez à jour immédiatement: apt update && apt upgrade"
    fi
    
    # Vérification des mises à jour de sécurité
    security_updates=$(grep -i security /tmp/updates.txt 2>/dev/null | wc -l || echo "0")
    if [ "$security_updates" -gt 0 ]; then
        log_fail "Mises à jour de sécurité critiques disponibles ($security_updates)"
        add_check_to_html "fail" "Mises à jour de sécurité" "$security_updates mises à jour de sécurité en attente" "Installez immédiatement les mises à jour de sécurité"
    else
        log_pass "Aucune mise à jour de sécurité critique en attente"
        add_check_to_html "pass" "Mises à jour de sécurité" "Aucune mise à jour de sécurité critique" ""
    fi
    
    add_to_html "</div></div>"
}

check_firewall() {
    echo -e "\n${PURPLE}=== PARE-FEU ===${NC}"
    add_to_html "<div class=\"section\"><div class=\"section-header\">🛡️ Configuration du pare-feu</div><div class=\"section-content\">"
    
    log_check "Vérification du pare-feu"
    
    if command -v ufw >/dev/null 2>&1; then
        ufw_status=$(ufw status 2>/dev/null | head -1)
        if echo "$ufw_status" | grep -q "Status: active"; then
            log_pass "UFW est actif et configuré"
            add_check_to_html "pass" "UFW Pare-feu" "UFW est actif et protège le serveur" ""
            
            # Vérification des règles
            open_ports=$(ufw status numbered 2>/dev/null | grep -c "ALLOW" || echo "0")
            log_info "Nombre de règles d'autorisation: $open_ports"
        else
            log_fail "UFW n'est pas actif"
            add_check_to_html "fail" "UFW Pare-feu" "Le pare-feu UFW n'est pas actif" "Activez UFW: ufw enable"
        fi
    else
        log_warn "UFW n'est pas installé"
        add_check_to_html "warn" "UFW Pare-feu" "UFW n'est pas installé" "Installez UFW: apt install ufw"
    fi
    
    # Vérification d'iptables
    if iptables -L >/dev/null 2>&1; then
        iptables_rules=$(iptables -L | wc -l)
        if [ "$iptables_rules" -gt 8 ]; then
            log_info "Règles iptables personnalisées détectées ($iptables_rules lignes)"
            add_check_to_html "info" "iptables" "Règles iptables personnalisées détectées" ""
        fi
    fi
    
    add_to_html "</div></div>"
}

check_ssh_security() {
    echo -e "\n${PURPLE}=== SÉCURITÉ SSH ===${NC}"
    add_to_html "<div class=\"section\"><div class=\"section-header\">🔑 Configuration SSH</div><div class=\"section-content\">"
    
    log_check "Vérification de la configuration SSH"
    
    if [ -f /etc/ssh/sshd_config ]; then
        # Vérification du port SSH
        ssh_port=$(grep -E "^Port " /etc/ssh/sshd_config | awk '{print $2}' || echo "22")
        if [ "$ssh_port" != "22" ]; then
            log_pass "Port SSH modifié ($ssh_port)"
            add_check_to_html "pass" "Port SSH" "Port SSH personnalisé: $ssh_port" ""
        else
            log_warn "Port SSH par défaut (22) utilisé"
            add_check_to_html "warn" "Port SSH" "Utilisation du port par défaut (22)" "Changez le port SSH dans /etc/ssh/sshd_config"
        fi
        
        # Vérification de l'authentification par mot de passe
        if grep -q "^PasswordAuthentication no" /etc/ssh/sshd_config; then
            log_pass "Authentification par mot de passe désactivée"
            add_check_to_html "pass" "Authentification SSH" "Authentification par clés uniquement" ""
        else
            log_fail "Authentification par mot de passe activée"
            add_check_to_html "fail" "Authentification SSH" "Authentification par mot de passe autorisée" "Désactivez: PasswordAuthentication no"
        fi
        
        # Vérification de root login
        if grep -q "^PermitRootLogin no" /etc/ssh/sshd_config; then
            log_pass "Connexion root SSH désactivée"
            add_check_to_html "pass" "Root SSH" "Connexion root désactivée" ""
        else
            log_fail "Connexion root SSH autorisée"
            add_check_to_html "fail" "Root SSH" "Connexion root SSH autorisée" "Désactivez: PermitRootLogin no"
        fi
        
        # Vérification du protocole SSH
        if ! grep -q "^Protocol 1" /etc/ssh/sshd_config; then
            log_pass "Protocole SSH 2 uniquement"
            add_check_to_html "pass" "Protocole SSH" "Utilisation du protocole SSH 2" ""
        else
            log_fail "Protocole SSH 1 autorisé"
            add_check_to_html "fail" "Protocole SSH" "Protocole SSH 1 dangereux autorisé" "Utilisez uniquement SSH 2"
        fi
        
    else
        log_warn "Fichier de configuration SSH introuvable"
        add_check_to_html "warn" "Configuration SSH" "Fichier sshd_config non trouvé" ""
    fi
    
    add_to_html "</div></div>"
}

check_user_security() {
    echo -e "\n${PURPLE}=== SÉCURITÉ UTILISATEURS ===${NC}"
    add_to_html "<div class=\"section\"><div class=\"section-header\">👥 Sécurité des utilisateurs</div><div class=\"section-content\">"
    
    log_check "Vérification des comptes utilisateurs"
    
    # Comptes avec shell
    users_with_shell=$(grep -E "/bin/bash$|/bin/sh$" /etc/passwd | wc -l)
    log_info "Utilisateurs avec shell: $users_with_shell"
    
    # Utilisateurs sans mot de passe
    users_no_password=$(awk -F: '($2 == "" || $2 == "*") {print $1}' /etc/shadow 2>/dev/null | wc -l || echo "0")
    if [ "$users_no_password" -eq 0 ]; then
        log_pass "Tous les comptes ont un mot de passe"
        add_check_to_html "pass" "Mots de passe" "Tous les comptes utilisateur ont un mot de passe" ""
    else
        log_warn "Comptes sans mot de passe: $users_no_password"
        add_check_to_html "warn" "Mots de passe" "$users_no_password comptes sans mot de passe" "Vérifiez les comptes système"
    fi
    
    # Utilisateurs avec UID 0 (root privileges)
    root_users=$(awk -F: '$3 == 0 {print $1}' /etc/passwd)
    root_count=$(echo "$root_users" | wc -l)
    if [ "$root_count" -eq 1 ] && [ "$root_users" = "root" ]; then
        log_pass "Seul root a les privilèges UID 0"
        add_check_to_html "pass" "Privilèges root" "Seul le compte root a l'UID 0" ""
    else
        log_fail "Plusieurs comptes avec UID 0: $root_users"
        add_check_to_html "fail" "Privilèges root" "Plusieurs comptes avec privilèges root" "Vérifiez les comptes avec UID 0"
    fi
    
    # Vérification de sudo
    if [ -f /etc/sudoers ]; then
        sudo_users=$(grep -v "^#" /etc/sudoers | grep -E "(ALL|sudo)" | wc -l || echo "0")
        log_info "Règles sudo configurées: $sudo_users"
        add_check_to_html "info" "Configuration sudo" "$sudo_users règles sudo configurées" ""
    fi
    
    add_to_html "</div></div>"
}

check_file_permissions() {
    echo -e "\n${PURPLE}=== PERMISSIONS FICHIERS ===${NC}"
    add_to_html "<div class=\"section\"><div class=\"section-header\">📁 Permissions des fichiers système</div><div class=\"section-content\">"
    
    log_check "Vérification des permissions critiques"
    
    # Vérification /etc/passwd
    passwd_perms=$(stat -c %a /etc/passwd 2>/dev/null || echo "000")
    if [ "$passwd_perms" = "644" ]; then
        log_pass "/etc/passwd permissions correctes (644)"
        add_check_to_html "pass" "/etc/passwd" "Permissions correctes (644)" ""
    else
        log_warn "/etc/passwd permissions: $passwd_perms (devrait être 644)"
        add_check_to_html "warn" "/etc/passwd" "Permissions incorrectes: $passwd_perms" "Corrigez: chmod 644 /etc/passwd"
    fi
    
    # Vérification /etc/shadow
    if [ -f /etc/shadow ]; then
        shadow_perms=$(stat -c %a /etc/shadow 2>/dev/null || echo "000")
        if [ "$shadow_perms" = "640" ] || [ "$shadow_perms" = "600" ]; then
            log_pass "/etc/shadow permissions correctes ($shadow_perms)"
            add_check_to_html "pass" "/etc/shadow" "Permissions sécurisées ($shadow_perms)" ""
        else
            log_fail "/etc/shadow permissions dangereuses: $shadow_perms"
            add_check_to_html "fail" "/etc/shadow" "Permissions dangereuses: $shadow_perms" "Corrigez: chmod 640 /etc/shadow"
        fi
    fi
    
    # Recherche de fichiers world-writable
    world_writable=$(find /etc /usr /bin /sbin -type f -perm -002 2>/dev/null | wc -l || echo "0")
    if [ "$world_writable" -eq 0 ]; then
        log_pass "Aucun fichier système world-writable"
        add_check_to_html "pass" "Fichiers world-writable" "Aucun fichier système accessible en écriture par tous" ""
    else
        log_warn "Fichiers world-writable trouvés: $world_writable"
        add_check_to_html "warn" "Fichiers world-writable" "$world_writable fichiers système accessibles en écriture" "Vérifiez les permissions avec: find /etc -type f -perm -002"
    fi
    
    # Vérification des fichiers SUID
    suid_files=$(find /usr /bin /sbin -type f -perm -4000 2>/dev/null | wc -l || echo "0")
    log_info "Fichiers SUID trouvés: $suid_files"
    add_check_to_html "info" "Fichiers SUID" "$suid_files fichiers avec bit SUID" ""
    
    add_to_html "</div></div>"
}

check_network_security() {
    echo -e "\n${PURPLE}=== SÉCURITÉ RÉSEAU ===${NC}"
    add_to_html "<div class=\"section\"><div class=\"section-header\">🌐 Configuration réseau</div><div class=\"section-content\">"
    
    log_check "Vérification de la sécurité réseau"
    
    # Ports ouverts
    open_ports=$(netstat -tuln 2>/dev/null | grep LISTEN | wc -l || echo "0")
    log_info "Ports en écoute: $open_ports"
    
    # Services exposés
    if command -v netstat >/dev/null 2>&1; then
        external_services=$(netstat -tuln 2>/dev/null | grep "0.0.0.0" | wc -l || echo "0")
        if [ "$external_services" -le 3 ]; then
            log_pass "Nombre limité de services exposés ($external_services)"
            add_check_to_html "pass" "Services exposés" "$external_services services exposés publiquement" ""
        else
            log_warn "Nombreux services exposés ($external_services)"
            add_check_to_html "warn" "Services exposés" "$external_services services exposés publiquement" "Vérifiez la nécessité de chaque service"
        fi
    fi
    
    # Vérification IPv6
    if [ -f /proc/net/if_inet6 ]; then
        if grep -q "net.ipv6.conf.all.disable_ipv6 = 1" /etc/sysctl.conf 2>/dev/null; then
            log_info "IPv6 désactivé"
            add_check_to_html "info" "IPv6" "IPv6 explicitement désactivé" ""
        else
            log_warn "IPv6 activé (vérifiez la configuration)"
            add_check_to_html "warn" "IPv6" "IPv6 activé - vérifiez la configuration" "Désactivez si non utilisé"
        fi
    fi
    
    # Vérification des redirections ICMP
    if [ -f /proc/sys/net/ipv4/conf/all/accept_redirects ]; then
        icmp_redirects=$(cat /proc/sys/net/ipv4/conf/all/accept_redirects 2>/dev/null || echo "1")
        if [ "$icmp_redirects" = "0" ]; then
            log_pass "Redirections ICMP désactivées"
            add_check_to_html "pass" "Redirections ICMP" "Redirections ICMP désactivées" ""
        else
            log_warn "Redirections ICMP activées"
            add_check_to_html "warn" "Redirections ICMP" "Redirections ICMP activées" "Désactivez dans /etc/sysctl.conf"
        fi
    fi
    
    add_to_html "</div></div>"
}

check_services_security() {
    echo -e "\n${PURPLE}=== SERVICES SYSTÈME ===${NC}"
    add_to_html "<div class=\"section\"><div class=\"section-header\">⚙️ Services système</div><div class=\"section-content\">"
    
    log_check "Vérification des services"
    
    # Services actifs
    active_services=$(systemctl list-units --type=service --state=active --no-pager --no-legend | wc -l || echo "0")
    log_info "Services actifs: $active_services"
    
    # Services dangereux à vérifier
    dangerous_services=("telnet" "rsh" "rlogin" "ftp" "tftp")
    dangerous_found=0
    
    for service in "${dangerous_services[@]}"; do
        if systemctl is-active --quiet "$service" 2>/dev/null; then
            log_fail "Service dangereux actif: $service"
            add_check_to_html "fail" "Service dangereux" "$service est actif" "Désactivez: systemctl disable $service"
            ((dangerous_found++))
        fi
    done
    
    if [ "$dangerous_found" -eq 0 ]; then
        log_pass "Aucun service dangereux détecté"
        add_check_to_html "pass" "Services dangereux" "Aucun service non-sécurisé actif" ""
    fi
    
    # Vérification des services réseau communs
    if systemctl is-active --quiet apache2 2>/dev/null; then
        log_info "Apache2 détecté - vérifiez la configuration SSL"
        add_check_to_html "info" "Apache2" "Serveur web Apache détecté" "Vérifiez la configuration SSL/TLS"
    fi
    
    if systemctl is-active --quiet nginx 2>/dev/null; then
        log_info "Nginx détecté - vérifiez la configuration SSL"
        add_check_to_html "info" "Nginx" "Serveur web Nginx détecté" "Vérifiez la configuration SSL/TLS"
    fi
    
    if systemctl is-active --quiet postgresql 2>/dev/null; then
        log_info "PostgreSQL détecté - vérifiez la sécurité"
        add_check_to_html "info" "PostgreSQL" "Base de données PostgreSQL active" "Vérifiez pg_hba.conf et les permissions"
    fi
    
    add_to_html "</div></div>"
}

check_log_security() {
    echo -e "\n${PURPLE}=== JOURNALISATION ===${NC}"
    add_to_html "<div class=\"section\"><div class=\"section-header\">📋 Journalisation et audit</div><div class=\"section-content\">"
    
    log_check "Vérification des logs"
    
    # Vérification de rsyslog
    if systemctl is-active --quiet rsyslog 2>/dev/null; then
        log_pass "Service rsyslog actif"
        add_check_to_html "pass" "rsyslog" "Service de journalisation actif" ""
    else
        log_warn "Service rsyslog inactif"
        add_check_to_html "warn" "rsyslog" "Service de journalisation inactif" "Activez: systemctl enable rsyslog"
    fi
    
    # Vérification des logs d'authentification
    if [ -f /var/log/auth.log ]; then
        auth_log_size=$(stat -c%s /var/log/auth.log 2>/dev/null || echo "0")
        if [ "$auth_log_size" -gt 0 ]; then
            log_pass "Logs d'authentification présents"
            add_check_to_html "pass" "Logs d'auth" "Logs d'authentification fonctionnels" ""
            
            # Tentatives de connexion échouées récentes
            failed_logins=$(grep "Failed password" /var/log/auth.log 2>/dev/null | tail -100 | wc -l || echo "0")
            if [ "$failed_logins" -gt 20 ]; then
                log_warn "Nombreuses tentatives de connexion échouées: $failed_logins"
                add_check_to_html "warn" "Tentatives d'intrusion" "$failed_logins tentatives récentes" "Surveillez les tentatives de brute force"
            else
                log_pass "Peu de tentatives de connexion échouées: $failed_logins"
                add_check_to_html "pass" "Tentatives d'intrusion" "Niveau normal de tentatives échouées: $failed_logins" ""
            fi
        fi
    else
        log_warn "Logs d'authentification absents"
        add_check_to_html "warn" "Logs d'auth" "Fichier /var/log/auth.log absent" "Vérifiez la configuration rsyslog"
    fi
    
    # Vérification de logrotate
    if [ -f /etc/logrotate.conf ]; then
        log_pass "Configuration logrotate présente"
        add_check_to_html "pass" "Rotation des logs" "logrotate configuré" ""
    else
        log_warn "Configuration logrotate absente"
        add_check_to_html "warn" "Rotation des logs" "logrotate non configuré" "Installez et configurez logrotate"
    fi
    
    add_to_html "</div></div>"
}

check_security_tools() {
    echo -e "\n${PURPLE}=== OUTILS DE SÉCURITÉ ===${NC}"
    add_to_html "<div class=\"section\"><div class=\"section-header\">🛠️ Outils de sécurité installés</div><div class=\"section-content\">"
    
    log_check "Vérification des outils de sécurité"
    
    # fail2ban
    if command -v fail2ban-server >/dev/null 2>&1; then
        if systemctl is-active --quiet fail2ban 2>/dev/null; then
            log_pass "fail2ban installé et actif"
            add_check_to_html "pass" "fail2ban" "Protection contre brute force active" ""
        else
            log_warn "fail2ban installé mais inactif"
            add_check_to_html "warn" "fail2ban" "fail2ban installé mais pas actif" "Activez: systemctl enable fail2ban"
        fi
    else
        log_warn "fail2ban non installé"
        add_check_to_html "warn" "fail2ban" "Protection brute force non installée" "Installez: apt install fail2ban"
    fi
    
    # ClamAV
    if command -v clamscan >/dev/null 2>&1; then
        log_pass "ClamAV antivirus installé"
        add_check_to_html "pass" "ClamAV" "Antivirus ClamAV installé" ""
    else
        log_info "ClamAV non installé"
        add_check_to_html "info" "ClamAV" "Antivirus non installé" "Considérez l'installation de ClamAV"
    fi
    
    # rkhunter
    if command -v rkhunter >/dev/null 2>&1; then
        log_pass "rkhunter installé (détection rootkits)"
        add_check_to_html "pass" "rkhunter" "Détection de rootkits installée" ""
    else
        log_info "rkhunter non installé"
        add_check_to_html "info" "rkhunter" "Détection de rootkits non installée" "Installez: apt install rkhunter"
    fi
    
    # chkrootkit
    if command -v chkrootkit >/dev/null 2>&1; then
        log_pass "chkrootkit installé"
        add_check_to_html "pass" "chkrootkit" "Scanner de rootkits installé" ""
    else
        log_info "chkrootkit non installé"
        add_check_to_html "info" "chkrootkit" "Scanner de rootkits non installé" "Installez: apt install chkrootkit"
    fi
    
    # aide (Advanced Intrusion Detection Environment)
    if command -v aide >/dev/null 2>&1; then
        log_pass "AIDE installé (détection d'intrusion)"
        add_check_to_html "pass" "AIDE" "Système de détection d'intrusion installé" ""
    else
        log_info "AIDE non installé"
        add_check_to_html "info" "AIDE" "IDS non installé" "Installez: apt install aide"
    fi
    
    add_to_html "</div></div>"
}

check_kernel_security() {
    echo -e "\n${PURPLE}=== SÉCURITÉ DU NOYAU ===${NC}"
    add_to_html "<div class=\"section\"><div class=\"section-header\">🔧 Sécurité du noyau</div><div class=\"section-content\">"
    
    log_check "Vérification de la sécurité du noyau"
    
    # Version du noyau
    kernel_version=$(uname -r)
    log_info "Version du noyau: $kernel_version"
    add_check_to_html "info" "Version noyau" "Version actuelle: $kernel_version" ""
    
    # ASLR (Address Space Layout Randomization)
    if [ -f /proc/sys/kernel/randomize_va_space ]; then
        aslr_status=$(cat /proc/sys/kernel/randomize_va_space 2>/dev/null || echo "0")
        if [ "$aslr_status" = "2" ]; then
            log_pass "ASLR complètement activé"
            add_check_to_html "pass" "ASLR" "Randomisation complète de l'espace d'adressage" ""
        elif [ "$aslr_status" = "1" ]; then
            log_warn "ASLR partiellement activé"
            add_check_to_html "warn" "ASLR" "Randomisation partielle" "Activez complètement: echo 2 > /proc/sys/kernel/randomize_va_space"
        else
            log_fail "ASLR désactivé"
            add_check_to_html "fail" "ASLR" "Randomisation d'adresses désactivée" "Activez: echo 2 > /proc/sys/kernel/randomize_va_space"
        fi
    fi
    
    # Vérification des modules kernel
    if [ -f /proc/modules ]; then
        loaded_modules=$(wc -l < /proc/modules || echo "0")
        log_info "Modules kernel chargés: $loaded_modules"
        add_check_to_html "info" "Modules kernel" "$loaded_modules modules chargés" ""
    fi
    
    # Protection contre l'exécution de pile
    if [ -f /proc/cpuinfo ]; then
        if grep -q "nx" /proc/cpuinfo; then
            log_pass "Protection NX/DEP disponible"
            add_check_to_html "pass" "Protection NX" "Protection contre l'exécution de pile active" ""
        else
            log_warn "Protection NX/DEP non disponible"
            add_check_to_html "warn" "Protection NX" "Protection matérielle non disponible" "Vérifiez les paramètres BIOS"
        fi
    fi
    
    # Vérification des core dumps
    core_pattern=$(cat /proc/sys/kernel/core_pattern 2>/dev/null || echo "")
    if [[ "$core_pattern" == "|/bin/false" ]] || [[ -z "$core_pattern" ]]; then
        log_pass "Core dumps désactivés"
        add_check_to_html "pass" "Core dumps" "Vidages mémoire désactivés" ""
    else
        log_warn "Core dumps activés: $core_pattern"
        add_check_to_html "warn" "Core dumps" "Vidages mémoire activés" "Désactivez pour la sécurité"
    fi
    
    add_to_html "</div></div>"
}

check_file_integrity() {
    echo -e "\n${PURPLE}=== INTÉGRITÉ SYSTÈME ===${NC}"
    add_to_html "<div class=\"section\"><div class=\"section-header\">🔍 Intégrité des fichiers</div><div class=\"section-content\">"
    
    log_check "Vérification de l'intégrité système"
    
    # Vérification des binaires système critiques
    critical_binaries=("/bin/ls" "/bin/ps" "/usr/bin/who" "/usr/bin/w" "/bin/netstat")
    modified_binaries=0
    
    for binary in "${critical_binaries[@]}"; do
        if [ -f "$binary" ]; then
            # Vérification de la date de modification récente (moins de 30 jours)
            if [ "$(find "$binary" -mtime -30 2>/dev/null | wc -l)" -gt 0 ]; then
                log_warn "Binaire modifié récemment: $binary"
                ((modified_binaries++))
            fi
        fi
    done
    
    if [ "$modified_binaries" -eq 0 ]; then
        log_pass "Binaires système non modifiés récemment"
        add_check_to_html "pass" "Binaires système" "Aucune modification récente suspecte" ""
    else
        log_warn "Binaires modifiés: $modified_binaries"
        add_check_to_html "warn" "Binaires système" "$modified_binaries binaires modifiés récemment" "Vérifiez les modifications avec AIDE ou rkhunter"
    fi
    
    # Recherche de fichiers suspects
    suspicious_files=0
    
    # Fichiers cachés dans /tmp
    hidden_tmp=$(find /tmp -name ".*" -type f 2>/dev/null | wc -l || echo "0")
    if [ "$hidden_tmp" -gt 0 ]; then
        log_warn "Fichiers cachés dans /tmp: $hidden_tmp"
        ((suspicious_files++))
    fi
    
    # Fichiers avec des noms suspects
    suspicious_names=$(find /tmp /var/tmp -type f \( -name "*backdoor*" -o -name "*rootkit*" -o -name ".*sh" \) 2>/dev/null | wc -l || echo "0")
    if [ "$suspicious_names" -gt 0 ]; then
        log_fail "Fichiers suspects trouvés: $suspicious_names"
        ((suspicious_files++))
    fi
    
    if [ "$suspicious_files" -eq 0 ]; then
        log_pass "Aucun fichier suspect détecté"
        add_check_to_html "pass" "Fichiers suspects" "Aucun fichier suspect trouvé" ""
    else
        log_fail "Fichiers suspects détectés"
        add_check_to_html "fail" "Fichiers suspects" "Fichiers potentiellement dangereux trouvés" "Analysez avec: find /tmp -name '.*' -type f"
    fi
    
    add_to_html "</div></div>"
}

check_process_security() {
    echo -e "\n${PURPLE}=== PROCESSUS EN COURS ===${NC}"
    add_to_html "<div class=\"section\"><div class=\"section-header\">⚡ Analyse des processus</div><div class=\"section-content\">"
    
    log_check "Vérification des processus"
    
    # Processus exécutés en tant que root
    root_processes=$(ps -eo user,pid,cmd | grep "^root" | wc -l || echo "0")
    log_info "Processus root: $root_processes"
    add_check_to_html "info" "Processus root" "$root_processes processus exécutés en tant que root" ""
    
    # Processus avec des noms suspects
    suspicious_processes=$(ps aux | grep -E "(nc|netcat|ncat|socat|cryptcat)" | grep -v grep | wc -l || echo "0")
    if [ "$suspicious_processes" -gt 0 ]; then
        log_warn "Processus réseau suspects: $suspicious_processes"
        add_check_to_html "warn" "Processus suspects" "$suspicious_processes processus réseau suspects détectés" "Vérifiez: ps aux | grep -E 'nc|netcat|ncat|socat'"
    else
        log_pass "Aucun processus réseau suspect"
        add_check_to_html "pass" "Processus suspects" "Aucun processus suspect détecté" ""
    fi
    
    # Charge système
    load_average=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    load_numeric=$(echo "$load_average" | cut -d. -f1)
    cpu_count=$(nproc)
    
    if [ "$load_numeric" -le "$cpu_count" ]; then
        log_pass "Charge système normale: $load_average"
        add_check_to_html "pass" "Charge système" "Charge normale: $load_average" ""
    else
        log_warn "Charge système élevée: $load_average"
        add_check_to_html "warn" "Charge système" "Charge élevée: $load_average" "Vérifiez les processus consommateurs"
    fi
    
    add_to_html "</div></div>"
}

check_disk_security() {
    echo -e "\n${PURPLE}=== SÉCURITÉ DISQUE ===${NC}"
    add_to_html "<div class=\"section\"><div class=\"section-header\">💾 Sécurité des disques</div><div class=\"section-content\">"
    
    log_check "Vérification de la sécurité des disques"
    
    # Espace disque
    disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$disk_usage" -lt 80 ]; then
        log_pass "Espace disque suffisant (${disk_usage}% utilisé)"
        add_check_to_html "pass" "Espace disque" "${disk_usage}% d'utilisation" ""
    elif [ "$disk_usage" -lt 90 ]; then
        log_warn "Espace disque limité (${disk_usage}% utilisé)"
        add_check_to_html "warn" "Espace disque" "${disk_usage}% d'utilisation" "Libérez de l'espace"
    else
        log_fail "Espace disque critique (${disk_usage}% utilisé)"
        add_check_to_html "fail" "Espace disque" "${disk_usage}% d'utilisation critique" "Libérez immédiatement de l'espace"
    fi
    
    # Montages avec options de sécurité
    secure_mounts=0
    if mount | grep -q "noexec"; then
        log_pass "Montages avec option noexec détectés"
        ((secure_mounts++))
    fi
    
    if mount | grep -q "nosuid"; then
        log_pass "Montages avec option nosuid détectés"
        ((secure_mounts++))
    fi
    
    if [ "$secure_mounts" -gt 0 ]; then
        add_check_to_html "pass" "Options de montage" "$secure_mounts montages sécurisés" ""
    else
        add_check_to_html "warn" "Options de montage" "Aucune option de sécurité détectée" "Utilisez noexec,nosuid pour /tmp"
    fi
    
    # Vérification du chiffrement
    if command -v cryptsetup >/dev/null 2>&1; then
        encrypted_devices=$(cryptsetup status $(ls /dev/mapper/ 2>/dev/null) 2>/dev/null | grep -c "is active" || echo "0")
        if [ "$encrypted_devices" -gt 0 ]; then
            log_pass "Chiffrement détecté ($encrypted_devices volumes)"
            add_check_to_html "pass" "Chiffrement" "$encrypted_devices volumes chiffrés" ""
        else
            log_info "Aucun chiffrement détecté"
            add_check_to_html "info" "Chiffrement" "Aucun volume chiffré" "Considérez le chiffrement pour les données sensibles"
        fi
    fi
    
    add_to_html "</div></div>"
}

generate_security_score() {
    echo -e "\n${PURPLE}=== CALCUL DU SCORE DE SÉCURITÉ ===${NC}"
    
    if [ "$TOTAL_CHECKS" -eq 0 ]; then
        SECURITY_SCORE=0
    else
        SECURITY_SCORE=$(( (PASSED_CHECKS * 100) / TOTAL_CHECKS ))
    fi
    
    # Pénalités pour les problèmes critiques
    PENALTY=$(( CRITICAL_ISSUES * 5 ))
    SECURITY_SCORE=$(( SECURITY_SCORE - PENALTY ))
    
    # S'assurer que le score ne soit pas négatif
    if [ "$SECURITY_SCORE" -lt 0 ]; then
        SECURITY_SCORE=0
    fi
    
    # Détermination du niveau de sécurité
    if [ "$SECURITY_SCORE" -ge 80 ]; then
        SECURITY_LEVEL="EXCELLENT"
        SCORE_COLOR="good"
        EMOJI="🟢"
    elif [ "$SECURITY_SCORE" -ge 60 ]; then
        SECURITY_LEVEL="BON"
        SCORE_COLOR="warning"
        EMOJI="🟡"
    elif [ "$SECURITY_SCORE" -ge 40 ]; then
        SECURITY_LEVEL="MOYEN"
        SCORE_COLOR="warning"
        EMOJI="🟠"
    else
        SECURITY_LEVEL="CRITIQUE"
        SCORE_COLOR="critical"
        EMOJI="🔴"
    fi
    
    echo -e "${BLUE}Score de sécurité: ${SECURITY_SCORE}/100 - ${SECURITY_LEVEL} ${EMOJI}${NC}"
}

generate_recommendations() {
    echo -e "\n${PURPLE}=== RECOMMANDATIONS ===${NC}"
    add_to_html "<div class=\"section\"><div class=\"section-header\">💡 Recommandations prioritaires</div><div class=\"section-content\">"
    
    if [ "$CRITICAL_ISSUES" -gt 0 ]; then
        echo -e "${RED}🚨 ACTIONS URGENTES REQUISES:${NC}"
        add_to_html "<div class=\"recommendation\"><strong>🚨 Actions urgentes ($CRITICAL_ISSUES problèmes critiques)</strong><br>"
        
        if grep -q "FAIL.*SSH" "$LOG_FILE"; then
            echo "• Sécurisez la configuration SSH immédiatement"
            add_to_html "• Sécurisez la configuration SSH immédiatement<br>"
        fi
        
        if grep -q "FAIL.*root" "$LOG_FILE"; then
            echo "• Désactivez l'accès root SSH"
            add_to_html "• Désactivez l'accès root SSH<br>"
        fi
        
        if grep -q "FAIL.*password" "$LOG_FILE"; then
            echo "• Désactivez l'authentification par mot de passe SSH"
            add_to_html "• Désactivez l'authentification par mot de passe SSH<br>"
        fi
        
        add_to_html "</div>"
    fi
    
    if [ "$WARNINGS" -gt 0 ]; then
        echo -e "\n${YELLOW}⚠️ AMÉLIORATIONS RECOMMANDÉES:${NC}"
        add_to_html "<div class=\"recommendation\"><strong>⚠️ Améliorations recommandées ($WARNINGS avertissements)</strong><br>"
        
        echo "• Installez et configurez fail2ban"
        echo "• Configurez un pare-feu restrictif"
        echo "• Mettez en place une rotation des logs"
        echo "• Installez des outils de détection d'intrusion"
        echo "• Configurez le chiffrement des données sensibles"
        
        add_to_html "• Installez et configurez fail2ban<br>"
        add_to_html "• Configurez un pare-feu restrictif<br>"
        add_to_html "• Mettez en place une rotation des logs<br>"
        add_to_html "• Installez des outils de détection d'intrusion<br>"
        add_to_html "• Configurez le chiffrement des données sensibles<br>"
        add_to_html "</div>"
    fi
    
    echo -e "\n${GREEN}✅ BONNES PRATIQUES GÉNÉRALES:${NC}"
    add_to_html "<div class=\"recommendation\"><strong>✅ Bonnes pratiques de sécurité</strong><br>"
    
    echo "• Effectuez des audits de sécurité réguliers"
    echo "• Maintenez le système à jour"
    echo "• Surveillez les logs régulièrement"
    echo "• Sauvegardez les données critiques"
    echo "• Utilisez des mots de passe forts et uniques"
    echo "• Formez les utilisateurs à la sécurité"
    
    add_to_html "• Effectuez des audits de sécurité réguliers<br>"
    add_to_html "• Maintenez le système à jour<br>"
    add_to_html "• Surveillez les logs régulièrement<br>"
    add_to_html "• Sauvegardez les données critiques<br>"
    add_to_html "• Utilisez des mots de passe forts et uniques<br>"
    add_to_html "• Formez les utilisateurs à la sécurité<br>"
    add_to_html "</div>"
    
    add_to_html "</div></div>"
}

finalize_html_report() {
    # Ajout du score et des statistiques
    cat >> "$REPORT_FILE" << EOF
        <div class="score $SCORE_COLOR">
            <h2>$EMOJI Score de Sécurité: $SECURITY_SCORE/100</h2>
            <h3>Niveau: $SECURITY_LEVEL</h3>
        </div>
        
        <div class="summary-stats">
            <div class="stat-card">
                <div class="stat-number">$TOTAL_CHECKS</div>
                <div>Vérifications</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">$PASSED_CHECKS</div>
                <div>Réussies</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">$WARNINGS</div>
                <div>Avertissements</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">$CRITICAL_ISSUES</div>
                <div>Critiques</div>
            </div>
        </div>
        
        <div class="section">
            <div class="section-header">📊 Détails des vérifications</div>
            <div class="section-content">
                <table>
                    <tr>
                        <th>Métrique</th>
                        <th>Valeur</th>
                        <th>Statut</th>
                    </tr>
                    <tr>
                        <td>Vérifications totales</td>
                        <td>$TOTAL_CHECKS</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>Tests réussis</td>
                        <td>$PASSED_CHECKS</td>
                        <td style="color: green;">✅</td>
                    </tr>
                    <tr>
                        <td>Avertissements</td>
                        <td>$WARNINGS</td>
                        <td style="color: orange;">⚠️</td>
                    </tr>
                    <tr>
                        <td>Problèmes critiques</td>
                        <td>$CRITICAL_ISSUES</td>
                        <td style="color: red;">❌</td>
                    </tr>
                    <tr>
                        <td><strong>Score final</strong></td>
                        <td><strong>$SECURITY_SCORE/100</strong></td>
                        <td><strong>$SECURITY_LEVEL</strong></td>
                    </tr>
                </table>
            </div>
        </div>
        
        <div class="section">
            <div class="section-header">🔗 Ressources utiles</div>
            <div class="section-content">
                <p><strong>Documentation Debian Security:</strong> https://www.debian.org/security/</p>
                <p><strong>Guides de sécurisation:</strong> https://wiki.debian.org/SystemSecurity</p>
                <p><strong>CIS Benchmarks:</strong> https://www.cisecurity.org/benchmarks/</p>
                <p><strong>OWASP Server Security:</strong> https://owasp.org/www-project-web-security-testing-guide/</p>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <p><strong>Rapport généré le:</strong> $DATE</p>
            <p><strong>Serveur:</strong> $HOSTNAME</p>
            <p><small>Audit de sécurité automatique - Vérifiez régulièrement la sécurité de votre serveur</small></p>
        </div>
    </div>
</body>
</html>
EOF
}

# Fonction principale d'audit
main_audit() {
    # Nettoyage des fichiers temporaires
    rm -f "$LOG_FILE"
    touch "$LOG_FILE"
    
    print_header
    init_html_report
    
    # Exécution de tous les checks
    check_system_updates
    check_firewall
    check_ssh_security
    check_user_security
    check_file_permissions
    check_network_security
    check_services_security
    check_log_security
    check_security_tools
    check_kernel_security
    check_file_integrity
    check_process_security
    check_disk_security
    
    # Génération du score et des recommandations
    generate_security_score
    generate_recommendations
    
    # Finalisation du rapport HTML
    finalize_html_report
    
    # Résumé final
    echo -e "\n${BLUE}============================================${NC}"
    echo -e "${BLUE}         RÉSUMÉ DE L'AUDIT${NC}"
    echo -e "${BLUE}============================================${NC}"
    echo -e "Vérifications effectuées: ${TOTAL_CHECKS}"
    echo -e "Tests réussis: ${GREEN}${PASSED_CHECKS}${NC}"
    echo -e "Avertissements: ${YELLOW}${WARNINGS}${NC}"
    echo -e "Problèmes critiques: ${RED}${CRITICAL_ISSUES}${NC}"
    echo -e "\nScore de sécurité: ${SECURITY_SCORE}/100 - ${SECURITY_LEVEL} ${EMOJI}"
    echo -e "\n${GREEN}Rapport HTML généré:${NC} ${REPORT_FILE}"
    echo -e "${GREEN}Log détaillé:${NC} ${LOG_FILE}"
    
    if [ "$CRITICAL_ISSUES" -gt 0 ]; then
        echo -e "\n${RED}⚠️ ATTENTION: Des problèmes critiques de sécurité ont été détectés!${NC}"
        echo -e "${RED}Consultez le rapport pour les actions correctives.${NC}"
    fi
    
    echo -e "\n${BLUE}Pour visualiser le rapport:${NC}"
    echo -e "• Ouvrez ${REPORT_FILE} dans un navigateur web"
    echo -e "• Ou utilisez: xdg-open ${REPORT_FILE}"
    
    # Permissions sur les fichiers générés
    chmod 600 "$REPORT_FILE" "$LOG_FILE"
}

# Vérification des permissions
if [[ $EUID -ne 0 ]]; then
    echo -e "${RED}Ce script doit être exécuté en tant que root pour un audit complet${NC}"
    echo "Utilisation: sudo $0"
    exit 1
fi

# Exécution de l'audit principal
main_audit

echo -e "\n${GREEN}Audit de sécurité terminé avec succès!${NC}"