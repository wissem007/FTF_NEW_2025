# 🔧 INSTALLATION DES QUOTAS PRÊT - Guide Complet

## ⚠️ PROBLÈME IDENTIFIÉ

Le validateur `PretValidator` ne peut pas fonctionner car les colonnes de quota PRÊT n'existent pas dans la table `ct_param_category`.

**Colonnes manquantes :**
- `is_oblig_nbr_pret` / `nbr_max_pret` (PRÊT PROFESSIONNEL)
- `is_oblig_nbr_pret_am_lig1` / `nbr_max_pret_am_lig1` (PRÊT AMATEUR LIGUE I)
- `is_oblig_nbr_pret_am_lig2` / `nbr_max_pret_am_lig2` (PRÊT AMATEUR LIGUE II)
- `is_oblig_nbr_pret_am_lig3` / `nbr_max_pret_am_lig3` (PRÊT AMATEUR LIGUE III)

## 📋 SOLUTION : Exécuter la migration SQL

---

## 🚀 ÉTAPE 1 : Ouvrir votre outil de base de données

Ouvrez **pgAdmin** ou **DBeaver** et connectez-vous à votre base de données PostgreSQL (`sss_competition_db`).

---

## 🚀 ÉTAPE 2 : Exécuter le script de migration

### Option A : Via pgAdmin

1. Ouvrez **pgAdmin**
2. Connectez-vous à votre serveur PostgreSQL
3. Sélectionnez la base de données `sss_competition_db`
4. Clic droit → **Query Tool**
5. Ouvrez le fichier `migration_add_pret_quota_columns.sql`
6. Copiez TOUT le contenu
7. Collez dans Query Tool
8. Cliquez sur **Execute** (F5)

### Option B : Via ligne de commande

```bash
# Connectez-vous à PostgreSQL
psql -U votre_utilisateur -d sss_competition_db

# Exécutez le script
\i c:\projetp\football-club-frontend\backend\migration_add_pret_quota_columns.sql
```

### Option C : Via DBeaver

1. Ouvrez **DBeaver**
2. Connectez-vous à `sss_competition_db`
3. Clic droit sur la connexion → **SQL Editor** → **New SQL Script**
4. Ouvrez le fichier `migration_add_pret_quota_columns.sql`
5. Copiez tout le contenu
6. Collez dans l'éditeur SQL
7. Cliquez sur **Execute SQL Statement** (Ctrl+Enter)

---

## 🚀 ÉTAPE 3 : Vérifier que la migration a réussi

Exécutez cette requête pour vérifier que les colonnes ont été ajoutées :

```sql
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'ct_param_category'
  AND column_name LIKE '%pret%'
ORDER BY column_name;
```

**Résultat attendu** : Vous devriez voir 8 colonnes :

```
is_oblig_nbr_pret              | boolean | YES | false
is_oblig_nbr_pret_am_lig1     | boolean | YES | false
is_oblig_nbr_pret_am_lig2     | boolean | YES | false
is_oblig_nbr_pret_am_lig3     | boolean | YES | false
nbr_max_pret                  | integer | YES | NULL
nbr_max_pret_am_lig1          | integer | YES | NULL
nbr_max_pret_am_lig2          | integer | YES | NULL
nbr_max_pret_am_lig3          | integer | YES | NULL
```

---

## 🚀 ÉTAPE 4 : Vérifier les valeurs configurées

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
ORDER BY ct_player_category_id;
```

**Exemple de résultat attendu** pour la catégorie 7 (Senior) :

```
ct_player_category_id | 7
is_oblig_nbr_pret     | true
quota_pro             | 3
is_oblig_nbr_pret_am_lig1 | true
quota_am_l1           | 2
is_oblig_nbr_pret_am_lig2 | true
quota_am_l2           | 2
is_oblig_nbr_pret_am_lig3 | true
quota_am_l3           | 2
```

---

## 🚀 ÉTAPE 5 : Redémarrer le backend

Une fois la migration terminée, redémarrez le backend Spring Boot :

```bash
# Arrêter le backend actuel (Ctrl+C dans le terminal)

