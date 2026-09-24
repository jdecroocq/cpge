#!/usr/bin/env bash
# Fusionne 2526/, 2627/ et global/ dans un unique dossier main/
# À lancer depuis la racine du repo cloné en local (là où se trouve list.json)
set -euo pipefail

SRC_DIRS=(2526 2627 global)
# Pas de dossier de destination : les matières (01_math, 02_pc, ...) vont directement à la racine.

for src in "${SRC_DIRS[@]}"; do
  if [ ! -d "$src" ]; then
    echo "Attention: dossier $src introuvable, ignoré."
    continue
  fi
  echo "Fusion de $src/ -> racine"
  # git mv préserve l'historique git des fichiers, contrairement à mv + git add
  find "$src" -type f | while read -r file; do
    rel="${file#"$src"/}"                 # ex: 01_math/cours_eb_tsi1.pdf
    destfile="$rel"
    mkdir -p "$(dirname "$destfile")"
    if [ -e "$destfile" ]; then
      echo "  COLLISION: $destfile existe déjà (venant d'un autre dossier source). Fichier NON déplacé: $file"
      continue
    fi
    git mv "$file" "$destfile"
  done
done

echo
echo "Suppression des dossiers source désormais vides..."
for src in "${SRC_DIRS[@]}"; do
  if [ -d "$src" ]; then
    find "$src" -type d -empty -delete
  fi
done

echo
echo "Terminé. Vérifie 'git status' avant de commit."
echo "N'oublie pas de remplacer list.json par la version fusionnée."
