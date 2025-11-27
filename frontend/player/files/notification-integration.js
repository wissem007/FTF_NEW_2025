/* ==================================================
   SYSTÈME DE NOTIFICATIONS TOAST
   À intégrer dans votre application
   ================================================== */

/* ========== CSS - À ajouter dans votre fichier CSS ========== */

/* Container pour les notifications */
.toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 400px;
}

/* Style de base pour les toasts */
.toast {
    background: white;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 300px;
    animation: slideIn 0.3s ease-out;
    position: relative;
    overflow: hidden;
}

.toast::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
}

.toast.success::before {
    background: #4CAF50;
}

.toast.error::before {
    background: #f44336;
}

.toast.warning::before {
    background: #ff9800;
}

.toast.info::before {
    background: #2196F3;
}

.toast-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-weight: bold;
    color: white;
    font-size: 14px;
}

.toast.success .toast-icon {
    background: #4CAF50;
}

.toast.error .toast-icon {
    background: #f44336;
}

.toast.warning .toast-icon {
    background: #ff9800;
}

.toast.info .toast-icon {
    background: #2196F3;
}

.toast-content {
    flex: 1;
}

.toast-title {
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
    font-size: 14px;
}

.toast-message {
    color: #666;
    font-size: 13px;
    line-height: 1.4;
}

.toast-close {
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    font-size: 20px;
    line-height: 1;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: color 0.2s;
}

.toast-close:hover {
    color: #333;
}

@keyframes slideIn {
    from {
        transform: translateX(400px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOut {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(400px);
        opacity: 0;
    }
}

.toast.removing {
    animation: slideOut 0.3s ease-in forwards;
}


/* ========== HTML - À ajouter dans votre page (avant </body>) ========== */

<!-- 
<div class="toast-container" id="toastContainer"></div>
-->


/* ========== JAVASCRIPT - À ajouter dans votre fichier JS ========== */

/**
 * Affiche une notification toast
 * @param {string} type - Type de notification : 'success', 'error', 'warning', 'info'
 * @param {string} title - Titre de la notification
 * @param {string} message - Message de la notification
 * @param {number} duration - Durée d'affichage en millisecondes (défaut : 4000)
 */
function showToast(type, title, message, duration = 4000) {
    // Récupérer ou créer le container
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    // Créer l'élément toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Définir les icônes selon le type
    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">${icons[type]}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="removeToast(this)">×</button>
    `;
    
    // Ajouter au container
    container.appendChild(toast);
    
    // Retirer automatiquement après la durée spécifiée
    setTimeout(() => {
        removeToast(toast.querySelector('.toast-close'));
    }, duration);
}

/**
 * Retire un toast
 * @param {HTMLElement} button - Le bouton de fermeture du toast
 */
function removeToast(button) {
    const toast = button.closest('.toast');
    if (toast) {
        toast.classList.add('removing');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }
}


/* ========== EXEMPLES D'UTILISATION ========== */

// Notification de succès
showToast('success', 'Succès !', 'Nouvelle demande créée avec succès !');

// Notification d'erreur
showToast('error', 'Erreur', 'Une erreur est survenue lors de la création.');

// Notification d'avertissement
showToast('warning', 'Attention', 'Veuillez vérifier les informations saisies.');

// Notification d'information
showToast('info', 'Information', 'Les données ont été mises à jour.');

// Avec une durée personnalisée (6 secondes)
showToast('success', 'Succès !', 'Opération terminée avec succès !', 6000);


/* ========== INTÉGRATION AVEC VOTRE CODE ACTUEL ========== */

// REMPLACER CECI :
// alert('Nouvelle demande créée avec succès !');

// PAR CECI :
showToast('success', 'Succès !', 'Nouvelle demande créée avec succès !');


// Si vous utilisez une réponse AJAX, par exemple :
/*
fetch('/api/demande', {
    method: 'POST',
    body: JSON.stringify(data)
})
.then(response => response.json())
.then(result => {
    if (result.success) {
        // Au lieu de alert()
        showToast('success', 'Succès !', 'Nouvelle demande créée avec succès !');
    } else {
        showToast('error', 'Erreur', result.message || 'Une erreur est survenue.');
    }
})
.catch(error => {
    showToast('error', 'Erreur', 'Impossible de traiter la demande.');
});
*/
