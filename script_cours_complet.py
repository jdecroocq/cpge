#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re
import subprocess
import datetime

# --- CONFIGURATION ---
PARENT_DIR = ".." 
OUTPUT_FILENAME = "cours_complet_math_tsi1_jean_decroocq"




REGEX_TITRE = r"\\textbf\{\\textsc\{(.*?)\}\}"

def get_repere():
    now = datetime.datetime.now()
    raw = f"01_math_{now.strftime('%y%m%d%H%M')}"
    return raw.replace('_', r'\_') 

def get_chapter_content(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Erreur lecture {filepath}: {e}")
        return None, None
    
    match_titre = re.search(REGEX_TITRE, content)
    titre_chapitre = "Chapitre Sans Titre"
    
    if match_titre:
        titre_chapitre = match_titre.group(1).strip()
        
    match_body = re.search(r'\\begin\{document\}(.*?)\\end\{document\}', content, re.DOTALL)
    
    if not match_body:
        return None, None
    
    body = match_body.group(1)
    match_titre_body = re.search(REGEX_TITRE, body)
    
    if match_titre_body:
        fin_titre_idx = match_titre_body.end()
        reste_apres_titre = body[fin_titre_idx:]
        match_end_center = re.search(r'\\end\{center\}', reste_apres_titre)
        if match_end_center:
            debut_contenu = fin_titre_idx + match_end_center.end()
            clean_body = body[debut_contenu:].strip()
        else:
            clean_body = body
    else:
        clean_body = body
    return titre_chapitre, clean_body

def generate_tex():
    print("--- 1. Scan des dossiers ---")
    try:
        all_items = os.listdir(PARENT_DIR)
    except FileNotFoundError:
        print(f"Erreur: Dossier {PARENT_DIR} introuvable.")
        return

    dirs = sorted([d for d in all_items if os.path.isdir(os.path.join(PARENT_DIR, d))])
    chapters_found = []

    for dirname in dirs:
        match_num = re.match(r"^(\d+)_", dirname)
        if match_num:
            num = int(match_num.group(1))
            dir_path = os.path.join(PARENT_DIR, dirname)
            tex_files = [f for f in os.listdir(dir_path) if f.endswith(".tex")]
            if tex_files:
                tex_path = os.path.join(dir_path, tex_files[0])
                titre, contenu = get_chapter_content(tex_path)
                if titre and contenu:
                    chapters_found.append({
                        "num": num, "titre": titre, "contenu": contenu
                    })
                    print(f"  > Ajout Chapitre {num}: {titre}")

    if not chapters_found:
        print("Aucun chapitre trouvé.")
        return

    chapters_found.sort(key=lambda x: x["num"])
    
    print(f"--- 2. Génération du fichier .tex ---")
    
    master = []
    master.append(r"\documentclass[a4paper,12pt]{report}")
    master.append(r"\input{preambule_global.tex}")
    master.append(r"\begin{document}")
    
    # --- PAGE DE GARDE ---
    repere = get_repere()
    master.append(r"\setcounter{page}{1}")
    master.append(r"\thispagestyle{empty}")
    
    master.append(r"\noindent")
    master.append(r"\begin{minipage}[t]{0.4\textwidth}")
    master.append(f"\\small {repere}") 
    master.append(r"\end{minipage}")
    
    master.append(r"\vspace*{9cm}")
    master.append(r"\begin{center}")
    
    # Titre Principal
    master.append(r"{\Large \textsc{Notes de}}\\[0.2cm]")
    master.append(r"{\Huge \textbf{\textsc{Cours de Mathématiques}}}\\[1cm]")
    
    # Auteurs
    master.append(r"{\large éditées par \textsc{Jean Decroocq}}\\[0.1cm]")
    master.append(r"{\large d’après l’enseignement de M. \textsc{Ngambou}}\\[8cm]")
    
    # Contexte
    master.append(r"{\large CPGE TSI 1 -- 2025/2026\\[0.1cm]}")
    master.append(r"{\large Lycée polyvalent de Cachan}")
    
    master.append(r"\end{center}")
    
    master.append(r"\vfill")
    
    # Pied de page (Date + Contact)
    master.append(r"\begin{center}")
    date_jour = datetime.date.today().strftime('%d/%m/%Y')
    master.append(f"\scriptsize Dernière mise à jour : {date_jour}\\\\")
    master.append(r"{\scriptsize Signaler une erreur : \texttt{jeandecroocq@hotmail.com}}")
    master.append(r"\end{center}")
    
    master.append(r"\newpage")
    

    
    # --- SOMMAIRE ---
    master.append(r"\phantomsection")
    master.append(r"\label{toc}")
    master.append(r"\tableofcontents")
    master.append(r"\newpage")

    # --- CHAPITRES ---
    for chap in chapters_found:
        master.append(f"\n% --- Chapitre {chap['num']} ---")
        master.append(f"\\setcounter{{chapter}}{{{chap['num'] - 1}}}")
        master.append(f"\\chapter{{{chap['titre']}}}")
        master.append(chap['contenu'])



    master.append(r"\begin{center}")
    master.append(r"\Large\textbf{FIN}")
    
    # --- LIEN VERS DEBUT ---
    master.append(r"\vfill")
    master.append(r"\large\hyperref[toc]{\textbf{Revenir au début}}")
    master.append(r"\end{center}")

    master.append(r"\end{document}")

    
    tex_file = OUTPUT_FILENAME + ".tex"
    with open(tex_file, 'w', encoding='utf-8') as f:
        f.write("\n".join(master))
        
    print(f"--- 3. Compilations LaTeX ---")
    
    for i in range(1, 4):
        print(f"  > Compilation {i}/3...")
        result = subprocess.run(["pdflatex", "-interaction=nonstopmode", tex_file], check=False, stdout=subprocess.DEVNULL)
        if result.returncode != 0:
            print(f"    (Warning: Erreurs détectées, continuation...)")
    
    print(f"\n[FIN] {OUTPUT_FILENAME}.pdf généré.")

if __name__ == "__main__":
    generate_tex()