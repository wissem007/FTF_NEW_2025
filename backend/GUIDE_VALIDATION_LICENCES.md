# 📋 GUIDE DE VALIDATION DES LICENCES

Ce document décrit la logique de validation pour tous les types de licences dans le système de gestion des demandes.

## 📊 STRUCTURE DES TABLES

### Table `ct_demandes`
Colonnes utilisées pour la validation:
- `ct_demande_id` - ID de la demande
- `ct_team_id` - ID de l'équipe
- `ct_season_id` - ID de la saison
- `ct_type_licence_id` - Type de licence (1=Nouvelle, 2=Renouvellement, etc.)
- `ct_demande_statu_id` - Statut de la demande (0=Annulée, autres=Actifs)
- `cin_number` - Numéro CIN
- `passport_num` - Numéro de passeport
- `name` - Prénom
- `last_name` - Nom de famille
- `date_of_birth` - Date de naissance

### Table `ct_intervenants`
Colonnes utilisées pour la validation:
- `ct_intervenant_id` - ID de l'intervenant
- `cin_number` - Numéro CIN
- `passport_num` - Numéro de passeport
- `name` - Prénom
- `last_name` - Nom de famille
- `date_of_birth` - Date de naissance
- `licence_num` - Numéro de licence

---

## 🎯 CATÉGORIES D'ÂGE

### Définition
- **CADETS+** : Âge ≥ 16 ans
- **<CADETS** : Âge < 16 ans

### Critères de recherche selon l'âge
| Catégorie | Critères de recherche |
|-----------|----------------------|
| CADETS+ (≥16 ans) | CIN **OU** Passeport |
| <CADETS (<16 ans) | Nom **ET** Prénom **ET** Date de naissance |

---

## 🔍 TYPE 1: NOUVELLE LICENCE

### Description
Demande pour un joueur qui **n'a JAMAIS eu de licence** dans le système.

### Règles de validation

#### ✅ ÉTAPE 1: Déterminer l'âge
```
SI date_of_birth == NULL
  → Considérer comme CADETS+ (≥16 ans)
SINON
  âge = année_actuelle - année_naissance
  SI âge ≥ 16 → CADETS+
  SI âge < 16 → <CADETS
```

#### ✅ ÉTAPE 2: Vérifier doublons dans ct_demandes
**Objectif:** Empêcher de créer 2 demandes NOUVELLE LICENCE pour le même joueur dans la même saison.

##### Pour CADETS+ (≥16 ans):
```sql
SELECT COUNT(*) FROM ct_demandes
WHERE ct_team_id = [ID_EQUIPE]
  AND ct_season_id = [ID_SAISON]
  AND ct_type_licence_id = 1
  AND (cin_number = [CIN] OR passport_num = [PASSEPORT])
  AND ct_demande_statu_id != 0
```

##### Pour <CADETS (<16 ans):
```sql
SELECT COUNT(*) FROM ct_demandes
WHERE ct_team_id = [ID_EQUIPE]
  AND ct_season_id = [ID_SAISON]
  AND ct_type_licence_id = 1
  AND UPPER(last_name) = UPPER([NOM])
  AND UPPER(name) = UPPER([PRENOM])
  AND date_of_birth = [DATE_NAISSANCE]
  AND ct_demande_statu_id != 0
```

**Résultat:**
- **COUNT > 0** → ❌ **BLOQUER** avec message:
  ```
  ❌ DOUBLON DÉTECTÉ - NOUVELLE LICENCE

  Une demande de NOUVELLE LICENCE existe déjà pour ce joueur cette saison.
  Vous ne pouvez pas créer deux demandes de NOUVELLE LICENCE pour le même joueur.
  ```
- **COUNT = 0** → ✅ Continuer à l'étape 3

#### ✅ ÉTAPE 3: Vérifier existence dans ct_intervenants
**Objectif:** Empêcher de créer une NOUVELLE LICENCE pour un joueur qui existe déjà dans la base.

##### Pour CADETS+ (≥16 ans):

**Pré-vérification:**
```
SI cin_number == NULL ET passport_num == NULL
  → ⚠️ SAUTER cette étape (pas de critère de recherche)
  → ✅ AUTORISER la demande
```

