# 🧪 GUIDE DE TEST - VALIDATEUR PRÊT (Type 5)

## 📋 Prérequis

Avant de tester, assurez-vous d'avoir :
1. **Backend démarré** sur le port 8082
2. **Base de données** accessible
3. **Données de test** : Une équipe avec des joueurs et des paramètres configurés

---

## 🔍 SCÉNARIOS DE TEST

### ✅ SCÉNARIO 1 : PRÊT PROFESSIONNEL (Régime PRO/SEMI-PRO/STAGIAIRE)

**Objectif** : Vérifier le quota PRÊT PROFESSIONNEL par catégorie

#### 1.1 Vérifier les paramètres dans la base

```sql
-- Vérifier les paramètres de quota PRÊT PRO pour une catégorie (ex: Senior = 7)
SELECT
    ct_player_category_id,
    is_oblig_nbr_pret,
    nbr_max_pret
FROM ct_param_category
WHERE ct_player_category_id = 7;  -- Senior
```

**Résultat attendu** :
- `is_oblig_nbr_pret` = true
- `nbr_max_pret` = un nombre (ex: 3)

#### 1.2 Compter les demandes PRÊT PRO existantes

```sql
-- Compter les demandes PRÊT PRO pour une équipe/catégorie
SELECT COUNT(*) as total_pret_pro
FROM ct_demandes
WHERE ct_team_id = 201  -- Remplacer par votre teamId
  AND ct_season_id = 2025  -- Remplacer par votre seasonId
  AND ct_type_licence_id = 5
  AND ct_player_category_id = 7  -- Senior
  AND ct_regime_id IN (2, 3, 4)  -- PRO, SEMI-PRO, STAGIAIRE
  AND ct_demande_statu_id != 0;
```

#### 1.3 Tester via l'API

**Cas 1 : Quota non atteint** (doit réussir)

```bash
# POST /api/v1/demandes-players
curl -X POST http://localhost:8082/api/v1/demandes-players \
  -H "Content-Type: application/json" \
  -d '{
    "teamId": 201,
    "seasonId": 2025,
    "typeLicenceId": 5,
    "regimeId": 2,
    "cinNumber": "12345678",
    "lastName": "TESTEUR",
    "name": "Pro",
    "dateOfBirth": "1995-01-01"
  }'
```

**Résultat attendu** : HTTP 201 Created

**Cas 2 : Quota atteint** (doit échouer)

Créez plusieurs demandes jusqu'à atteindre `nbr_max_pret`, puis tentez d'en créer une de plus.

**Résultat attendu** : HTTP 400 avec message d'erreur :
```json
{
  "success": false,
  "errors": ["❌ QUOTA PRÊT PROFESSIONNEL ATTEINT\n\nNombre maximum de demandes PRÊT (PROFESSIONNEL) par catégorie atteint..."]
}
```

---

### ✅ SCÉNARIO 2 : PRÊT AMATEUR LIGUE I

**Objectif** : Vérifier le quota PRÊT AMATEUR pour Ligue I

#### 2.1 Vérifier les paramètres

```sql
-- Vérifier les paramètres de quota PRÊT AMATEUR LIGUE I
SELECT
    ct_player_category_id,
    is_oblig_nbr_pret_am_lig1,
    nbr_max_pret_am_lig1
FROM ct_param_category
WHERE ct_player_category_id = 7;  -- Senior
```

#### 2.2 Compter les demandes PRÊT AMATEUR LIGUE I existantes

```sql
-- Compter les demandes PRÊT AMATEUR LIGUE I
SELECT COUNT(*) as total_pret_amateur_l1
FROM ct_demandes
WHERE ct_team_id = 201
  AND ct_season_id = 2025
  AND ct_type_licence_id = 5
  AND ct_player_category_id = 7
  AND ct_regime_id = 1  -- AMATEUR
  AND ct_demande_statu_id != 0;

-- Vérifier que l'équipe est en Ligue I
SELECT td.ct_division_id
FROM ct_team_divisions td
WHERE td.ct_team_id = 201
  AND td.ct_season_id = 2025;
```

**Note** : La division doit être 1 (LIGUE I)

#### 2.3 Tester via l'API

