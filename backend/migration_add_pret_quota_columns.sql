-- ========================================
-- MIGRATION: Ajout des colonnes QUOTA PRÊT
-- ========================================
-- Cette migration ajoute les colonnes nécessaires pour gérer
-- les quotas de PRÊT dans la table ct_param_category

-- ========================================
-- ÉTAPE 1: Ajouter les colonnes pour PRÊT PROFESSIONNEL
-- ========================================

-- Colonne: Obligation quota PRÊT PRO
ALTER TABLE ct_param_category
ADD COLUMN IF NOT EXISTS is_oblig_nbr_pret BOOLEAN DEFAULT false;

-- Colonne: Nombre maximum PRÊT PRO
ALTER TABLE ct_param_category
ADD COLUMN IF NOT EXISTS nbr_max_pret INTEGER DEFAULT NULL;

COMMENT ON COLUMN ct_param_category.is_oblig_nbr_pret IS 'Indique si le quota de PRÊT PROFESSIONNEL est obligatoire';
COMMENT ON COLUMN ct_param_category.nbr_max_pret IS 'Nombre maximum de demandes PRÊT PROFESSIONNEL (PRO/SEMI-PRO/STAGIAIRE) autorisées';

-- ========================================
-- ÉTAPE 2: Ajouter les colonnes pour PRÊT AMATEUR LIGUE I
-- ========================================

-- Colonne: Obligation quota PRÊT AMATEUR L1
ALTER TABLE ct_param_category
ADD COLUMN IF NOT EXISTS is_oblig_nbr_pret_am_lig1 BOOLEAN DEFAULT false;

-- Colonne: Nombre maximum PRÊT AMATEUR L1
ALTER TABLE ct_param_category
ADD COLUMN IF NOT EXISTS nbr_max_pret_am_lig1 INTEGER DEFAULT NULL;

COMMENT ON COLUMN ct_param_category.is_oblig_nbr_pret_am_lig1 IS 'Indique si le quota de PRÊT AMATEUR LIGUE I est obligatoire';
COMMENT ON COLUMN ct_param_category.nbr_max_pret_am_lig1 IS 'Nombre maximum de demandes PRÊT AMATEUR en LIGUE I autorisées';

-- ========================================
-- ÉTAPE 3: Ajouter les colonnes pour PRÊT AMATEUR LIGUE II
-- ========================================

-- Colonne: Obligation quota PRÊT AMATEUR L2
ALTER TABLE ct_param_category
ADD COLUMN IF NOT EXISTS is_oblig_nbr_pret_am_lig2 BOOLEAN DEFAULT false;

-- Colonne: Nombre maximum PRÊT AMATEUR L2
ALTER TABLE ct_param_category
ADD COLUMN IF NOT EXISTS nbr_max_pret_am_lig2 INTEGER DEFAULT NULL;

COMMENT ON COLUMN ct_param_category.is_oblig_nbr_pret_am_lig2 IS 'Indique si le quota de PRÊT AMATEUR LIGUE II est obligatoire';
COMMENT ON COLUMN ct_param_category.nbr_max_pret_am_lig2 IS 'Nombre maximum de demandes PRÊT AMATEUR en LIGUE II autorisées';

-- ========================================
-- ÉTAPE 4: Ajouter les colonnes pour PRÊT AMATEUR LIGUE III
-- ========================================

-- Colonne: Obligation quota PRÊT AMATEUR L3
ALTER TABLE ct_param_category
ADD COLUMN IF NOT EXISTS is_oblig_nbr_pret_am_lig3 BOOLEAN DEFAULT false;

-- Colonne: Nombre maximum PRÊT AMATEUR L3
ALTER TABLE ct_param_category
ADD COLUMN IF NOT EXISTS nbr_max_pret_am_lig3 INTEGER DEFAULT NULL;

COMMENT ON COLUMN ct_param_category.is_oblig_nbr_pret_am_lig3 IS 'Indique si le quota de PRÊT AMATEUR LIGUE III est obligatoire';
COMMENT ON COLUMN ct_param_category.nbr_max_pret_am_lig3 IS 'Nombre maximum de demandes PRÊT AMATEUR en LIGUE III autorisées';

-- ========================================
-- ÉTAPE 5: Configuration initiale des quotas (Exemple)
-- ========================================
-- Ces valeurs sont des EXEMPLES. Ajustez selon vos besoins réels.

-- Senior (catégorie 7) - Exemple de configuration
UPDATE ct_param_category
SET
    is_oblig_nbr_pret = true,
    nbr_max_pret = 3,                    -- Max 3 PRÊT PRO
    is_oblig_nbr_pret_am_lig1 = true,
    nbr_max_pret_am_lig1 = 2,           -- Max 2 PRÊT AMATEUR L1
    is_oblig_nbr_pret_am_lig2 = true,
    nbr_max_pret_am_lig2 = 2,           -- Max 2 PRÊT AMATEUR L2
    is_oblig_nbr_pret_am_lig3 = true,
    nbr_max_pret_am_lig3 = 2            -- Max 2 PRÊT AMATEUR L3
WHERE ct_player_category_id = 7;

-- U19 (catégorie 6) - Exemple de configuration
UPDATE ct_param_category
SET
    is_oblig_nbr_pret = true,
    nbr_max_pret = 2,
    is_oblig_nbr_pret_am_lig1 = true,
    nbr_max_pret_am_lig1 = 1,
    is_oblig_nbr_pret_am_lig2 = true,
    nbr_max_pret_am_lig2 = 1,
    is_oblig_nbr_pret_am_lig3 = true,
    nbr_max_pret_am_lig3 = 1
WHERE ct_player_category_id = 6;

-- U17 (catégorie 5) - Exemple de configuration
UPDATE ct_param_category
SET
    is_oblig_nbr_pret = true,
    nbr_max_pret = 2,
    is_oblig_nbr_pret_am_lig1 = true,
    nbr_max_pret_am_lig1 = 1,
    is_oblig_nbr_pret_am_lig2 = true,
    nbr_max_pret_am_lig2 = 1,
    is_oblig_nbr_pret_am_lig3 = true,
    nbr_max_pret_am_lig3 = 1
WHERE ct_player_category_id = 5;

-- U15 (catégorie 4) - Exemple de configuration
UPDATE ct_param_category
SET
    is_oblig_nbr_pret = true,
    nbr_max_pret = 1,
    is_oblig_nbr_pret_am_lig1 = false,
    nbr_max_pret_am_lig1 = NULL,
    is_oblig_nbr_pret_am_lig2 = false,
    nbr_max_pret_am_lig2 = NULL,
    is_oblig_nbr_pret_am_lig3 = false,
    nbr_max_pret_am_lig3 = NULL
WHERE ct_player_category_id = 4;

-- ========================================
-- ÉTAPE 6: Vérification
-- ========================================

-- Vérifier que les colonnes ont été ajoutées
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'ct_param_category'
  AND column_name LIKE '%pret%'
ORDER BY column_name;

-- Vérifier les valeurs pour toutes les catégories
SELECT
    ct_player_category_id,
    is_oblig_nbr_pret,
    nbr_max_pret as quota_pro,
    is_oblig_nbr_pret_am_lig1,
    nbr_max_pret_am_lig1 as quota_am_l1,
    is_oblig_nbr_pret_am_lig2,
    nbr_max_pret_am_lig2 as quota_am_l2,
    is_oblig_nbr_pret_am_lig3,
    nbr_max_pret_am_lig3 as quota_am_l3
FROM ct_param_category
ORDER BY ct_player_category_id;

-- ========================================
-- FIN DE LA MIGRATION
-- ========================================
