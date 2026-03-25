#!/bin/bash
TOTAL_ENDPOINTS=$(grep -o '@Get(\|@Post(\|@Put(\|@Patch(\|@Delete(' $(find Backend/src/modules -name "*.controller.ts") | wc -l)
echo "Total Endpoints actuels: $TOTAL_ENDPOINTS"

# Analyse brute des controllers pour voir la distribution
echo "Distribution par module :"
for file in $(find Backend/src/modules -name "*.controller.ts"); do
  COUNT=$(grep -o '@Get(\|@Post(\|@Put(\|@Patch(\|@Delete(' "$file" | wc -l)
  MODULE_NAME=$(basename $(dirname "$file"))
  echo " - $MODULE_NAME : $COUNT endpoints"
done