**Requête:**
```sql
SELECT COUNT(*) FROM ct_intervenants
WHERE cin_number = [CIN] OR passport_num = [PASSEPORT]
```

##### Pour <CADETS (<16 ans):

**Pré-vérification:**
```
SI last_name == NULL OU name == NULL OU date_of_birth == NULL
  → ⚠️ SAUTER cette étape (informations incomplètes)
  → ✅ AUTORISER la demande
```

**Requête:**
```sql
SELECT COUNT(*) FROM ct_intervenants
WHERE UPPER(last_name) = UPPER([NOM])
  AND UPPER(name) = UPPER([PRENOM])
  AND date_of_birth = [DATE_NAISSANCE]
```

**Résultat:**
- **COUNT > 0** → ❌ **BLOQUER** avec message:
  ```
  ❌ JOUEUR DÉJÀ EXISTANT

  Ce joueur existe déjà dans la base de données.

  📋 SOLUTION : Utilisez l'un de ces types :
  • RENOUVELLEMENT (Type 2) : Si le joueur était dans votre club l'année dernière
  • MUTATION (Type 4) : Si le joueur vient d'un autre club
  • TRANSFERT (Type 8) : Si le joueur est transféré
  ```
- **COUNT = 0** → ✅ AUTORISER la demande

#### 🔒 Gestion des erreurs SQL
```
EN CAS D'ERREUR SQL (colonne introuvable, timeout, etc.)
  → ❌ BLOQUER par sécurité
  → Message: "Erreur technique lors de la validation. Impossible de vérifier."
```

---

## 🔍 TYPE 2: RENOUVELLEMENT

### Description
Demande pour un joueur qui **avait une licence l'année dernière** dans la **même équipe**.

### Règles de validation

#### Principe
Le joueur doit:
1. ✅ **Exister dans ct_intervenants** (déjà enregistré dans le système)
2. ✅ **Avoir eu une licence l'année dernière dans le MÊME club** (vérifier dans ct_team_intervenants)
3. ✅ **Ne pas avoir de demande de renouvellement en cours pour cette saison**

---

### ÉTAPE 1: Déterminer l'âge et les critères de recherche

Même logique que NOUVELLE LICENCE:

**Calcul:**
```java
int age = Period.between(date_naissance, LocalDate.now()).getYears();
boolean isCadetsOrOlder = (age >= 16);
```

**Critères de recherche:**
- **CADETS+ (≥16 ans)**: Recherche par `cin_number` OU `passport_num`
- **<CADETS (<16 ans)**: Recherche par `last_name` + `name` + `date_of_birth`

---

### ÉTAPE 2: Vérifier que le joueur EXISTE dans le système

⚠️ **INVERSE de NOUVELLE LICENCE**: Pour renouvellement, le joueur **DOIT exister**

#### Pour CADETS+ (≥16 ans):

**Pré-vérification:**
```
SI cin_number == NULL ET passport_num == NULL
  → ❌ BLOQUER: "CIN ou Passeport obligatoire pour le renouvellement"
```

**Requête:**
```sql
SELECT COUNT(*) FROM ct_intervenants
WHERE cin_number = ? OR passport_num = ?
```

#### Pour <CADETS (<16 ans):

**Pré-vérification:**
```
SI last_name == NULL OU name == NULL OU date_of_birth == NULL
  → ❌ BLOQUER: "Nom, Prénom et Date de naissance obligatoires"
```

**Requête:**
```sql
SELECT COUNT(*) FROM ct_intervenants
WHERE UPPER(last_name) = UPPER(?)
  AND UPPER(name) = UPPER(?)
  AND date_of_birth = ?
```

**Résultat:**
- **COUNT = 0** → ❌ **BLOQUER** avec message:
  ```
  ❌ JOUEUR INTROUVABLE

  Ce joueur n'existe pas dans le système.

  ➤ Utilisez "NOUVELLE LICENCE" pour enregistrer un nouveau joueur.
  ```
- **COUNT > 0** → ✅ Continuer à l'étape suivante

---

### ÉTAPE 3: Vérifier l'éligibilité pour RENOUVELLEMENT (LOGIQUE COMPLEXE)

