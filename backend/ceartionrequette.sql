-- Créer la séquence
CREATE SEQUENCE IF NOT EXISTS sss_competition_db.ct_status_history_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Créer la table d'historique
CREATE TABLE IF NOT EXISTS sss_competition_db.ct_status_history (
    ct_status_history_id NUMERIC PRIMARY KEY DEFAULT nextval('sss_competition_db.ct_status_history_seq'),
    ct_demande_id NUMERIC NOT NULL,
    old_status_id NUMERIC,
    new_status_id NUMERIC NOT NULL,
    changed_by BIGINT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comment VARCHAR(500),
    ip_address VARCHAR(45),
    
    CONSTRAINT fk_status_history_demande 
        FOREIGN KEY (ct_demande_id) 
        REFERENCES sss_competition_db.ct_demandes(ct_demande_id)
);

-- Index pour optimiser les recherches
CREATE INDEX idx_status_history_demande ON sss_competition_db.ct_status_history(ct_demande_id);
CREATE INDEX idx_status_history_date ON sss_competition_db.ct_status_history(changed_at DESC);

---------------------------------------Créer la table NotificationHistory en base de données sss_competition_db---------------------------------------
-- Créer la séquence
CREATE SEQUENCE IF NOT EXISTS sss_competition_db.ct_notification_history_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Créer la table
CREATE TABLE IF NOT EXISTS sss_competition_db.ct_notification_history (
    notification_id NUMERIC PRIMARY KEY DEFAULT nextval('sss_competition_db.ct_notification_history_seq'),
    ct_demande_id NUMERIC NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    notification_type VARCHAR(50),
    subject VARCHAR(255),
    message TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PENDING',
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    CONSTRAINT fk_notification_demande 
        FOREIGN KEY (ct_demande_id) 
        REFERENCES sss_competition_db.ct_demandes(ct_demande_id)
);

-- Index
CREATE INDEX idx_notification_demande ON sss_competition_db.ct_notification_history(ct_demande_id);
CREATE INDEX idx_notification_status ON sss_competition_db.ct_notification_history(status);
CREATE INDEX idx_notification_date ON sss_competition_db.ct_notification_history(sent_at DESC);

-- Ajouter la colonne email à la table
ALTER TABLE sss_competition_db.ct_demandes 
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Créer un index pour les recherches par email
CREATE INDEX IF NOT EXISTS idx_demandes_email 
ON sss_competition_db.ct_demandes(email);

-- (Optionnel) Mettre à jour les demandes existantes avec un email de test
-- UPDATE sss_competition_db.ct_demandes 
-- SET email = 'joueur.test@example.com' 
-- WHERE email IS NULL;

-- ========== INDEX POUR OPTIMISATION ==========

-- Index pour ct_demandes
CREATE INDEX IF NOT EXISTS idx_demande_team_season 
ON sss_competition_db.ct_demandes(team_id, season_id);

CREATE INDEX IF NOT EXISTS idx_demande_status 
ON sss_competition_db.ct_demandes(demande_status_id);

CREATE INDEX IF NOT EXISTS idx_demande_date 
ON sss_competition_db.ct_demandes(date_enregistrement);

CREATE INDEX IF NOT EXISTS idx_demande_team_season_status 
ON sss_competition_db.ct_demandes(team_id, season_id, demande_status_id);

-- Index pour ct_team_intervenants (joueurs/staff)
CREATE INDEX IF NOT EXISTS idx_intervenant_team_season 
ON sss_competition_db.ct_team_intervenants(team_id, season_id);

CREATE INDEX IF NOT EXISTS idx_intervenant_type 
ON sss_competition_db.ct_team_intervenants(intervenant_type_id);

CREATE INDEX IF NOT EXISTS idx_intervenant_category 
ON sss_competition_db.ct_team_intervenants(player_category_id);

-- Index pour ct_demande_piece_jointes
CREATE INDEX IF NOT EXISTS idx_piece_jointe_demande 
ON sss_competition_db.ct_demande_piece_jointes(ct_demande_id);

CREATE INDEX IF NOT EXISTS idx_piece_jointe_type 
ON sss_competition_db.ct_demande_piece_jointes(ct_modele_file_demande_id);

-- Index pour ct_status_history
CREATE INDEX IF NOT EXISTS idx_status_history_demande 
ON sss_competition_db.ct_status_history(ct_demande_id);