# Redémarrer
cd c:\projetp\football-club-frontend\backend
mvn spring-boot:run
```

---

## 🚀 ÉTAPE 6 : Tester la validation PRÊT

Maintenant que les colonnes existent, vous pouvez tester le validateur PRÊT en suivant le guide :

```bash
# Ouvrir le guide de test
notepad c:\projetp\football-club-frontend\backend\GUIDE_TEST_PRET_RAPIDE.md
```

Ou utilisez Postman/curl pour créer une demande PRÊT :

```bash
curl -X POST "http://localhost:8082/api/v1/demandes-players" \
  -H "Content-Type: application/json" \
  -d '{
    "teamId": 201,
    "seasonId": 2025,
    "typeLicenceId": 5,
    "regimeId": 2,
    "cinNumber": "TEST12345",
    "lastName": "TESTEUR",
    "name": "Pro",
    "dateOfBirth": "1995-01-01"
  }'
```

**Résultat attendu** :
- ✅ Si quota non atteint : HTTP 201 Created
- ❌ Si quota atteint : HTTP 400 avec message "QUOTA PRÊT PROFESSIONNEL ATTEINT"

---

## 📊 CONFIGURATION DES QUOTAS PAR CATÉGORIE

Le script de migration configure des **valeurs par défaut** pour chaque catégorie. Vous pouvez les modifier selon vos besoins :

### Senior (catégorie 7)
```sql
UPDATE ct_param_category
SET
    is_oblig_nbr_pret = true,
    nbr_max_pret = 3,                    -- Modifier ici
    is_oblig_nbr_pret_am_lig1 = true,
    nbr_max_pret_am_lig1 = 2,           -- Modifier ici
    is_oblig_nbr_pret_am_lig2 = true,
    nbr_max_pret_am_lig2 = 2,           -- Modifier ici
    is_oblig_nbr_pret_am_lig3 = true,
    nbr_max_pret_am_lig3 = 2            -- Modifier ici
WHERE ct_player_category_id = 7;
```

### U19 (catégorie 6)
```sql
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
```

### Pour désactiver un quota

Si vous ne voulez PAS appliquer de quota pour une catégorie :

```sql
UPDATE ct_param_category
SET
    is_oblig_nbr_pret = false,
    nbr_max_pret = NULL
WHERE ct_player_category_id = 4;  -- Exemple: U15
```

---

## ❌ EN CAS DE PROBLÈME

### Erreur : "relation ct_param_category does not exist"

Vérifiez que vous êtes bien connecté à la bonne base de données :

```sql
SELECT current_database();
```

Résultat attendu : `sss_competition_db`

### Erreur : "permission denied"

Assurez-vous que votre utilisateur PostgreSQL a les droits ALTER TABLE :

```sql
GRANT ALL PRIVILEGES ON TABLE ct_param_category TO votre_utilisateur;
```

### Les quotas ne s'appliquent toujours pas

1. Vérifiez que les colonnes existent :
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'ct_param_category' AND column_name LIKE '%pret%';
```

2. Vérifiez les valeurs :
```sql
SELECT * FROM ct_param_category WHERE ct_player_category_id = 7;
```

3. Vérifiez les logs du backend pour voir les erreurs SQL

---

## ✅ CHECKLIST D'INSTALLATION

- [ ] Migration SQL exécutée sans erreurs
- [ ] 8 nouvelles colonnes présentes dans `ct_param_category`
- [ ] Quotas configurés pour toutes les catégories
- [ ] Backend redémarré
- [ ] Test de création PRÊT réussi
- [ ] Blocage quota vérifié (4ème demande bloquée quand quota = 3)

---

## 🎯 RÉSUMÉ

Cette migration ajoute les colonnes nécessaires pour gérer les quotas PRÊT :

1. **PRÊT PROFESSIONNEL** : Pour régimes PRO, SEMI-PRO, STAGIAIRE (toutes divisions)
2. **PRÊT AMATEUR LIGUE I** : Pour régime AMATEUR en Division 1
3. **PRÊT AMATEUR LIGUE II** : Pour régime AMATEUR en Division 2
4. **PRÊT AMATEUR LIGUE III** : Pour régime AMATEUR en Division 3/4

Chaque type de quota a 2 colonnes :
- `is_oblig_nbr_pret_*` : Active/désactive le quota (BOOLEAN)
- `nbr_max_pret_*` : Nombre maximum autorisé (INTEGER)

Une fois installé, le `PretValidator` pourra correctement bloquer les demandes qui dépassent les quotas configurés.