**Objectif:** Vérifier que le joueur est éligible pour un renouvellement selon les règles métier complexes.

**Table:** `ct_team_intervenants`

**LOGIQUE COMPLEXE - Un joueur est éligible SI:**
1. ✅ Il avait une licence dans VOTRE club dans une **saison PRÉCÉDENTE** (< saison actuelle)
   - **ET** son type de licence n'était PAS: PRÊT (5) ou RENOUVELLEMENT_SPÉCIAL (6)
2. **OU** ✅ Il a une licence dans VOTRE club dans la **saison ACTUELLE**
   - **ET** son type de licence est: MUTATION (4) ou LIBRE (11)

#### Pour CADETS+ (≥16 ans):

**Requête:**
```sql
SELECT COUNT(*) FROM ct_team_intervenants
WHERE ct_team_id = ?
  AND ct_intervenant_type_id = 1  -- Type = Joueur
  AND (cin_number = ? OR passport_num = ?)
  AND (
      -- CAS 1: Saisons précédentes (sauf PRÊT et RENOUVELLEMENT_SPÉCIAL)
      (ct_season_id < ? AND ct_type_licence_id NOT IN (5, 6))

      -- CAS 2: OU saison actuelle avec MUTATION ou LIBRE
      OR (ct_season_id = ? AND ct_type_licence_id IN (4, 11))
  )
```

#### Pour <CADETS (<16 ans):

**Requête:**
```sql
SELECT COUNT(*) FROM ct_team_intervenants
WHERE ct_team_id = ?
  AND ct_intervenant_type_id = 1  -- Type = Joueur
  AND UPPER(last_name) = UPPER(?)
  AND UPPER(name) = UPPER(?)
  AND date_of_birth = ?
  AND (
      -- CAS 1: Saisons précédentes (sauf PRÊT et RENOUVELLEMENT_SPÉCIAL)
      (ct_season_id < ? AND ct_type_licence_id NOT IN (5, 6))

      -- CAS 2: OU saison actuelle avec MUTATION ou LIBRE
      OR (ct_season_id = ? AND ct_type_licence_id IN (4, 11))
  )
```

**Résultat:**
- **COUNT = 0** → ❌ **BLOQUER** avec message:
  ```
  ❌ JOUEUR NON LICENCIÉ L'ANNÉE DERNIÈRE

  Ce joueur n'avait pas de licence dans votre club lors de la saison précédente.

  ➤ Veuillez utiliser l'un des types suivants :

     • MUTATION : Si le joueur vient d'un autre club de la même ligue
     • TRANSFERT : Si le joueur est transféré d'un autre club
     • NOUVELLE LICENCE : Si c'est un nouveau joueur
  ```
- **COUNT > 0** → ✅ Continuer à l'étape suivante

**Explication de la logique:**
- **Exclure PRÊT (5)**: Un joueur en prêt n'est pas vraiment dans votre effectif
- **Exclure RENOUVELLEMENT_SPÉCIAL (6)**: Cas particuliers à traiter différemment
- **Inclure MUTATION (4) saison actuelle**: Joueur qui arrive d'un autre club cette saison peut être renouvelé
- **Inclure LIBRE (11) saison actuelle**: Joueur libre qui rejoint le club peut être renouvelé

---

### ÉTAPE 4: Vérifier qu'il n'y a pas déjà une demande de renouvellement cette saison

**Objectif:** Éviter les doublons de demandes de renouvellement.

**Table:** `ct_demandes`

#### Pour CADETS+ (≥16 ans):

**Requête:**
```sql
SELECT COUNT(*) FROM ct_demandes
WHERE ct_team_id = ?
  AND ct_season_id = ?
  AND ct_type_licence_id = 2
  AND (cin_number = ? OR passport_num = ?)
  AND ct_demande_statu_id != 0
```

#### Pour <CADETS (<16 ans):

**Requête:**
```sql
SELECT COUNT(*) FROM ct_demandes
WHERE ct_team_id = ?
  AND ct_season_id = ?
  AND ct_type_licence_id = 2
  AND UPPER(last_name) = UPPER(?)
  AND UPPER(name) = UPPER(?)
  AND date_of_birth = ?
  AND ct_demande_statu_id != 0
```

