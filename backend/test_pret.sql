-- ========================================
-- 🧪 SCRIPT DE TEST POUR VALIDATEUR PRÊT
-- ========================================

-- ========================================
-- ÉTAPE 1: VÉRIFICATION DES PARAMÈTRES
-- ========================================

-- 1.1 Vérifier les paramètres de quota PRÊT pour toutes les catégories
SELECT
    ct_player_category_id,
    is_oblig_nbr_pret,
    nbr_max_pret,
    is_oblig_nbr_pret_am_lig1,
    nbr_max_pret_am_lig1,
    is_oblig_nbr_pret_am_lig2,
    nbr_max_pret_am_lig2,
    is_oblig_nbr_pret_am_lig3,
    nbr_max_pret_am_lig3
FROM ct_param_category
ORDER BY ct_player_category_id;

-- 1.2 Vérifier les divisions des équipes pour la saison 2025
SELECT
    t.ct_team_id,
    t.label as equipe,
    td.ct_division_id,
    d.label as division,
    td.ct_season_id
FROM ct_teams t
LEFT JOIN ct_team_divisions td ON t.ct_team_id = td.ct_team_id
LEFT JOIN ct_divisions d ON td.ct_division_id = d.ct_division_id
WHERE td.ct_season_id = 2025
ORDER BY td.ct_division_id, t.label;

-- ========================================
-- ÉTAPE 2: COMPTAGE DES DEMANDES PRÊT EXISTANTES
-- ========================================

-- 2.1 Compter les demandes PRÊT PROFESSIONNEL par équipe et catégorie
SELECT
    ct_team_id,
    ct_player_category_id,
    COUNT(*) as total_pret_pro
FROM ct_demandes
WHERE ct_season_id = 2025
  AND ct_type_licence_id = 5
  AND ct_regime_id IN (2, 3, 4)  -- PRO, SEMI-PRO, STAGIAIRE
  AND ct_demande_statu_id != 0
GROUP BY ct_team_id, ct_player_category_id
ORDER BY ct_team_id, ct_player_category_id;

-- 2.2 Compter les demandes PRÊT AMATEUR par équipe et catégorie
SELECT
    d.ct_team_id,
    d.ct_player_category_id,
    td.ct_division_id,
    COUNT(*) as total_pret_amateur
FROM ct_demandes d
LEFT JOIN ct_team_divisions td ON d.ct_team_id = td.ct_team_id AND td.ct_season_id = d.ct_season_id
WHERE d.ct_season_id = 2025
  AND d.ct_type_licence_id = 5
  AND d.ct_regime_id = 1  -- AMATEUR
  AND d.ct_demande_statu_id != 0
GROUP BY d.ct_team_id, d.ct_player_category_id, td.ct_division_id
ORDER BY d.ct_team_id, d.ct_player_category_id;

-- 2.3 Détail de toutes les demandes PRÊT pour la saison 2025
SELECT
    d.ct_demande_id,
    d.ct_team_id,
    t.label as equipe,
    d.name as prenom,
    d.last_name as nom,
    d.cin_number,
    d.ct_player_category_id,
    d.ct_regime_id,
    td.ct_division_id,
    d.ct_demande_statu_id
FROM ct_demandes d
LEFT JOIN ct_teams t ON d.ct_team_id = t.ct_team_id
LEFT JOIN ct_team_divisions td ON d.ct_team_id = td.ct_team_id AND td.ct_season_id = d.ct_season_id
WHERE d.ct_season_id = 2025
  AND d.ct_type_licence_id = 5
  AND d.ct_demande_statu_id != 0
ORDER BY d.ct_team_id, d.ct_player_category_id;

-- ========================================
-- ÉTAPE 3: VÉRIFIER SI QUOTAS SONT ATTEINTS
-- ========================================

-- 3.1 Vérifier PRÊT PRO pour une équipe spécifique (exemple: équipe 201, catégorie 7)
SELECT
    'PRÊT PROFESSIONNEL' as type_quota,
    COUNT(*) as demandes_actuelles,
    (SELECT nbr_max_pret FROM ct_param_category WHERE ct_player_category_id = 7) as quota_max,
    CASE
        WHEN COUNT(*) >= (SELECT nbr_max_pret FROM ct_param_category WHERE ct_player_category_id = 7)
        THEN '❌ QUOTA ATTEINT'
        ELSE '✅ QUOTA OK'
    END as statut
FROM ct_demandes
WHERE ct_team_id = 201  -- Remplacer par votre teamId
  AND ct_season_id = 2025
  AND ct_type_licence_id = 5
  AND ct_player_category_id = 7  -- Senior
  AND ct_regime_id IN (2, 3, 4)
  AND ct_demande_statu_id != 0;

