#!/usr/bin/env python3
# -*- coding: utf-8 -*-


# Ce script compile l'ensemble du cours de mathématiques

import time
start_time = time.perf_counter()

import os
import re
import subprocess
import datetime



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
        raw_titre = match_titre.group(1).strip()
        clean = raw_titre.replace(r"\numchap", "")
        clean = re.sub(r"^[\d\s\.\-:\\]+", "", clean)
        titre_chapitre = clean.strip()
        
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
    print("\n1. Analyse des chapitres")
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
            
            if "cours_complet" in dirname: continue 

            tex_files = [f for f in os.listdir(dir_path) if f.endswith(".tex") and "template" not in f and "preambule" not in f]
            
            if tex_files:
                tex_path = os.path.join(dir_path, tex_files[0])
                titre, contenu = get_chapter_content(tex_path)
                if titre and contenu:
                    chapters_found.append({
                        "num": num, "titre": titre, "contenu": contenu
                    })
                    print(f"  > Chapitre {num:02d} : {titre}")

    if not chapters_found:
        print("Aucun chapitre trouvé.")
        return

    chapters_found.sort(key=lambda x: x["num"])
    
    print("\n2. Construction du fichier LaTeX")
    
    master = []
    master.append(r"\documentclass[a4paper,12pt]{report}")
    
    if not os.path.exists("preambule_global.tex") and os.path.exists(os.path.join(PARENT_DIR, "preambule_global.tex")):
        master.append(r"\input{../preambule_global.tex}")
    else:
        master.append(r"\input{preambule_global.tex}")

    master.append(r"\newcommand{\numchap}{0}") 
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
    master.append(r"{\Large \textsc{Notes de}}\\[0.2cm]")
    master.append(r"{\Huge \textbf{\textsc{Cours de Mathématiques}}}\\[1cm]")
    master.append(r"{\large éditées par \textsc{Jean Decroocq}}\\[0.1cm]")
    master.append(r"{\large d’après l’enseignement de M. \textsc{Ngambou}}\\[8cm]")
    master.append(r"{\large CPGE TSI 1 -- 2025/2026\\[0.1cm]}")
    master.append(r"{\large Lycée polyvalent de Cachan}")
    master.append(r"\end{center}")
    master.append(r"\vfill")
    
    # Pied de page
    master.append(r"\begin{center}")
    date_jour = datetime.date.today().strftime('%d/%m/%Y')
    master.append(f"\\scriptsize Dernière mise à jour : {date_jour}" + r"\\")
    master.append(r"{\scriptsize Communiquer une anomalie~: \texttt{jeandecroocq@hotmail.com}}")
    master.append(r"\end{center}")
    master.append(r"\newpage")
    
    
    # --- AVANT-PROPOS ---
    master.append(r"\phantomsection")
    master.append(r"\titleformat{name=\chapter, numberless}[block]{\centering}{}{0pt}{" + 
                  r"\parbox{0.7\textwidth}{\centering\linespread{0.65}\selectfont\Large\bfseries\scshape #1}}")

    master.append(r"\chapter*{Avant-propos}")
    master.append(r"\thispagestyle{empty}")
    
    master.append(r"Le présent document constitue une retranscription numérique des enseignements de mathématiques que j'ai reçus en première année de classe préparatoire aux grandes écoles, au sein de la filière technologie et sciences industrielles. Ma démarche a procédé avant tout d'une conviction pédagogique : la valeur de ce recueil, bien qu'il soit mis librement à disposition, réside moins dans sa consultation finale que dans le processus intellectuel de son élaboration. C'est dans l'exigence de la transcription, de la mise en forme et dans mon goût pour l'établissement de documents scientifiques que s'est véritablement opérée l'appropriation des concepts.")
    master.append(r"")
    
    master.append(r"Si l'aspect numérique offre l'avantage d'une accessibilité permanente, permettant de consulter ce cours en tout lieu et à tout instant, ce travail a été conçu comme le prolongement de mes notes manuscrites prises en séance. J'ai ainsi conservé l'architecture et l'essentiel des formulations du cours magistral de mon professeur, tout en y apportant quelques inflexions personnelles. J'ai notamment fait le choix d'écarter la quasi-totalité des démonstrations afin de privilégier un support concis, tout en adaptant ponctuellement certains énoncés ou figures pour soutenir ma propre compréhension.")
    master.append(r"")

    master.append(r"Il convient de souligner que ce document est le fruit d'un travail étudiant réalisé lors de mon apprentissage. Malgré la rigueur que j'ai cherché à y insuffler, il n'est pas exempt d'erreurs ou de coquilles dont je porte l'entière responsabilité. La vigilance du lecteur reste donc de mise.")
    master.append(r"")

    master.append(r"Enfin, bien que la composition sous \LaTeX{} témoigne de mon intérêt pour l'esthétique mathématique, la typographie employée ici s'est autorisée des libertés vis-à-vis des normes de rédaction conventionnelles. Ces choix ont privilégié une lisibilité personnelle et une structure visuelle adaptée à mes propres besoins.")
    
    
    # --- SOMMAIRE ---
    master.append(r"\newpage")
    master.append(r"{") 
    master.append(r"\pagestyle{empty}")
    master.append(r"\assignpagestyle{\chapter}{empty}")
    
    master.append(r"\phantomsection")
    master.append(r"\label{toc}")
    master.append(r"\titleformat{name=\chapter, numberless}[block]{\centering}{}{0pt}{" + 
                  r"\parbox{0.7\textwidth}{\centering\linespread{0.65}\selectfont\Large\bfseries\scshape #1}}")
    
    master.append(r"\tableofcontents")
    master.append(r"\newpage")
    master.append(r"}")



    # --- INJECTION DES CHAPITRES ---
    for chap in chapters_found:
        master.append(f"\n% --- Chapitre {chap['num']} ---")
        master.append(f"\\renewcommand{{\\numchap}}{{{chap['num']}}}")
        master.append(f"\\setcounter{{chapter}}{{{chap['num'] - 1}}}")
        master.append(f"\\chapter{{{chap['titre']}}}")
        master.append(chap['contenu'])

    master.append(r"\begin{center}")
    master.append(r"\Large\textbf{FIN}")
    master.append(r"\\ \large\hyperref[toc]{Revenir au début}")
    master.append(r"\end{center}")
    master.append(r"\end{document}")






    tex_file = OUTPUT_FILENAME + ".tex"
    with open(tex_file, 'w', encoding='utf-8') as f:
        f.write("\n".join(master))
        
    print(f"  > Fichier prêt !")

    print("\n3. Compilations LaTeX")
    
    for i in range(1, 4):
        print(f"  > Passe {i}/3 ... ", end="", flush=True)
        subprocess.run(["pdflatex", "-interaction=nonstopmode", tex_file], check=False, stdout=subprocess.DEVNULL)
        print("Fait !")
    
    end_time = time.perf_counter()
    duree = end_time - start_time
    print(f"\n\nSuccès ! Document généré en {duree:.0f} s.")


if __name__ == "__main__":
    generate_tex()