**Résultat:**
- **COUNT > 0** → ❌ **BLOQUER** avec message:
  ```
  ❌ DEMANDE DE RENOUVELLEMENT DÉJÀ ENREGISTRÉE

  Ce joueur a déjà une demande de renouvellement enregistrée pour cette saison.

  ➤ Impossible de créer une deuxième demande de renouvellement pour le même joueur dans la même saison.
  ```
- **COUNT = 0** → ✅ **AUTORISER** la demande

---

### 🔒 Gestion des erreurs SQL

```
EN CAS D'ERREUR SQL (colonne introuvable, timeout, etc.)
  → ❌ BLOQUER par sécurité
  → Message: "Erreur technique lors de la validation. Contactez l'administrateur."
```

---

## 🔍 TYPE 3: TRANSFERT NATIONAL

### Description
Transfert d'un joueur d'une équipe à une autre au sein de la même ligue/pays.

### Règles de validation
*À définir - Prochaine étape*

---

## 🔍 TYPE 3: RETOUR PRÊT

### Description
Demande pour un joueur qui **était en PRÊT (Type 5)** dans votre club au cours des **4 dernières saisons**.

### ✅ STATUT: IMPLÉMENTÉ
- **Validateur:** `RenewalAfterLoanValidator.java`
- **Endpoint d'éligibilité:** `/api/v1/demandes-players/joueurs-eligibles-retour-pret`
- **Méthode service:** `getJoueursEligiblesRetourPret()`

### Règles de validation

#### Principe
Le joueur doit:
1. ✅ **Exister dans ct_intervenants** (déjà enregistré dans le système)
2. ✅ **Avoir été en PRÊT (Type 5) dans votre club** dans les 4 dernières saisons
3. ✅ **Ne pas avoir de demande de retour prêt en cours pour cette saison**

---

### ÉTAPE 1: Déterminer l'âge et les critères de recherche

Même logique que les autres types:
- **CADETS+ (≥16 ans)**: Recherche par `cin_number` OU `passport_num`
- **<CADETS (<16 ans)**: Recherche par `last_name` + `name` + `date_of_birth`

---

### ÉTAPE 2: Vérifier que le joueur EXISTE dans ct_intervenants

⚠️ Le joueur **DOIT exister** dans le système.

#### Pour CADETS+ (≥16 ans):
```sql
SELECT COUNT(*) FROM ct_intervenants
WHERE cin_number = ? OR passport_num = ?
```

#### Pour <CADETS (<16 ans):
```sql
SELECT COUNT(*) FROM ct_intervenants
WHERE UPPER(last_name) = UPPER(?)
  AND UPPER(name) = UPPER(?)
  AND date_of_birth = ?
```

**Résultat:**
- **COUNT = 0** → ❌ **BLOQUER** avec message:
  ```
  ❌ JOUEUR INTROUVABLE DANS LE SYSTÈME

  Ce joueur n'existe pas dans la base de données.

  ➤ Le type "RETOUR PRÊT" est réservé aux joueurs déjà enregistrés qui étaient en PRÊT dans votre club.

  ➤ Veuillez utiliser "NOUVELLE LICENCE" pour enregistrer un nouveau joueur.
  ```
- **COUNT > 0** → ✅ Continuer

---

### ÉTAPE 3: Vérifier PRÊT dans les 4 dernières saisons

**Objectif:** Vérifier que le joueur était en PRÊT dans votre club.

**Table:** `ct_team_intervenants` avec **INNER JOIN** sur `ct_intervenants`

**LOGIQUE:**
- Saison < saison actuelle
- Saison > saison actuelle - 4 (dans les 4 dernières saisons)
- Type licence = PRÊT (5) UNIQUEMENT
- Dans le même club (teamId)

#### Pour CADETS+ (≥16 ans):

```sql
SELECT COUNT(*) FROM ct_team_intervenants ti
INNER JOIN ct_intervenants i ON ti.ct_intervenant_id = i.ct_intervenant_id
WHERE ti.ct_team_id = ?
  AND ti.ct_intervenant_type_id = 1
  AND (i.cin_number = ? OR i.passport_num = ?)
  AND ti.ct_season_id < ?
  AND ti.ct_season_id > ? - 4
  AND ti.ct_type_licence_id = 5
```

