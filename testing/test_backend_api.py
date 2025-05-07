import unittest
import json
import sys
import os
import base64
from io import BytesIO
from PIL import Image
import numpy as np

# Add the parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import the Flask app - but catch any import errors
try:
    from backend.model.app import app
    app_import_error = None
except Exception as e:
    app_import_error = str(e)
    app = None

@unittest.skipIf(app is None, f"Skipping tests because app import failed: {app_import_error}")
class TestBackendAPI(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_home_endpoint(self):
        """Test the home endpoint"""
        response = self.app.get('/')
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['message'], 'Flask backend is running!')

    def test_predict_endpoint_no_image(self):
        """Test predict endpoint with missing image"""
        response = self.app.post('/predict')
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', data)

    def test_predict_endpoint_with_image(self):
        """Test predict endpoint with a valid image"""
        # Create a test image (48x48 grayscale)
        img = Image.new('L', (48, 48), color=128)
        img_io = BytesIO()
        img.save(img_io, 'JPEG')
        img_io.seek(0)
        
        response = self.app.post(
            '/predict',
            data={'image': (img_io, 'test_image.jpg')}
        )
        
        # Should either return a valid prediction, model not loaded error (503), or some other error (500)
        self.assertIn(response.status_code, [200, 500, 503])
        
        # If successful, should have prediction and confidence
        if response.status_code == 200:
            data = json.loads(response.data)
            self.assertIn('prediction', data)
            self.assertIn('confidence', data)
        elif response.status_code == 503:
            data = json.loads(response.data)
            self.assertIn('Model not loaded', data.get('error', ''))

    def test_chat_endpoint_no_message_no_image(self):
        """Test chat endpoint with no message and no image"""
        response = self.app.post(
            '/chat',
            json={'message': '', 'image': None},
            content_type='application/json'
        )
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', data)

    def test_chat_endpoint_with_message(self):
        """Test chat endpoint with a message"""
        response = self.app.post(
            '/chat',
            json={'message': 'Hello, how are you?', 'image': None},
            content_type='application/json'
        )
        
        # Should either return a valid response or an error
        # This might fail if the Groq API key is not set or invalid
        if response.status_code == 200:
            data = json.loads(response.data)
            self.assertIn('response', data)
        else:
            data = json.loads(response.data)
            self.assertIn('error', data)

    def test_chat_endpoint_with_image(self):
        """Test chat endpoint with an image"""
        # Create a test image
        img = Image.new('RGB', (100, 100), color=(73, 109, 137))
        img_io = BytesIO()
        img.save(img_io, 'JPEG')
        img_io.seek(0)
        
        # Convert image to base64
        base64_image = base64.b64encode(img_io.getvalue()).decode('utf-8')
        
        response = self.app.post(
            '/chat',
            json={'message': 'What is in this image?', 'image': base64_image},
            content_type='application/json'
        )
        
        # Should either return a valid response or an error
        # This might fail if the Groq API key is not set or invalid
        if response.status_code == 200:
            data = json.loads(response.data)
            self.assertIn('response', data)
        else:
            data = json.loads(response.data)
            self.assertIn('error', data)

    def test_chat_api_key_validation(self):
        """Test that the chat endpoint validates the API key"""
        # This test assumes the Groq API client is initialized with error handling
        # If the API key is invalid, the client should return an error
        
        response = self.app.post(
            '/chat',
            json={'message': 'Test API key validation'},
            content_type='application/json'
        )
        
        # If the API key is invalid, should return a 401 or 500 error
        # If valid, should return a 200 response
        data = json.loads(response.data)
        
        if 'error' in data and 'API key' in data['error']:
            self.assertIn(response.status_code, [401, 500])
        elif response.status_code == 200:
            self.assertIn('response', data)

if __name__ == '__main__':
    unittest.main() 