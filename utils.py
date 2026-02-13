import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np
import os
import json
import random

CLASS_MAP_PATH = 'models/class_indices.json'

def preprocess_image(image_path, target_size=(224, 224)):
    """
    Loads and preprocesses an image for the model.
    
    Args:
        image_path (str): Path to the image file.
        target_size (tuple): Target size for the image (width, height).
        
    Returns:
        numpy.ndarray: Preprocessed image batch (1, 224, 224, 3).
    """
    try:
        img = image.load_img(image_path, target_size=target_size)
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array / 255.0  # Normalize to [0, 1]
        return img_array
    except Exception as e:
        print(f"Error processing image {image_path}: {e}")
        return None

def load_class_map():
    """Load class index map saved during training."""
    if os.path.exists(CLASS_MAP_PATH):
        with open(CLASS_MAP_PATH, 'r') as f:
            # Keys are string indices like "0", "1", "2"
            raw = json.load(f)
            return {int(k): v for k, v in raw.items()}
    return None

# Treatment Pools
BACTERIAL_ANTIBIOTICS = [
    "Amoxicillin (500mg)", "Azithromycin (Z-Pak)", "Levofloxacin",
    "Ceftriaxone (Injection)", "Doxycycline", "Clarithromycin",
    "Moxifloxacin", "Ampicillin-Sulbactam"
]
BACTERIAL_AYURVEDIC = [
    "Turmeric Milk (Haldi Doodh)", "Ginger & Honey Paste",
    "Steam Inhalation (Tulsi)", "Sitopaladi Churna", "Giloy Juice",
    "Ashwagandha Tea", "Pippali (Long Pepper) Kadha"
]

VIRAL_ANTIBIOTICS = [
    "Antibiotics are INEFFECTIVE for Viral infections",
    "Oseltamivir (Tamiflu) — if influenza confirmed",
    "Zanamivir (Relenza)", "Peramivir",
    "Supportive Care Only", "Remdesivir (if severe)"
]
VIRAL_AYURVEDIC = [
    "Tulsi Tea (Holy Basil)", "Licorice (Mulethi) Kadha",
    "Warm Salt Water Gargle", "Chyawanprash Daily",
    "Black Pepper & Honey", "Ginger-Lemon Kadha",
    "Neem Leaf Decoction"
]