#### Pour <CADETS (<16 ans):

```sql
SELECT COUNT(*) FROM ct_team_intervenants ti
INNER JOIN ct_intervenants i ON ti.ct_intervenant_id = i.ct_intervenant_id
WHERE ti.ct_team_id = ?
  AND ti.ct_intervenant_type_id = 1
  AND UPPER(i.last_name) = UPPER(?)
  AND UPPER(i.name) = UPPER(?)
  AND i.date_of_birth = ?
  AND ti.ct_season_id < ?
  AND ti.ct_season_id > ? - 4
  AND ti.ct_type_licence_id = 5
```

**Résultat:**
- **COUNT = 0** → ❌ **BLOQUER** avec message:
  ```
  ❌ JOUEUR N'ÉTAIT PAS EN PRÊT DANS VOTRE CLUB

  Ce joueur n'a pas été en PRÊT dans votre club au cours des 4 dernières saisons.

  ➤ Le type "RETOUR PRET" est réservé aux joueurs qui étaient en PRÊT dans votre club.

  ➤ Veuillez utiliser l'un des types suivants :

     • RENOUVELLEMENT : Si le joueur était dans votre club l'année dernière avec un contrat normal
     • MUTATION : Si le joueur vient d'un autre club de la même ligue
     • TRANSFERT : Si le joueur est transféré d'un autre club
  ```
- **COUNT > 0** → ✅ Continuer

---

### ÉTAPE 4: Vérifier doublons dans ct_demandes

#### Pour CADETS+ (≥16 ans):
```sql
SELECT COUNT(*) FROM ct_demandes
WHERE ct_team_id = ?
  AND ct_season_id = ?
  AND ct_type_licence_id = 3
  AND (cin_number = ? OR passport_num = ?)
  AND ct_demande_statu_id != 0
```

#### Pour <CADETS (<16 ans):
```sql
SELECT COUNT(*) FROM ct_demandes
WHERE ct_team_id = ?
  AND ct_season_id = ?
  AND ct_type_licence_id = 3
  AND UPPER(last_name) = UPPER(?)
  AND UPPER(name) = UPPER(?)
  AND date_of_birth = ?
  AND ct_demande_statu_id != 0
```

**Résultat:**
- **COUNT > 0** → ❌ **BLOQUER**
- **COUNT = 0** → ✅ **AUTORISER**

---

### REQUÊTE D'ÉLIGIBILITÉ: Récupérer la liste des joueurs éligibles

Cette requête est utilisée par l'endpoint `/joueurs-eligibles-retour-pret` pour afficher la liste des joueurs disponibles pour un retour prêt.

```sql
SELECT
    i.ct_intervenant_id as id,
    i.name as nom,
    i.last_name as prenom,
    i.licence_num as licenceNum
FROM sss_competition_db.ct_intervenants i
WHERE i.ct_intervenant_id IN (
    SELECT beanDiv.ct_intervenant_id
    FROM sss_competition_db.ct_team_intervenants AS beanDiv
    INNER JOIN (
        SELECT MAX(teamPlayer.ct_season_id) AS ct_season_id,
               teamPlayer.ct_intervenant_id AS ct_intervenant_id
        FROM sss_competition_db.ct_team_intervenants AS teamPlayer
        WHERE teamPlayer.ct_season_id < ?
          AND teamPlayer.ct_intervenant_type_id = 1
          AND teamPlayer.ct_season_id > ? - 4
        GROUP BY ct_intervenant_id
    ) AS MAX USING (ct_season_id, ct_intervenant_id)
    WHERE beanDiv.ct_team_id = ?
      AND beanDiv.ct_type_licence_id IN (5, 6)  -- PRÊT et RENOUVELLEMENT SPÉCIAL
      AND beanDiv.ct_intervenant_type_id = 1
)
ORDER BY i.licence_num ASC
```

