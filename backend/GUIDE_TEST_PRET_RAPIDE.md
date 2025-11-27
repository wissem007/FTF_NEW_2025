# 🚀 GUIDE RAPIDE DE TEST - VALIDATEUR PRÊT

## 📋 Étape 1 : Préparation

### 1.1 Vérifier que le backend fonctionne

```bash
# Vérifier que le port 8082 est utilisé
netstat -an | findstr ":8082"
```

Si rien ne s'affiche, démarrez le backend :
```bash
cd c:\projetp\football-club-frontend\backend
mvn spring-boot:run
```

### 1.2 Ouvrir un outil de base de données

Ouvrez **pgAdmin** ou **DBeaver** et connectez-vous à votre base de données PostgreSQL.

---

## 📋 Étape 2 : Vérifier les paramètres

Exécutez cette requête pour voir les quotas configurés :

```sql
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
WHERE ct_player_category_id = 7;  -- Senior
```

**Notez les valeurs** :
- `quota_pro` : ______
- `quota_am_l1` : ______
- `quota_am_l2` : ______
- `quota_am_l3` : ______

---

## 📋 Étape 3 : Créer un joueur de test

```sql
-- Vérifier si le joueur existe déjà
SELECT * FROM ct_intervenants WHERE cin_number = 'TEST12345';

-- Si le joueur n'existe pas, le créer
INSERT INTO ct_intervenants (
    ct_intervenant_id,
    name,
    last_name,
    cin_number,
    date_of_birth,
    licence_num,
    ct_intervenant_type_id
) VALUES (
    9999,
    'TestPret',
    'JOUEUR',
    'TEST12345',
    '1995-01-01',
    'LICTEST2025',
    1
);
```

---

## 📋 Étape 4 : Test PRÊT PROFESSIONNEL

### 4.1 Vérifier le nombre actuel de demandes PRÊT PRO

```sql
SELECT COUNT(*) as total_actuel
FROM ct_demandes
WHERE ct_team_id = 201  -- Remplacez par votre teamId
  AND ct_season_id = 2025
  AND ct_type_licence_id = 5
  AND ct_player_category_id = 7
  AND ct_regime_id IN (2, 3, 4)  -- PRO, SEMI-PRO, STAGIAIRE
  AND ct_demande_statu_id != 0;
```

**Résultat** : ______ demandes actuelles

### 4.2 Créer une demande PRÊT PRO via Postman ou curl

**Méthode : POST**
**URL :** `http://localhost:8082/api/v1/demandes-players`
**Body (JSON) :**

```json
{
  "teamId": 201,
  "seasonId": 2025,
  "typeLicenceId": 5,
  "regimeId": 2,
  "cinNumber": "TEST12345",
  "lastName": "JOUEUR",
  "name": "TestPret",
  "dateOfBirth": "1995-01-01"
}
```

**Résultat attendu** :
- ✅ Si quota non atteint : HTTP 201 Created
- ❌ Si quota atteint : HTTP 400 avec message "QUOTA PRÊT PROFESSIONNEL ATTEINT"

### 4.3 Vérifier dans la console du backend

Cherchez ces logs :

```
════════════════════════════════════════════════════════════
🔍 VALIDATION PRÊT - DÉBUT
════════════════════════════════════════════════════════════
📋 Régime: 2 | Division: ... | Catégorie: 7
...
✅ VALIDATION PRÊT - SUCCÈS
```

---

## 📋 Étape 5 : Test PRÊT AMATEUR LIGUE I

### 5.1 Vérifier la division de votre équipe

```sql
SELECT t.label, td.ct_division_id
FROM ct_teams t
JOIN ct_team_divisions td ON t.ct_team_id = td.ct_team_id
WHERE t.ct_team_id = 201
  AND td.ct_season_id = 2025;
```

**Note** : Si `ct_division_id` ≠ 1, utilisez une autre équipe en Ligue I.

### 5.2 Créer une demande PRÊT AMATEUR LIGUE I

```json
{
  "teamId": 201,
  "seasonId": 2025,
  "typeLicenceId": 5,
  "regimeId": 1,
  "cinNumber": "TEST23456",
  "lastName": "AMATEUR",
  "name": "TestL1",
  "dateOfBirth": "1996-05-15"
}
```

**Note** : Créez d'abord le joueur dans `ct_intervenants` :

```sql
INSERT INTO ct_intervenants (ct_intervenant_id, name, last_name, cin_number, date_of_birth, licence_num, ct_intervenant_type_id)
VALUES (9998, 'TestL1', 'AMATEUR', 'TEST23456', '1996-05-15', 'LICTEST2026', 1);
```

---

## 📋 Étape 6 : Test des cas d'erreur

### 6.1 Test joueur inexistant

```json
{
  "teamId": 201,
  "seasonId": 2025,
  "typeLicenceId": 5,
  "regimeId": 2,
  "cinNumber": "INEXISTANT999",
  "lastName": "INCONNU",
  "name": "Test",
  "dateOfBirth": "1990-01-01"
}
```

**Résultat attendu** : HTTP 400 avec message "JOUEUR INTROUVABLE DANS LE SYSTÈME"