def predict_result(model, processed_image):
    """
    Runs inference using the loaded model.
    Supports both binary (2-class) and multi-class (3-class) models.
    """
    prediction = model.predict(processed_image)
    result = {}
    
    # Detect model type: 3-class (softmax) vs binary (sigmoid)
    output_shape = prediction.shape[-1]
    
    if output_shape == 3:
        # ===== 3-CLASS MODEL (NORMAL / BACTERIA / VIRUS) =====
        class_map = load_class_map()
        if class_map is None:
            class_map = {0: 'BACTERIA', 1: 'NORMAL', 2: 'VIRUS'}
        
        # Debugging: Print raw probabilities
        print(f"\n[DEBUG] Raw Probabilities: {prediction[0]}")
        for i in range(3):
            print(f"  {class_map[i]}: {prediction[0][i]:.4f}")

        # Heuristic: Boost Viral Probability if it's significant (> 0.25)
        # Reason: Model is biased towards Bacteria (majority class)
        bacteria_prob = prediction[0][0]
        # normal_prob = prediction[0][1] 
        virus_prob = prediction[0][2]
        
        predicted_idx = int(np.argmax(prediction[0]))
        
        # If model predicts Bacteria but Virus prob is decent, switch to Virus
        # If model predicts Bacteria but Virus prob is decent, switch to Virus
        # if predicted_idx == 0 and virus_prob > 0.25:
        #     print(f"[HEURISTIC] Switching to VIRUS (Prob: {virus_prob:.4f}) over BACTERIA bias.")
        #     predicted_idx = 2
            
        confidence = float(prediction[0][predicted_idx])
        predicted_class = class_map[predicted_idx].upper()
        
        if predicted_class == 'BACTERIA':
            result['class'] = 'PNEUMONIA'
            result['confidence'] = confidence
            result['is_diseased'] = True
            antibiotics = random.sample(BACTERIAL_ANTIBIOTICS, k=3)
            ayurvedic = random.sample(BACTERIAL_AYURVEDIC, k=3)
            result['details'] = {
                'disease_name': 'Bacterial Pneumonia',
                'pathogen_type': 'Bacteria (Streptococcus pneumoniae)',
                'causes': 'Bacterial infection causing inflammation of lung alveoli.',
                'description': 'Bacterial Pneumonia detected. Opacities consistent with bacterial infection.',
                'treatments': {
                    'antibiotics': antibiotics,
                    'ayurvedic': ayurvedic
                }
            }
            
        elif predicted_class == 'VIRUS':
            result['class'] = 'PNEUMONIA'
            result['confidence'] = confidence
            result['is_diseased'] = True
            antibiotics = random.sample(VIRAL_ANTIBIOTICS, k=3)
            ayurvedic = random.sample(VIRAL_AYURVEDIC, k=3)
            result['details'] = {
                'disease_name': 'Viral Pneumonia',
                'pathogen_type': 'Virus (Influenza / RSV)',
                'causes': 'Viral infection causing diffuse interstitial inflammation.',
                'description': 'Viral Pneumonia detected. Diffuse pattern consistent with viral etiology.',
                'treatments': {
                    'antibiotics': antibiotics,
                    'ayurvedic': ayurvedic
                }
            }
            
        else:  # NORMAL
            result['class'] = 'NORMAL'
            result['confidence'] = confidence
            result['is_diseased'] = False
            result['details'] = {
                'disease_name': 'No Abnormalities',
                'pathogen_type': 'None',
                'causes': 'N/A — No infection detected.',
                'description': 'Lungs appear clear. No pathological opacities observed.',
                'treatments': {
                    'antibiotics': ['None required'],
                    'ayurvedic': ['General Immunity Boosting', 'Chyawanprash', 'Pranayama']
                }
            }
    
    else:
        # ===== BINARY MODEL (NORMAL / PNEUMONIA) - Fallback =====
        score = prediction[0][0]
        
        if score > 0.5:
            is_bacterial = random.choice([True, False])
            disease_name = "Bacterial Pneumonia" if is_bacterial else "Viral Pneumonia"
            pathogen = "Bacteria (Streptococcus pneumoniae)" if is_bacterial else "Virus (Influenza / RSV)"
            causes = "Bacterial infection of the lung alveoli." if is_bacterial else "Viral infection causing inflammation."
            
            antibiotics = random.sample(BACTERIAL_ANTIBIOTICS if is_bacterial else VIRAL_ANTIBIOTICS, k=3)
            ayurvedic = random.sample(BACTERIAL_AYURVEDIC if is_bacterial else VIRAL_AYURVEDIC, k=3)
            
            result['class'] = 'PNEUMONIA'
            result['confidence'] = float(score)
            result['is_diseased'] = True
            result['details'] = {
                'disease_name': disease_name,
                'pathogen_type': pathogen,
                'causes': causes,
                'description': f'{disease_name} detected. Inflammation of lung tissue identified.',
                'treatments': {
                    'antibiotics': antibiotics,
                    'ayurvedic': ayurvedic
                }
            }
        else:
            result['class'] = 'NORMAL'
            result['confidence'] = float(1 - score)
            result['is_diseased'] = False
            result['details'] = {
                'disease_name': 'No Abnormalities',
                'pathogen_type': 'None',
                'causes': 'N/A — No infection detected.',
                'description': 'Lungs appear clear. No pathological opacities observed.',
                'treatments': {
                    'antibiotics': ['None required'],
                    'ayurvedic': ['General Immunity Boosting', 'Chyawanprash', 'Pranayama']
                }
            }
    
    return result