**Paramètres:**
- `?` (1er) = currentSeasonId
- `?` (2ème) = currentSeasonId (pour calcul - 4)
- `?` (3ème) = teamId

**Logique:**
1. Sous-requête interne: Trouve la DERNIÈRE saison où chaque joueur a joué (MAX)
2. Filtre: Saison < actuelle ET dans les 4 dernières années
3. JOIN: Récupère les détails de cette dernière saison
4. Filtre final: Équipe = teamId ET Type licence = 5 ou 6 (PRÊT)
5. Résultat: Liste unique de joueurs sans doublons

---

## 🔍 TYPE 4: MUTATION

### Description
Transfert d'un joueur venant d'un autre club.

### Règles de validation
*À définir - Prochaine étape*

---

## 🔍 TYPE 5: PRÊT

### Description
Prêt temporaire d'un joueur à une autre équipe.

### Règles de validation
*À définir - Prochaine étape*

---

## 🔍 TYPE 9: RETOUR DE MUTATION

### Description
Demande pour un joueur qui **a fait une MUTATION (Type 4)** vers une autre équipe dans la saison actuelle et dont **votre club était l'équipe d'ORIGINE** (avant la mutation).

### ✅ STATUT: IMPLÉMENTÉ
- **Validateur:** `ReturnFromMutationValidator.java`
- **Endpoint d'éligibilité:** `/api/v1/demandes-players/joueurs-eligibles-retour-mutation`
- **Méthode service:** `getJoueursEligiblesRetourMutation()`

**Note importante:** Ce type permet à l'équipe d'origine de récupérer son joueur après qu'il ait muté vers une autre équipe.

### Règles de validation

#### Principe
Le joueur doit:
1. ✅ **Exister dans ct_intervenants** (déjà enregistré dans le système)
2. ✅ **Avoir fait une MUTATION (Type 4) dans la saison ACTUELLE vers une AUTRE équipe**
3. ✅ **L'équipe demandant le retour doit être l'équipe d'ORIGINE du joueur** (avant la mutation)
4. ✅ **Ne pas avoir de demande de retour mutation en cours pour cette saison**

---

### ÉTAPE 1: Déterminer l'âge et les critères de recherche

Même logique que les autres types:
- **CADETS+ (≥16 ans)**: Recherche par `cin_number` OU `passport_num`
- **<CADETS (<16 ans)**: Recherche par `last_name` + `name` + `date_of_birth`

---

### ÉTAPE 2: Vérifier que le joueur EXISTE dans ct_intervenants

⚠️ Le joueur **DOIT exister** dans le système.

Même requêtes que RENOUVELLEMENT APRÈS PRÊT.

---

### ÉTAPE 3: Vérifier MUTATION dans la saison ACTUELLE et équipe d'origine

**Objectif:** Vérifier que:
1. Le joueur a une MUTATION (Type 4) dans la saison actuelle
2. L'équipe demandant le retour était l'équipe d'ORIGINE du joueur (avant la mutation)

**Table:** `ct_team_intervenants` avec **INNER JOIN** sur `ct_intervenants`

