import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
import os
import json

# Configuration
BATCH_SIZE = 32
IMG_SIZE = (224, 224)
EPOCHS = 25
LEARNING_RATE = 0.0001
NUM_CLASSES = 3  # NORMAL, BACTERIA, VIRUS

DATA_DIR = 'chest_xray_3class'
TRAIN_DIR = os.path.join(DATA_DIR, 'train')
VAL_DIR = os.path.join(DATA_DIR, 'val')
TEST_DIR = os.path.join(DATA_DIR, 'test')
MODEL_SAVE_PATH = 'models/pneumonia_model.h5'
CLASS_MAP_PATH = 'models/class_indices.json'

def build_model():
    """Builds the MobileNetV2 based 3-class model with fine-tuning."""
    base_model = MobileNetV2(
        weights='imagenet',
        include_top=False,
        input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3)
    )
    
    # Fine-tune: Unfreeze the top 30 layers of MobileNetV2
    # This allows the model to learn X-ray specific features
    base_model.trainable = True
    for layer in base_model.layers[:-30]:
        layer.trainable = False
    
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.4)(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.3)(x)
    predictions = Dense(NUM_CLASSES, activation='softmax')(x)
    
    model = Model(inputs=base_model.input, outputs=predictions)
    
    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def main():
    # Verify directories exist
    if not os.path.exists(TRAIN_DIR):
        print(f"Error: Training directory not found at {TRAIN_DIR}")
        print("Run 'python reorganize_dataset.py' first to create the 3-class dataset.")
        return

    # Data Augmentation (stronger augmentation for better generalization)
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=25,
        width_shift_range=0.1,
        height_shift_range=0.1,
        zoom_range=0.2,
        shear_range=0.15,
        horizontal_flip=True,
        brightness_range=[0.8, 1.2],
        fill_mode='nearest',
        validation_split=0.15  # Use 15% of training data as validation
    )
    
    val_test_datagen = ImageDataGenerator(rescale=1./255)
    
    print("Loading 3-Class Training Data...")
    train_generator = train_datagen.flow_from_directory(
        TRAIN_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=True,
        subset='training'  # Use 85% for training
    )
    
    print("Loading Validation Data (split from training)...")
    val_generator = train_datagen.flow_from_directory(
        TRAIN_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=False,
        subset='validation'  # Use 15% for validation
    )
    
    # Save class indices for inference
    os.makedirs('models', exist_ok=True)
    class_indices = train_generator.class_indices
    inverted = {v: k for k, v in class_indices.items()}
    with open(CLASS_MAP_PATH, 'w') as f:
        json.dump(inverted, f, indent=2)
    print(f"Class mapping saved: {inverted}")
    
    # Build Model
    model = build_model()
    
    trainable_count = sum(1 for layer in model.layers if layer.trainable)
    print(f"Trainable layers: {trainable_count}")
    
    # Callbacks
    callbacks = [
        ModelCheckpoint(
            filepath=MODEL_SAVE_PATH,
            monitor='val_accuracy',
            save_best_only=True,
            mode='max',
            verbose=1
        ),
        EarlyStopping(
            monitor='val_accuracy',
            patience=7,
            mode='max',
            restore_best_weights=True,
            verbose=1
        ),
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=3,
            min_lr=1e-7,
            verbose=1
        )
    ]
    
    # Calculate class weights for imbalance
    from sklearn.utils import class_weight
    import numpy as np

    # Get class labels from generator
    train_classes = train_generator.classes
    class_indices = train_generator.class_indices
    # Invert to map index -> name
    idx_to_class = {v: k for k, v in class_indices.items()}
    
    # Calculate weights
    class_weights = class_weight.compute_class_weight(
        class_weight='balanced',
        classes=np.unique(train_classes),
        y=train_classes
    )
    class_weights_dict = dict(enumerate(class_weights))
    
    print("\nClass Weights calculated:")
    for idx, weight in class_weights_dict.items():
        print(f"  {idx} ({idx_to_class[idx]}): {weight:.4f}")
    
    # Train
    print("Starting 3-Class Training with Class Weights...")
    history = model.fit(
        train_generator,
        epochs=EPOCHS,
        validation_data=val_generator,
        callbacks=callbacks,
        class_weight=class_weights_dict
    )
    
    print("Training Completed.")
    
    # Evaluate on Test Data
    if os.path.exists(TEST_DIR):
        print("Loading Test Data...")
        test_generator = val_test_datagen.flow_from_directory(
            TEST_DIR,
            target_size=IMG_SIZE,
            batch_size=BATCH_SIZE,
            class_mode='categorical',
            shuffle=False
        )
        
        loss, accuracy = model.evaluate(test_generator)
        print(f"\n===== FINAL RESULTS =====")
        print(f"Test Loss: {loss:.4f}")
        print(f"Test Accuracy: {accuracy*100:.2f}%")
        print(f"=========================")

if __name__ == '__main__':
    main()
