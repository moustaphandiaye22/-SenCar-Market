#!/bin/bash
BASE_URL="https://sencar-market.onrender.com"
echo "Testing public / GET endpoints on $BASE_URL ..."

endpoints=(
  "/api/hello"
  "/api/vehicules"
  "/api/locations/annonces"
  "/api/garages/actifs"
  "/api/assurances/produits"
  "/api/abonnements/plans"
  "/api/certifications/vehicules"
  "/api/avis"
)

for ep in "${endpoints[@]}"; do
  echo -n "GET $BASE_URL$ep : "
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$ep")
  if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "201" ]; then
    echo -e "\e[32mSUCCESS ($RESPONSE)\e[0m"
  elif [ "$RESPONSE" = "401" ] || [ "$RESPONSE" = "403" ]; then
    echo -e "\e[33mPROTECTED ($RESPONSE)\e[0m"
  else
    echo -e "\e[31mFAIL ($RESPONSE)\e[0m"
  fi
done