Cette validation se fait en une seule requête qui vérifie:
- Le joueur a une MUTATION (Type 4) dans la saison actuelle (n'importe quelle équipe)
- L'équipe PRÉCÉDENTE du joueur (avant cette mutation) était l'équipe demandée

**Note:** Cette logique est implémentée dans `ReturnFromMutationValidator.java` via les méthodes `hasMutationInCurrentSeason()` et `hadPreviousLicenceInTeam()`.

#### Pour CADETS+ (≥16 ans):

**Vérifier mutation actuelle:**
```sql
SELECT COUNT(*) FROM ct_team_intervenants ti
INNER JOIN ct_intervenants i ON ti.ct_intervenant_id = i.ct_intervenant_id
WHERE ti.ct_season_id = ?
  AND ti.ct_intervenant_type_id = 1
  AND ti.ct_type_licence_id = 4
  AND (i.cin_number = ? OR i.passport_num = ?)
```

**Vérifier équipe d'origine:**
```sql
SELECT COUNT(*) FROM ct_team_intervenants ti
INNER JOIN ct_intervenants i ON ti.ct_intervenant_id = i.ct_intervenant_id
WHERE ti.ct_team_id = ?
  AND ti.ct_intervenant_type_id = 1
  AND (i.cin_number = ? OR i.passport_num = ?)
  AND ti.ct_season_id < ?
  AND ti.ct_type_licence_id NOT IN (5, 6)
```

**Résultat:**
- **Mutation actuelle = 0** → ❌ **BLOQUER** "Ce joueur n'a pas de MUTATION active dans la saison actuelle"
- **Équipe d'origine = 0** → ❌ **BLOQUER** "Votre club n'était pas l'équipe d'origine de ce joueur"
- **Les deux > 0** → ✅ Continuer

---

### ÉTAPE 4: Vérifier doublons dans ct_demandes

#### Pour CADETS+ (≥16 ans):
```sql
SELECT COUNT(*) FROM ct_demandes
WHERE ct_team_id = ?
  AND ct_season_id = ?
  AND ct_type_licence_id = 9
  AND (cin_number = ? OR passport_num = ?)
  AND ct_demande_statu_id != 0
```

#### Pour <CADETS (<16 ans):
```sql
SELECT COUNT(*) FROM ct_demandes
WHERE ct_team_id = ?
  AND ct_season_id = ?
  AND ct_type_licence_id = 9
  AND UPPER(last_name) = UPPER(?)
  AND UPPER(name) = UPPER(?)
  AND date_of_birth = ?
  AND ct_demande_statu_id != 0
```

**Résultat:**
- **COUNT > 0** → ❌ **BLOQUER**
- **COUNT = 0** → ✅ **AUTORISER**

---

### REQUÊTE D'ÉLIGIBILITÉ: Récupérer la liste des joueurs éligibles

Cette requête est utilisée par l'endpoint `/joueurs-eligibles-retour-mutation` pour afficher la liste des joueurs disponibles pour un retour mutation.

```sql
SELECT
    i.ct_intervenant_id as id,
    i.name as nom,
    i.last_name as prenom,
    i.licence_num as licenceNum
FROM sss_competition_db.ct_intervenants i
WHERE i.ct_intervenant_id IN (
    SELECT beanDiv.ct_intervenant_id
    FROM sss_competition_db.ct_team_intervenants AS beanDiv
    WHERE beanDiv.ct_type_licence_id = 4
      AND beanDiv.ct_intervenant_type_id = 1
      AND beanDiv.ct_season_id = ?
      AND (
        SELECT teamPlayerOld.ct_team_id
        FROM sss_competition_db.ct_team_intervenants AS teamPlayerOld
        WHERE teamPlayerOld.ct_team_intervenant_id = (
            SELECT MAX(teamPlayer.ct_team_intervenant_id)
            FROM sss_competition_db.ct_team_intervenants AS teamPlayer
            WHERE teamPlayer.ct_team_intervenant_id < beanDiv.ct_team_intervenant_id
              AND teamPlayer.ct_intervenant_id = beanDiv.ct_intervenant_id
            GROUP BY teamPlayer.ct_intervenant_id
        )
      ) = ?
)
ORDER BY i.licence_num ASC
```

**Paramètres:**
- `?` (1er) = currentSeasonId
- `?` (2ème) = teamId

**Logique:**
1. Trouve tous les joueurs avec Type 4 (MUTATION) dans la saison actuelle
2. Pour CHAQUE joueur avec mutation:
   - Trouve son enregistrement PRÉCÉDENT (ct_team_intervenant_id < enregistrement actuel)
   - Utilise MAX(ct_team_intervenant_id) pour obtenir l'enregistrement juste AVANT la mutation
   - Récupère le ct_team_id de cet enregistrement précédent
3. Filtre: Ne garde que les joueurs dont l'équipe précédente = teamId demandé
4. Résultat: Liste des joueurs qui ont muté DEPUIS votre équipe vers une autre équipe

**Exemple concret:**
- Joueur A était dans équipe 201 en 2024 (ct_team_intervenant_id = 100)
- Joueur A a fait MUTATION vers équipe 305 en 2025 (ct_team_intervenant_id = 150, type = 4)
- Si teamId = 201, le joueur A sera éligible pour RETOUR MUTATION
- L'équipe 201 peut demander le retour du joueur A

---

## 🔍 TYPE 8: TRANSFERT

### Description
*À définir - différence avec Type 3?*

### Règles de validation
*À définir - Prochaine étape*

---

## 📝 NOTES IMPORTANTES

### Statuts des demandes
- `ct_demande_statu_id = 0` : Demande annulée/rejetée (on ne la compte PAS)
- `ct_demande_statu_id != 0` : Tous les autres statuts (actifs)

### Noms de colonnes
⚠️ **ATTENTION** aux noms de colonnes:
- ✅ `cin_number` (pas `cin_num`)
- ✅ `passport_num` (pas `passport_number`)

### Comparaison de texte
Toujours utiliser `UPPER()` pour les comparaisons de nom/prénom:
```sql
UPPER(last_name) = UPPER(?)
```

### Paramètres NULL
Toujours vérifier si les paramètres sont NULL avant d'exécuter une requête.

---

## 🛠️ IMPLÉMENTATION TECHNIQUE

### Structure du validateur
Chaque type de licence a son propre validateur:
- `NouvelleLicenceValidator.java` - Type 1 (NOUVELLE LICENCE) ✅
- `RenewalValidator.java` - Type 2 (RENOUVELLEMENT) ✅
- `RenewalAfterLoanValidator.java` - Type 3 (RETOUR PRÊT) ✅
- `MutationValidator.java` - Type 4 (MUTATION) - à créer
- `PretValidator.java` - Type 5 (PRÊT) - à créer
- `ReturnFromMutationValidator.java` - Type 9 (RETOUR MUTATION) ✅
- Etc.

### Endpoints d'éligibilité
Chaque type de licence dispose d'un endpoint pour récupérer la liste des joueurs éligibles:
- `/api/v1/demandes-players/joueurs-eligibles-renouvellement` - Type 2 ✅
- `/api/v1/demandes-players/joueurs-eligibles-retour-pret` - Type 3 ✅
- `/api/v1/demandes-players/joueurs-eligibles-retour-mutation` - Type 9 ✅

### Orchestration
Le `ValidationOrchestrator` appelle le bon validateur selon `ct_type_licence_id`.

### Retour de validation
```java
ValidationResult {
  boolean isValid;          // true = OK, false = erreurs
  List<String> errors;      // Messages d'erreur
  List<String> warnings;    // Messages d'avertissement (optionnel)
}
```

---

## 📅 HISTORIQUE

| Date | Version | Changements |
|------|---------|-------------|
| 2024-10-28 | 1.0 | Création du guide avec logique NOUVELLE LICENCE |
| 2025-01-XX | 2.0 | Ajout de RENOUVELLEMENT (Type 2), RETOUR PRÊT (Type 3), RETOUR MUTATION (Type 9) |
| 2025-01-XX | 2.1 | Ajout des requêtes d'éligibilité pour Types 2, 3 et 9 |
| 2025-01-XX | 2.2 | Correction des numéros de types selon la base de données réelle |

---

## ✅ TODO

### Validateurs implémentés ✅
- [x] Type 1: NOUVELLE LICENCE - `NouvelleLicenceValidator.java` ✅
- [x] Type 2: RENOUVELLEMENT - `RenewalValidator.java` ✅
- [x] Type 3: RETOUR PRÊT - `RenewalAfterLoanValidator.java` ✅
- [x] Type 9: RETOUR MUTATION - `ReturnFromMutationValidator.java` ✅

### Endpoints d'éligibilité implémentés ✅
- [x] Type 2: `/joueurs-eligibles-renouvellement` ✅
- [x] Type 3: `/joueurs-eligibles-retour-pret` ✅
- [x] Type 9: `/joueurs-eligibles-retour-mutation` ✅

### À implémenter
- [ ] Type 4: MUTATION standard - Créer `MutationValidator.java`
- [ ] Type 5: PRÊT - Créer `PretValidator.java`
- [ ] Type 8: TRANSFERT - Clarifier la différence avec autres types
- [ ] Type 11: LIBRE (AMATEUR) - Définir les règles
- [ ] Type 12, 13, 14: Autres types - À documenter