```bash
curl -X POST http://localhost:8082/api/v1/demandes-players \
  -H "Content-Type: application/json" \
  -d '{
    "teamId": 201,
    "seasonId": 2025,
    "typeLicenceId": 5,
    "regimeId": 1,
    "cinNumber": "87654321",
    "lastName": "TESTEUR",
    "name": "Amateur",
    "dateOfBirth": "1996-05-15"
  }'
```

---

### ✅ SCÉNARIO 3 : PRÊT AMATEUR LIGUE II

**Objectif** : Vérifier le quota PRÊT AMATEUR pour Ligue II

#### 3.1 Vérifier les paramètres

```sql
SELECT
    ct_player_category_id,
    is_oblig_nbr_pret_am_lig2,
    nbr_max_pret_am_lig2
FROM ct_param_category
WHERE ct_player_category_id = 7;
```

#### 3.2 Compter les demandes existantes

```sql
SELECT COUNT(*) as total_pret_amateur_l2
FROM ct_demandes
WHERE ct_team_id = 202  -- Équipe en Ligue II
  AND ct_season_id = 2025
  AND ct_type_licence_id = 5
  AND ct_player_category_id = 7
  AND ct_regime_id = 1
  AND ct_demande_statu_id != 0;
```

#### 3.3 Tester via l'API

```bash
curl -X POST http://localhost:8082/api/v1/demandes-players \
  -H "Content-Type: application/json" \
  -d '{
    "teamId": 202,
    "seasonId": 2025,
    "typeLicenceId": 5,
    "regimeId": 1,
    "cinNumber": "11223344",
    "lastName": "TESTEUR",
    "name": "LigueII",
    "dateOfBirth": "1997-08-20"
  }'
```

---

### ✅ SCÉNARIO 4 : PRÊT AMATEUR LIGUE III

**Objectif** : Vérifier le quota PRÊT AMATEUR pour Ligue III

#### 4.1 Vérifier les paramètres

```sql
SELECT
    ct_player_category_id,
    is_oblig_nbr_pret_am_lig3,
    nbr_max_pret_am_lig3
FROM ct_param_category
WHERE ct_player_category_id = 7;
```

#### 4.2 Tester via l'API

```bash
curl -X POST http://localhost:8082/api/v1/demandes-players \
  -H "Content-Type: application/json" \
  -d '{
    "teamId": 203,
    "seasonId": 2025,
    "typeLicenceId": 5,
    "regimeId": 1,
    "cinNumber": "55667788",
    "lastName": "TESTEUR",
    "name": "LigueIII",
    "dateOfBirth": "1998-12-10"
  }'
```

---

### ✅ SCÉNARIO 5 : Joueur inexistant

**Objectif** : Vérifier que le joueur doit exister dans `ct_intervenants`

#### 5.1 Vérifier qu'un joueur n'existe PAS

```sql
SELECT COUNT(*) FROM ct_intervenants
WHERE cin_number = '99999999';
```

**Résultat attendu** : 0

#### 5.2 Tester via l'API

```bash
curl -X POST http://localhost:8082/api/v1/demandes-players \
  -H "Content-Type: application/json" \
  -d '{
    "teamId": 201,
    "seasonId": 2025,
    "typeLicenceId": 5,
    "regimeId": 2,
    "cinNumber": "99999999",
    "lastName": "INEXISTANT",
    "name": "Joueur",
    "dateOfBirth": "1990-01-01"
  }'
```

**Résultat attendu** : HTTP 400 avec erreur :
```json
{
  "success": false,
  "errors": ["❌ JOUEUR INTROUVABLE DANS LE SYSTÈME..."]
}
```

---

### ✅ SCÉNARIO 6 : Doublon (demande déjà existante)

**Objectif** : Vérifier qu'on ne peut pas créer 2 demandes PRÊT pour le même joueur

#### 6.1 Créer une première demande

```bash
curl -X POST http://localhost:8082/api/v1/demandes-players \
  -H "Content-Type: application/json" \
  -d '{
    "teamId": 201,
    "seasonId": 2025,
    "typeLicenceId": 5,
    "regimeId": 2,
    "cinNumber": "12345678",
    "lastName": "DUPONT",
    "name": "Jean",
    "dateOfBirth": "1995-01-01"
  }'
```

**Résultat** : HTTP 201 Created

