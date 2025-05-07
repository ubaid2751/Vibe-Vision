#!/usr/bin/env python
"""
This script creates a simple dummy emotion detection model for testing purposes.
Run this script to create a model.h5 file in the backend/model directory.
"""

import os
import sys
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Conv2D, MaxPooling2D, Flatten, Dropout

def create_dummy_model(save_path):
    """Create a simple CNN model with the same structure as the real emotion detection model"""
    # Create model with the same input/output shape as the real model
    model = Sequential([
        Conv2D(32, kernel_size=(3, 3), activation='relu', input_shape=(48, 48, 1)),
        MaxPooling2D(pool_size=(2, 2)),
        Conv2D(64, kernel_size=(3, 3), activation='relu'),
        MaxPooling2D(pool_size=(2, 2)),
        Flatten(),
        Dense(128, activation='relu'),
        Dropout(0.5),
        Dense(7, activation='softmax')  # 7 emotion classes
    ])
    
    # Compile the model
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    
    # Save the model
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    model.save(save_path)
    print(f"Mock model saved to {save_path}")

if __name__ == "__main__":
    # Get the path to the backend model directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    backend_model_dir = os.path.join(script_dir, "..", "backend", "model")
    model_path = os.path.join(backend_model_dir, "model.h5")
    
    print("Creating mock emotion detection model for testing...")
    create_dummy_model(model_path)
    print("\nNOTE: This is a dummy model that hasn't been trained. It's only useful for testing the code structure.")
    print("For actual emotion detection, please use a properly trained model.") 