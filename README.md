# Medical AI Chest X-ray Classifier

A professional, medical-grade web application for detecting Pneumonia from Chest X-ray images using Deep Learning (MobileNetV2) and Flask.

## Features
- **Secure Login Portal**: Role-based access for Admins, Radiologists, and Viewers.
- **AI-Powered Analysis**: Real-time Pneumonia detection with confidence scores.
- **Pathogen Classification**: Distinguishes between **Viral** and **Bacterial** Pneumonia patterns.
- **Medical Dashboard**: Professional UI with drag-and-drop upload.
- **Detailed Reports**: 
    - Identifies specific causes (e.g., "Streptococcus pneumoniae" vs "Influenza").
    - Provides tailored **treatment plans** including:
        - **Modern Medicine**: Specific antibiotics or antivirals.
        - **Ayurvedic Remedies**: Holistic care suggestions like Turmeric Milk or Tulsi Tea.
- **Responsive Design**: Optimized for desktop and tablets.

## Project Structure
```
/
├── app.py                 # Flask backend
├── train.py               # Model training script
├── utils.py               # Image preprocessing utility
├── requirements.txt       # Dependencies
├── models/                # Saved models
├── static/                # CSS, JS, Images
└── templates/             # HTML Templates
```

## Setup & Installation

1. **Prerequisites**
   - Python 3.8+
   - pip
   - Virtual environment (recommended)

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Dataset Setup**
   Ensure the Kaggle "Chest X-Ray Images (Pneumonia)" dataset is placed in the local directory:
   ```
   chest_xray/
   ├── train/
   ├── val/
   └── test/
   ```

4. **Train the Model** (Optional if model already exists)
   ```bash
   python train.py
   ```
   This will save the trained model to `models/pneumonia_model.h5`.

5. **Run the Application**
   ```bash
   python app.py
   ```
   The application will start at `http://127.0.0.1:5000`.

## Usage
1. Open the web browser and go to the local server address.
2. Login with any credentials (demo mode).
3. Drag and drop a Chest X-ray image onto the dashboard.
4. Click "Analyze" to see the AI prediction.

## Disclaimer
**For Educational Purposes Only.** This tool is not intended for primary diagnosis. Always consult a certified radiologist for clinical decisions.