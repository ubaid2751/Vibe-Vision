from groq import Groq
import os
import time
from dotenv import load_dotenv

MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"

class EmotionAgent:
    def __init__(self):
        load_dotenv()
        self.client = self._initialize_groq_client()
        self.system_prompt = (
            "You are a compassionate and insightful AI companion, acting as a personal advisor and therapist. "
            "Offer empathetic, thoughtful guidance to support emotional well-being, tailored to the user's needs. "
            "Keep responses concise, warm, and encouraging, fostering a safe and understanding space."
            "Dont send any abrupt messages in reply. Keep it to the point."
        )

    def _initialize_groq_client(self):
        try:
            api_key = os.getenv('GROQ_API_KEY')
            if not api_key:
                raise ValueError("GROQ_API_KEY not found in environment variables")
            print("Groq client initialized successfully")
            return Groq(api_key=api_key)
        except Exception as e:
            print(f"Error initializing Groq client: {str(e)}")
            return None

    def chat(self, user_message=None, image_data=None, emotion_predictions=None):
        if not self.client:
            return None, "API Error: Groq client not initialized"

        if not user_message and not image_data:
            return None, "No message or image provided"

        text_content = self.test_emotion_detection(user_message, emotion_predictions)

        if image_data:
            try:
                # Process image to ensure optimal resolution
                processed_image = self.process_image(image_data)
                
                messages = []
                messages.append({
                    "role": "user",
                    "content": [
                        {
                            "type": "text", 
                            "text": text_content.strip()
                        },
                        {
                            "type": "image_url",
                            "image_url": 
                            {
                                "url": f"data:image/jpeg;base64,{processed_image}",
                                "detail": "high"
                            }
                        }
                    ]
                })
                model = MODEL
                print("Using vision model for image analysis")
            except Exception as e:
                return None, f"Failed to process image data: {str(e)}"
        else:
            messages = [{"role": "system", "content": self.system_prompt}]
            messages.append({"role": "user", "content": text_content})
            model = "llama-3.3-70b-versatile"
            print("Using text model for conversation")

        try:
            chat_completion = self.client.chat.completions.create(
                messages=messages,
                model=model,
                temperature=0.3,
                max_tokens=1000,
                top_p=1,
                stream=False,
                stop=None
            )
            response = chat_completion.choices[0].message.content
            
            if emotion_predictions:
                top_emotion = emotion_predictions[0]['emotion']
                if top_emotion.lower() not in response.lower():
                    print(f"Warning: Top emotion '{top_emotion}' not mentioned in response")
                    response = f"[Based on your {top_emotion.lower()} expression] {response}"
            
            return response, None
            
        except Exception as e:
            return None, f"API Error: {str(e)}"

    def test_emotion_detection(self, user_message, emotion_predictions):
        """Test helper to verify emotion detection formatting"""
        text_content = user_message if user_message else ""
        
        if emotion_predictions:
            text_content += "\n\n[Detected Emotions:"
            for pred in emotion_predictions:
                text_content += f"\n- {pred['emotion']}: {pred['confidence']:.1f}%"
            text_content += "]"
        
        return text_content

    def reset(self):
        """Reset the chat history/session"""
        # Currently just reinitialize the client
        self.client = self._initialize_groq_client()
        print("Chat session reset")

    # Add this method after the test_emotion_detection method
    def process_image(self, image_data, target_resolution=(1024, 1024)):
        """
        Process image data to ensure optimal resolution for LLM analysis
        
        Args:
            image_data: Base64 encoded image or image bytes
            target_resolution: Desired resolution as (width, height)
            
        Returns:
            Processed base64 encoded image
        """
        import base64
        from io import BytesIO
        from PIL import Image
        
        try:
            # Check if image_data is already base64 encoded
            if isinstance(image_data, str):
                # Decode base64 to bytes
                image_bytes = base64.b64decode(image_data)
            else:
                # Assume it's already bytes
                image_bytes = image_data
                
            # Open image with PIL
            img = Image.open(BytesIO(image_bytes))
            
            # Resize image to target resolution while maintaining aspect ratio
            img.thumbnail(target_resolution, Image.Resampling.LANCZOS)
            
            # Save to BytesIO object with high quality
            buffer = BytesIO()
            img.save(buffer, format="JPEG", quality=95)
            buffer.seek(0)
            
            # Encode back to base64
            processed_image = base64.b64encode(buffer.getvalue()).decode('utf-8')
            
            return processed_image
        except Exception as e:
            print(f"Error processing image: {str(e)}")
            return image_data  # Return original if processing fails

if __name__ == "__main__":
    agent = EmotionAgent()
    print("EmotionAgent initialized. Use test.py for comprehensive testing.")