from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
from emotion_agent import EmotionAgent

app = Flask(__name__)
CORS(app)
emotion_agent = EmotionAgent()

# Load the trained model
model_path = "models/FER_model.h5"
try:
    model = tf.keras.models.load_model(model_path)
    print(f"✅ Successfully loaded model from {model_path}")
except FileNotFoundError:
    print(f"⚠️ Warning: Model file not found at {model_path}")
    model = None

def preprocess_image(image):
    """Convert image to required model input format"""
    image = image.convert("L")  # Grayscale
    image = image.resize((48, 48))
    image = np.array(image, dtype=np.float32) / 255.0
    image = np.expand_dims(image, axis=-1)  # Shape: (48, 48, 1)
    image = np.expand_dims(image, axis=0)   # Shape: (1, 48, 48, 1)
    return image

@app.route("/")
def home():
    return jsonify({"message": "Flask backend is running!"})

@app.route("/predict", methods=["POST"])
def predict():
    class_names = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']

    try:
        if not model:
            return jsonify({"error": "Model not loaded"}), 503
        if "image" not in request.files:
            return jsonify({"error": "No image provided"}), 400

        image_file = request.files["image"]
        image = Image.open(image_file).convert("RGB")  
        input_image = preprocess_image(image)
        predictions = model.predict(input_image)
        emotion_label = class_names[np.argmax(predictions)]

        # Create dictionary with all emotions and their confidence scores (in percentage)
        all_emotions = {
            class_names[i].lower(): float(predictions[0][i] * 100)
            for i in range(len(class_names))
        }

        return jsonify({
            "prediction": emotion_label,
            "confidence": float(np.max(predictions)),
            "all_emotions": all_emotions
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json or {}

    new_chat = data.get("new_chat", False)
    if new_chat:
        emotion_agent.reset()
        return jsonify({"response": ""}), 200

    user_message = data.get("message", "").strip()
    image_data = data.get("image")
    emotion = data.get("emotion", "").strip().capitalize()
    confidence = float(data.get("confidence", 0.0))

    # Generate message if missing and emotion is present
    emotion_context = ""
    if emotion and confidence > 0:
        emotion_context = f"{emotion} ({confidence:.1f}%)"
        if not user_message:
            user_message = (
                f"I'm feeling {emotion.lower()} with about {confidence:.1f}% intensity. "
                f"Can you suggest something to help with this mood?"
            )
        elif "Detected emotions" not in user_message:
            user_message += f" (Detected emotions: {emotion_context})"
    elif not user_message:
        return jsonify({"error": "No message provided and emotion context missing."}), 400

    try:
        emotion_data = [{
            "emotion": emotion,
            "confidence": confidence
        }] if emotion and confidence > 0 else None

        response, error = emotion_agent.chat(user_message, image_data, emotion_data)

        if error:
            status_code = 500 if "API Error" in error else 400
            return jsonify({"error": error}), status_code

        # Return the response in markdown format
        return jsonify({"response": response, "format": "markdown"}), 200

    except Exception as e:
        print(f"[Error] Exception in /chat: {e}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    app.run(debug=True)