### 6.2 Test doublon

Essayez de créer **2 fois la même demande** avec le même CIN.

**Résultat attendu** : La 2ème tentative doit échouer avec "DEMANDE DÉJÀ ENREGISTRÉE"

---

## 📋 Étape 7 : Tester le quota

### 7.1 Créer plusieurs demandes jusqu'au quota

Si `quota_pro = 3`, créez 3 demandes PRÊT PRO avec des joueurs différents :

**Joueur 1 :**
```sql
INSERT INTO ct_intervenants VALUES (10001, 'Test1', 'JOUEUR', 'CIN10001', '1995-01-01', 'LIC001', 1);
```

```json
{
  "teamId": 201,
  "seasonId": 2025,
  "typeLicenceId": 5,
  "regimeId": 2,
  "cinNumber": "CIN10001",
  "lastName": "JOUEUR",
  "name": "Test1",
  "dateOfBirth": "1995-01-01"
}
```

**Joueur 2 :**
```sql
INSERT INTO ct_intervenants VALUES (10002, 'Test2', 'JOUEUR', 'CIN10002', '1995-02-01', 'LIC002', 1);
```

```json
{
  "teamId": 201,
  "seasonId": 2025,
  "typeLicenceId": 5,
  "regimeId": 2,
  "cinNumber": "CIN10002",
  "lastName": "JOUEUR",
  "name": "Test2",
  "dateOfBirth": "1995-02-01"
}
```

**Joueur 3 :**
```sql
INSERT INTO ct_intervenants VALUES (10003, 'Test3', 'JOUEUR', 'CIN10003', '1995-03-01', 'LIC003', 1);
```

```json
{
  "teamId": 201,
  "seasonId": 2025,
  "typeLicenceId": 5,
  "regimeId": 2,
  "cinNumber": "CIN10003",
  "lastName": "JOUEUR",
  "name": "Test3",
  "dateOfBirth": "1995-03-01"
}
```

### 7.2 Essayer d'en créer une 4ème (doit échouer)

**Joueur 4 :**
```sql
INSERT INTO ct_intervenants VALUES (10004, 'Test4', 'JOUEUR', 'CIN10004', '1995-04-01', 'LIC004', 1);
```

```json
{
  "teamId": 201,
  "seasonId": 2025,
  "typeLicenceId": 5,
  "regimeId": 2,
  "cinNumber": "CIN10004",
  "lastName": "JOUEUR",
  "name": "Test4",
  "dateOfBirth": "1995-04-01"
}
```

**Résultat attendu** : HTTP 400 avec :
```
❌ QUOTA PRÊT PROFESSIONNEL ATTEINT

Nombre maximum de demandes PRÊT (PROFESSIONNEL) par catégorie atteint.

➤ Catégorie: Senior
➤ Quota maximum: 3
➤ Actuellement: 3
```

---

## 📋 Étape 8 : Nettoyage

Après les tests, nettoyez les données de test :

```sql
-- Supprimer les demandes de test
DELETE FROM ct_demandes
WHERE cin_number IN ('TEST12345', 'TEST23456', 'CIN10001', 'CIN10002', 'CIN10003', 'CIN10004', 'INEXISTANT999');

-- Supprimer les joueurs de test
DELETE FROM ct_intervenants
WHERE ct_intervenant_id IN (9999, 9998, 10001, 10002, 10003, 10004);
```

---

## ✅ CHECKLIST DE VALIDATION

Cochez les tests effectués :

- [ ] ✅ PRÊT PROFESSIONNEL - Création réussie
- [ ] ✅ PRÊT PROFESSIONNEL - Quota bloque correctement
- [ ] ✅ PRÊT AMATEUR LIGUE I - Création réussie
- [ ] ✅ PRÊT AMATEUR LIGUE I - Quota bloque correctement
- [ ] ✅ PRÊT AMATEUR LIGUE II - Création réussie
- [ ] ✅ PRÊT AMATEUR LIGUE III - Création réussie
- [ ] ✅ Joueur inexistant - Bloqué avec message clair
- [ ] ✅ Doublon - Bloqué avec message clair
- [ ] ✅ Logs console affichent correctement les étapes
- [ ] ✅ Messages d'erreur sont en français et clairs

---

## 📞 EN CAS DE PROBLÈME

### Le backend ne démarre pas
```bash
cd c:\projetp\football-club-frontend\backend
mvn clean compile spring-boot:run
```

### Les quotas ne fonctionnent pas
Vérifiez que les paramètres existent :
```sql
SELECT * FROM ct_param_category WHERE ct_player_category_id = 7;
```

### Les tests échouent tous
Vérifiez les logs du backend dans la console pour voir l'erreur exacte.

---

## 🎯 RÉSULTAT ATTENDU

Si tous les tests passent, vous devriez voir :
- ✅ Créations réussies quand quotas OK
- ❌ Blocages avec messages clairs quand quotas atteints
- ❌ Blocages pour joueurs inexistants
- ❌ Blocages pour doublons
- 📝 Logs détaillés dans la console backend