#### 6.2 Essayer de créer une deuxième demande identique

```bash
# Même requête
curl -X POST http://localhost:8082/api/v1/demandes-players \
  -H "Content-Type: application/json" \
  -d '{
    "teamId": 201,
    "seasonId": 2025,
    "typeLicenceId": 5,
    "regimeId": 2,
    "cinNumber": "12345678",
    "lastName": "DUPONT",
    "name": "Jean",
    "dateOfBirth": "1995-01-01"
  }'
```

**Résultat attendu** : HTTP 400 avec erreur :
```json
{
  "success": false,
  "errors": ["❌ DEMANDE DÉJÀ ENREGISTRÉE..."]
}
```

---

## 🔧 REQUÊTES UTILES POUR LA PRÉPARATION DES TESTS

### Créer un joueur de test

```sql
-- Insérer un joueur dans ct_intervenants
INSERT INTO ct_intervenants (
    ct_intervenant_id,
    name,
    last_name,
    cin_number,
    date_of_birth,
    licence_num
) VALUES (
    9999,
    'TestPret',
    'JOUEUR',
    '12345678',
    '1995-01-01',
    'LIC2025001'
);
```

### Vérifier les divisions des équipes

```sql
SELECT
    t.ct_team_id,
    t.label as equipe,
    td.ct_division_id,
    d.label as division
FROM ct_teams t
LEFT JOIN ct_team_divisions td ON t.ct_team_id = td.ct_team_id AND td.ct_season_id = 2025
LEFT JOIN ct_divisions d ON td.ct_division_id = d.ct_division_id
WHERE t.ct_team_id IN (201, 202, 203);
```

### Nettoyer les données de test

```sql
-- Supprimer les demandes de test
DELETE FROM ct_demandes
WHERE cin_number IN ('12345678', '87654321', '11223344', '55667788', '99999999');

-- Supprimer le joueur de test
DELETE FROM ct_intervenants
WHERE ct_intervenant_id = 9999;
```

---

## 📊 TABLEAU RÉCAPITULATIF DES TESTS

| # | Scénario | Régime | Division | Quota | Attendu |
|---|----------|--------|----------|-------|---------|
| 1 | PRÊT PRO - Quota OK | PRO (2) | N/A | < Max | ✅ Succès |
| 2 | PRÊT PRO - Quota atteint | PRO (2) | N/A | = Max | ❌ Erreur quota |
| 3 | PRÊT AMATEUR L1 - OK | AMATEUR (1) | LIGUE I (1) | < Max | ✅ Succès |
| 4 | PRÊT AMATEUR L1 - Quota atteint | AMATEUR (1) | LIGUE I (1) | = Max | ❌ Erreur quota |
| 5 | PRÊT AMATEUR L2 - OK | AMATEUR (1) | LIGUE II (2) | < Max | ✅ Succès |
| 6 | PRÊT AMATEUR L3 - OK | AMATEUR (1) | LIGUE III (3/4) | < Max | ✅ Succès |
| 7 | Joueur inexistant | N/A | N/A | N/A | ❌ Joueur introuvable |
| 8 | Doublon | N/A | N/A | N/A | ❌ Demande existe déjà |

---

## 🎯 CHECKLIST DE VALIDATION

- [ ] PRÊT PROFESSIONNEL fonctionne et bloque au quota
- [ ] PRÊT AMATEUR LIGUE I fonctionne et bloque au quota
- [ ] PRÊT AMATEUR LIGUE II fonctionne et bloque au quota
- [ ] PRÊT AMATEUR LIGUE III fonctionne et bloque au quota
- [ ] Validation joueur existant fonctionne
- [ ] Détection des doublons fonctionne
- [ ] Messages d'erreur sont clairs et en français
- [ ] Logs console affichent les étapes de validation

---

## 📝 NOTES

- Les quotas sont configurés dans la table `ct_param_category`
- Les divisions des équipes sont dans `ct_team_divisions`
- Les constantes utilisées :
  - Régimes : AMATEUR=1, PRO=2, SEMI-PRO=3, STAGIAIRE=4, CP=5
  - Divisions : LIGUE_I=1, LIGUE_II=2, LIGUE_III_1=3, LIGUE_III_2=4
  - Type licence PRÊT = 5
