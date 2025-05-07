import unittest
from emotion_agent import EmotionAgent
import os
import base64

class TestEmotionAgent(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.agent = EmotionAgent()
        cls.test_predictions = [
            {"emotion": "Happy", "confidence": 85.3},
            {"emotion": "Neutral", "confidence": 12.1},
            {"emotion": "Sad", "confidence": 2.6}
        ]
        
        # Load test image
        image_path = "d:/Vibe_Vision/login_signup/backend/model/ubaid.jpg"
        try:
            with open(image_path, "rb") as image_file:
                cls.test_image = base64.b64encode(image_file.read()).decode('utf-8')
        except FileNotFoundError:
            cls.test_image = None
            print(f"Warning: Test image not found at {image_path}")

    def test_text_with_emotions(self):
        response, error = self.agent.chat(
            "How do I look?",
            None,
            self.test_predictions
        )
        self.assertIsNone(error)
        self.assertIn("Happy", response)

    def test_image_with_emotions(self):
        if not self.test_image:
            self.skipTest("No test image available")
            
        response, error = self.agent.chat(
            "What emotion do you see?",
            self.test_image,
            self.test_predictions
        )
        self.assertIsNone(error)
        self.assertIsNotNone(response)

    def test_image_only(self):
        if not self.test_image:
            self.skipTest("No test image available")
            
        response, error = self.agent.chat(
            None,
            self.test_image,
            None
        )
        self.assertIsNone(error)
        self.assertIsNotNone(response)

    def test_text_only(self):
        response, error = self.agent.chat(
            "How are you feeling?",
            None,
            None
        )
        self.assertIsNone(error)
        self.assertIsNotNone(response)

if __name__ == "__main__":
    unittest.main()