-- 3.2 Vérifier PRÊT AMATEUR LIGUE I pour une équipe (exemple: équipe 201, catégorie 7)
SELECT
    'PRÊT AMATEUR LIGUE I' as type_quota,
    COUNT(*) as demandes_actuelles,
    (SELECT nbr_max_pret_am_lig1 FROM ct_param_category WHERE ct_player_category_id = 7) as quota_max,
    CASE
        WHEN COUNT(*) >= (SELECT nbr_max_pret_am_lig1 FROM ct_param_category WHERE ct_player_category_id = 7)
        THEN '❌ QUOTA ATTEINT'
        ELSE '✅ QUOTA OK'
    END as statut
FROM ct_demandes d
INNER JOIN ct_team_divisions td ON d.ct_team_id = td.ct_team_id AND td.ct_season_id = d.ct_season_id
WHERE d.ct_team_id = 201
  AND d.ct_season_id = 2025
  AND d.ct_type_licence_id = 5
  AND d.ct_player_category_id = 7
  AND d.ct_regime_id = 1
  AND td.ct_division_id = 1  -- LIGUE I
  AND d.ct_demande_statu_id != 0;

-- ========================================
-- ÉTAPE 4: DONNÉES DE TEST
-- ========================================

-- 4.1 Créer un joueur de test (à exécuter UNE SEULE FOIS)
-- INSERT INTO ct_intervenants (
--     ct_intervenant_id,
--     name,
--     last_name,
--     cin_number,
--     date_of_birth,
--     licence_num,
--     ct_intervenant_type_id
-- ) VALUES (
--     9999,
--     'TestPret',
--     'JOUEUR',
--     'TEST12345',
--     '1995-01-01',
--     'LICTEST2025',
--     1
-- );

-- 4.2 Vérifier que le joueur de test existe
SELECT * FROM ct_intervenants WHERE cin_number = 'TEST12345';

-- ========================================
-- ÉTAPE 5: NETTOYAGE
-- ========================================

-- 5.1 Supprimer les demandes de test (si besoin)
-- DELETE FROM ct_demandes
-- WHERE cin_number IN ('TEST12345', '99999999')
--   OR (last_name = 'TESTEUR' AND ct_season_id = 2025);

-- 5.2 Supprimer le joueur de test (si besoin)
-- DELETE FROM ct_intervenants WHERE ct_intervenant_id = 9999;

-- ========================================
-- ÉTAPE 6: REQUÊTES RAPIDES POUR DÉBUG
-- ========================================

-- 6.1 Voir toutes les demandes PRÊT de la saison en cours avec détails
SELECT
    d.ct_demande_id,
    d.name || ' ' || d.last_name as joueur,
    d.cin_number,
    t.label as equipe,
    CASE d.ct_regime_id
        WHEN 1 THEN 'AMATEUR'
        WHEN 2 THEN 'PROFESSIONNEL'
        WHEN 3 THEN 'SEMI-PRO'
        WHEN 4 THEN 'STAGIAIRE'
        WHEN 5 THEN 'CP'
        ELSE 'AUTRE'
    END as regime,
    td.ct_division_id as division,
    CASE d.ct_player_category_id
        WHEN 1 THEN 'U9'
        WHEN 2 THEN 'U11'
        WHEN 3 THEN 'U13'
        WHEN 4 THEN 'U15'
        WHEN 5 THEN 'U17'
        WHEN 6 THEN 'U19'
        WHEN 7 THEN 'Senior'
        WHEN 9 THEN 'U7'
        ELSE 'Autre'
    END as categorie,
    d.ct_demande_statu_id as statut
FROM ct_demandes d
LEFT JOIN ct_teams t ON d.ct_team_id = t.ct_team_id
LEFT JOIN ct_team_divisions td ON d.ct_team_id = td.ct_team_id AND td.ct_season_id = d.ct_season_id
WHERE d.ct_season_id = 2025
  AND d.ct_type_licence_id = 5
  AND d.ct_demande_statu_id != 0
ORDER BY d.ct_team_id, d.ct_player_category_id, d.ct_demande_id DESC;

-- 6.2 Vérifier les paramètres pour une catégorie spécifique
SELECT
    ct_player_category_id,
    'PRÊT PRO: ' || COALESCE(nbr_max_pret::text, 'Non défini') as quota_pro,
    'PRÊT AM L1: ' || COALESCE(nbr_max_pret_am_lig1::text, 'Non défini') as quota_l1,
    'PRÊT AM L2: ' || COALESCE(nbr_max_pret_am_lig2::text, 'Non défini') as quota_l2,
    'PRÊT AM L3: ' || COALESCE(nbr_max_pret_am_lig3::text, 'Non défini') as quota_l3
FROM ct_param_category
WHERE ct_player_category_id = 7;  -- Remplacer par la catégorie souhaitée

-- ========================================
-- FIN DU SCRIPT DE TEST
-- ========================================
