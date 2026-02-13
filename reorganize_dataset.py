"""
Dataset Reorganization Script
Converts 2-class (NORMAL/PNEUMONIA) dataset into 3-class (NORMAL/BACTERIA/VIRUS)
by reading filename prefixes (bacteria_* / virus_*).
"""
import os
import shutil

SOURCE_BASE = 'chest_xray'
TARGET_BASE = 'chest_xray_3class'

SPLITS = ['train', 'val', 'test']

def reorganize():
    for split in SPLITS:
        src_normal = os.path.join(SOURCE_BASE, split, 'NORMAL')
        src_pneumonia = os.path.join(SOURCE_BASE, split, 'PNEUMONIA')
        
        dst_normal = os.path.join(TARGET_BASE, split, 'NORMAL')
        dst_bacteria = os.path.join(TARGET_BASE, split, 'BACTERIA')
        dst_virus = os.path.join(TARGET_BASE, split, 'VIRUS')
        
        os.makedirs(dst_normal, exist_ok=True)
        os.makedirs(dst_bacteria, exist_ok=True)
        os.makedirs(dst_virus, exist_ok=True)
        
        # Copy NORMAL images
        if os.path.exists(src_normal):
            for f in os.listdir(src_normal):
                shutil.copy2(os.path.join(src_normal, f), os.path.join(dst_normal, f))
            print(f"  [{split}] NORMAL: {len(os.listdir(src_normal))} files copied")
        
        # Split PNEUMONIA into BACTERIA and VIRUS based on filename
        if os.path.exists(src_pneumonia):
            bac_count = 0
            vir_count = 0
            for f in os.listdir(src_pneumonia):
                lower_f = f.lower()
                if 'bacteria' in lower_f:
                    shutil.copy2(os.path.join(src_pneumonia, f), os.path.join(dst_bacteria, f))
                    bac_count += 1
                elif 'virus' in lower_f:
                    shutil.copy2(os.path.join(src_pneumonia, f), os.path.join(dst_virus, f))
                    vir_count += 1
                else:
                    # Unknown, put in bacteria by default
                    shutil.copy2(os.path.join(src_pneumonia, f), os.path.join(dst_bacteria, f))
                    bac_count += 1
            print(f"  [{split}] BACTERIA: {bac_count}, VIRUS: {vir_count}")
    
    print("\nDone! New dataset at:", TARGET_BASE)

if __name__ == '__main__':
    print("Reorganizing dataset into 3 classes...")
    reorganize()