CREATE INDEX IF NOT EXISTS idx_status_history_date 
ON sss_competition_db.ct_status_history(changed_at);

-- Index pour ct_notification_history
CREATE INDEX IF NOT EXISTS idx_notification_demande 
ON sss_competition_db.ct_notification_history(ct_demande_id);

CREATE INDEX IF NOT EXISTS idx_notification_date 
ON sss_competition_db.ct_notification_history(sent_at);

CREATE INDEX IF NOT EXISTS idx_notification_status 
ON sss_competition_db.ct_notification_history(status);

-- Index pour ct_teams (recherche rapide)
CREATE INDEX IF NOT EXISTS idx_team_name 
ON sss_competition_db.ct_teams(name);

-- Index pour ct_seasons
CREATE INDEX IF NOT EXISTS idx_season_year 
ON sss_competition_db.ct_seasons(season_id);


-- ========== INDEX MANQUANTS POUR OPTIMISATION ==========

-- 1. Index composite team + season (TRÈS IMPORTANT pour les stats par club)
CREATE INDEX IF NOT EXISTS idx_demande_team_season 
ON sss_competition_db.ct_demandes(ct_team_id, ct_season_id);

-- 2. Index sur le statut (pour filtrer les demandes validées/rejetées)
CREATE INDEX IF NOT EXISTS idx_demande_status 
ON sss_competition_db.ct_demandes(demande_status_id);

-- 3. Index sur la date d'enregistrement (pour les stats "ce mois-ci")
CREATE INDEX IF NOT EXISTS idx_demande_date_enregistrement 
ON sss_competition_db.ct_demandes(date_enregistrement DESC);

-- 4. Index composite team + season + status (statistiques optimales)
CREATE INDEX IF NOT EXISTS idx_demande_team_season_status 
ON sss_competition_db.ct_demandes(ct_team_id, ct_season_id, demande_status_id);

-- 5. Index sur la catégorie de joueur (pour stats par catégorie)
CREATE INDEX IF NOT EXISTS idx_demande_category 
ON sss_competition_db.ct_demandes(player_category_id);

-- 6. Index sur intervenant_type_id pour ct_team_intervenants
CREATE INDEX IF NOT EXISTS idx_intervenant_type 
ON sss_competition_db.ct_team_intervenants(intervenant_type_id);

-- 7. Index composite team + season pour intervenants
CREATE INDEX IF NOT EXISTS idx_team_intervenant_team_season 
ON sss_competition_db.ct_team_intervenants(ct_team_id, ct_season_id);

-- 8. Index pour les pièces jointes par demande (déjà créé mais vérifions)
CREATE INDEX IF NOT EXISTS idx_piece_jointe_demande 
ON sss_competition_db.ct_demande_piece_jointes(ct_demande_id);

-- Analyser les tables après création des index
ANALYZE sss_competition_db.ct_demandes;
ANALYZE sss_competition_db.ct_team_intervenants;
ANALYZE sss_competition_db.ct_demande_piece_jointes;

-- Afficher le résultat
SELECT 'Index créés avec succès ! 🚀' as message;

-- Supprimer l'ancien index s'il existe
DROP INDEX IF EXISTS sss_competition_db.idx_demande_team_season;

-- Créer l'index composite
CREATE INDEX idx_demande_team_season 
ON sss_competition_db.ct_demandes(ct_team_id, ct_season_id);

-- CRITIQUE : Mettre à jour les statistiques
ANALYZE sss_competition_db.ct_demandes;

-- Vérifier que l'index est créé
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE schemaname = 'sss_competition_db' 
  AND tablename = 'ct_demandes'
  AND indexname = 'idx_demande_team_season';

  -- Index BRIN (Block Range Index) - très efficace pour grandes tables
CREATE INDEX idx_demande_team_season_brin
ON sss_competition_db.ct_demandes 
USING BRIN (ct_team_id, ct_season_id);

-- Analyser
ANALYZE sss_competition_db.ct_demandes;

-- Réduire le coût des index (favorise l'utilisation)
ALTER TABLE sss_competition_db.ct_demandes 
SET (random_page_cost = 1.1);

-- Augmenter le coût du scan séquentiel
ALTER TABLE sss_competition_db.ct_demandes 
SET (seq_page_cost = 2.0);