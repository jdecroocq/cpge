import os
import shutil
import re
import datetime


PARENT_DIR = ".." 

def main():
    print("--- RASSEMBLEMENT DES FICHES PDF ---")


    current_dir = os.getcwd()
    for item in os.listdir(current_dir):
        if os.path.isdir(item) and item.startswith("full_"):
            print(f"Suppression de l'ancien dossier : {item}")
            shutil.rmtree(item)


    date_str = datetime.datetime.now().strftime("%y%m%d")
    dest_dir_name = f"full_{date_str}"
    dest_dir_path = os.path.join(current_dir, dest_dir_name)
    
    os.makedirs(dest_dir_path)
    print(f"Création du dossier : {dest_dir_name}")


    if not os.path.exists(PARENT_DIR):
        print(f"Erreur : Dossier {PARENT_DIR} introuvable.")
        return

    all_items = os.listdir(PARENT_DIR)

    target_dirs = []
    for d in all_items:
        full_path = os.path.join(PARENT_DIR, d)
        match = re.match(r'^(\d+)_', d)
        if os.path.isdir(full_path) and match:
            target_dirs.append({
                'path': full_path,
                'num': match.group(1),
                'name': d
            })
    
    target_dirs.sort(key=lambda x: int(x['num']))

    count = 0

    for item in target_dirs:
        src_folder = item['path']
        num_chap = item['num']
        
        files = os.listdir(src_folder)
        for f in files:
            if f.endswith(".pdf"):

                if "template" in f.lower() or "preambule" in f.lower():
                    continue

                src_file = os.path.join(src_folder, f)
                

                if f.startswith(f"{num_chap}"):
                    new_filename = f
                else:
                    new_filename = f"{num_chap}_{f}"
                
                dst_file = os.path.join(dest_dir_path, new_filename)
                
                shutil.copy2(src_file, dst_file)
                print(f"  > Copié : {new_filename}")
                count += 1

    print(f"\n--- TERMINÉ ---")
    print(f"{count} fiches copiées dans le dossier '{dest_dir_name}'.")

if __name__ == "__main__":
    main()
