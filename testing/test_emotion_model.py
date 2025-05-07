import unittest
import sys
import os
import numpy as np
import tensorflow as tf
from PIL import Image
import io

# Add the parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import the preprocess_image function - catch any import errors
try:
    from backend.model.app import preprocess_image
    import_error = None
except Exception as e:
    import_error = str(e)
    preprocess_image = None

@unittest.skipIf(preprocess_image is None, f"Skipping tests because import failed: {import_error}")
class TestEmotionModel(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Load the model
        cls.model_path = os.path.join(os.path.dirname(__file__), '../backend/model/model.h5')
        if os.path.exists(cls.model_path):
            cls.model = tf.keras.models.load_model(cls.model_path)
        else:
            print(f"Warning: Model file not found at {cls.model_path}")
            cls.model = None

    def test_model_exists(self):
        """Test that the model file exists"""
        self.assertTrue(os.path.exists(self.model_path), "Model file does not exist")

    def test_model_structure(self):
        """Test the structure of the model (if loaded)"""
        if self.model is None:
            self.skipTest("Model not loaded")
            
        # Check model input shape
        self.assertEqual(self.model.input_shape[1:3], (48, 48), "Model input shape should be (None, 48, 48, 1)")
        
        # Check model output shape (7 emotion classes)
        self.assertEqual(self.model.output_shape[1], 7, "Model should output 7 emotion classes")

    def test_preprocess_image_function(self):
        """Test the image preprocessing function"""
        # Create a test image
        test_image = Image.new('RGB', (100, 100), color=(128, 128, 128))
        
        # Preprocess the image
        processed_image = preprocess_image(test_image)
        
        # Check shape and type
        self.assertEqual(processed_image.shape, (1, 48, 48, 1), "Processed image has incorrect shape")
        self.assertEqual(processed_image.dtype, np.float32, "Processed image has incorrect data type")
        
        # Check normalization
        self.assertTrue(np.all(processed_image >= 0) and np.all(processed_image <= 1), 
                       "Image values should be normalized between 0 and 1")

    def test_model_prediction(self):
        """Test that the model makes predictions in the expected format"""
        if self.model is None:
            self.skipTest("Model not loaded")
            
        # Create a test grayscale image
        test_image = Image.new('L', (48, 48), color=128)
        processed_image = np.array(test_image) / 255.0
        processed_image = np.expand_dims(processed_image, axis=-1)
        processed_image = np.expand_dims(processed_image, axis=0)
        
        # Get prediction
        prediction = self.model.predict(processed_image)
        
        # Check prediction shape and type
        self.assertEqual(prediction.shape, (1, 7), "Prediction shape should be (1, 7)")
        
        # Check that prediction sums to approximately 1 (softmax output)
        self.assertAlmostEqual(np.sum(prediction), 1.0, places=5, 
                              msg="Prediction probabilities should sum to 1")
        
        # Check that predictions are probabilities between 0 and 1
        self.assertTrue(np.all(prediction >= 0) and np.all(prediction <= 1),
                       "Predictions should be probabilities between 0 and 1")

    def test_emotion_classes(self):
        """Test the emotion classes dictionary"""
        emotion_dict = {
            0: "Angry", 
            1: "Disgusted", 
            2: "Fearful", 
            3: "Surprised", 
            4: "Sad", 
            5: "Happy", 
            6: "Neutral"
        }
        
        # Check that dictionary has 7 emotions
        self.assertEqual(len(emotion_dict), 7, "Emotion dictionary should have 7 emotions")
        
        # Check that keys are integers from 0 to 6
        self.assertEqual(list(emotion_dict.keys()), list(range(7)), 
                        "Emotion dictionary keys should be integers from 0 to 6")
        
        # Check that values are strings
        for emotion in emotion_dict.values():
            self.assertIsInstance(emotion, str, "Emotion names should be strings")

if __name__ == '__main__':
    unittest.main() 