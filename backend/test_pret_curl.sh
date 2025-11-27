#!/bin/bash

# ========================================
# 🧪 SCRIPT DE TEST CURL POUR PRÊT
# ========================================

BASE_URL="http://localhost:8082/api/v1/demandes-players"

echo "======================================"
echo "🧪 TESTS VALIDATEUR PRÊT (Type 5)"
echo "======================================"
echo ""

# ========================================
# TEST 1: PRÊT PROFESSIONNEL
# ========================================
echo "📝 TEST 1: PRÊT PROFESSIONNEL (Régime PRO)"
echo "--------------------------------------"
curl -X POST "$BASE_URL" \
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
  }' | json_pp
echo ""
echo ""

# ========================================
# TEST 2: PRÊT SEMI-PROFESSIONNEL
# ========================================
echo "📝 TEST 2: PRÊT SEMI-PROFESSIONNEL"
echo "--------------------------------------"
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "teamId": 201,
    "seasonId": 2025,
    "typeLicenceId": 5,
    "regimeId": 3,
    "cinNumber": "TEST23456",
    "lastName": "TESTEUR",
    "name": "SemiPro",
    "dateOfBirth": "1996-02-15"
  }' | json_pp
echo ""
echo ""

# ========================================
# TEST 3: PRÊT AMATEUR LIGUE I
# ========================================
echo "📝 TEST 3: PRÊT AMATEUR LIGUE I"
echo "--------------------------------------"
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "teamId": 201,
    "seasonId": 2025,
    "typeLicenceId": 5,
    "regimeId": 1,
    "cinNumber": "TEST34567",
    "lastName": "TESTEUR",
    "name": "AmateurL1",
    "dateOfBirth": "1997-03-20"
  }' | json_pp
echo ""
echo ""

# ========================================
# TEST 4: PRÊT AMATEUR LIGUE II
# ========================================
echo "📝 TEST 4: PRÊT AMATEUR LIGUE II"
echo "--------------------------------------"
echo "Note: Utiliser une équipe en Ligue II (ex: teamId=202)"
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "teamId": 202,
    "seasonId": 2025,
    "typeLicenceId": 5,
    "regimeId": 1,
    "cinNumber": "TEST45678",
    "lastName": "TESTEUR",
    "name": "AmateurL2",
    "dateOfBirth": "1998-04-25"
  }' | json_pp
echo ""
echo ""

# ========================================
# TEST 5: PRÊT AMATEUR LIGUE III
# ========================================
echo "📝 TEST 5: PRÊT AMATEUR LIGUE III"
echo "--------------------------------------"
echo "Note: Utiliser une équipe en Ligue III (ex: teamId=203)"
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "teamId": 203,
    "seasonId": 2025,
    "typeLicenceId": 5,
    "regimeId": 1,
    "cinNumber": "TEST56789",
    "lastName": "TESTEUR",
    "name": "AmateurL3",
    "dateOfBirth": "1999-05-30"
  }' | json_pp
echo ""
echo ""

# ========================================
# TEST 6: Joueur inexistant (doit échouer)
# ========================================
echo "📝 TEST 6: JOUEUR INEXISTANT (doit échouer)"
echo "--------------------------------------"
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "teamId": 201,
    "seasonId": 2025,
    "typeLicenceId": 5,
    "regimeId": 2,
    "cinNumber": "INEXISTANT99999",
    "lastName": "INEXISTANT",
    "name": "Joueur",
    "dateOfBirth": "1990-01-01"
  }' | json_pp
echo ""
echo ""

# ========================================
# TEST 7: Doublon (doit échouer)
# ========================================
echo "📝 TEST 7: DOUBLON (doit échouer)"
echo "--------------------------------------"
echo "Tentative de créer une 2ème demande pour le même joueur..."
curl -X POST "$BASE_URL" \
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
  }' | json_pp
echo ""
echo ""

# ========================================
# TEST 8: Validation d'une demande existante
# ========================================
echo "📝 TEST 8: VALIDATION COMPLÈTE"
echo "--------------------------------------"
echo "Entrez l'ID de la demande à valider (ou appuyez sur Entrée pour sauter):"
read DEMANDE_ID

if [ ! -z "$DEMANDE_ID" ]; then
  echo "Validation de la demande ID: $DEMANDE_ID"
  curl -X POST "$BASE_URL/$DEMANDE_ID/validate-complete" \
    -H "Content-Type: application/json" | json_pp
  echo ""
fi

echo ""
echo "======================================"
echo "✅ Tests terminés"
echo "======================================"
