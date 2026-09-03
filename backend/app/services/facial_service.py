import cv2
import numpy as np
import onnxruntime
import os
import base64
import logging

logger = logging.getLogger("api")

class FacialExpressionModel:
    def __init__(self):
        models_dir = os.path.join(os.path.dirname(__file__), 'models')
        cascade_path = os.path.join(models_dir, 'haarcascade_frontalface_default.xml')
        model_path = os.path.join(models_dir, 'emotion-ferplus-8.onnx')
        
        self.face_cascade = cv2.CascadeClassifier(cascade_path)
        self.session = onnxruntime.InferenceSession(model_path)
        self.input_name = self.session.get_inputs()[0].name
        logger.info("MODEL LOADED: Facial expression model initialized successfully.")
        
    def process_frame(self, base64_image: str):
        try:
            logger.info("FACIAL FRAME RECEIVED")
            encoded_data = base64_image.split(',')[1]
            nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                logger.warning("Frame decode failed: img is None")
                return {"face_found": False, "happy": 0.0, "neutral": 0.0, "sad": 0.0}
                
            logger.info("[FACIAL] image decoded")
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            faces = self.face_cascade.detectMultiScale(
                gray, 
                scaleFactor=1.1, 
                minNeighbors=4, 
                minSize=(30, 30)
            )
            
            if len(faces) == 0:
                logger.info("No face detected in frame.")
                return {"face_found": False, "happy": 0.0, "neutral": 0.0, "sad": 0.0}
                
            logger.info("[FACIAL] face detected")
            x, y, w, h = sorted(faces, key=lambda f: f[2]*f[3], reverse=True)[0]
            face_roi = gray[y:y+h, x:x+w]
            
            face_resized = cv2.resize(face_roi, (64, 64))
            face_input = face_resized.astype(np.float32)
            face_input = np.expand_dims(face_input, axis=0)
            face_input = np.expand_dims(face_input, axis=0)
            
            logger.info("[FACIAL] model inference started")
            outputs = self.session.run(None, {self.input_name: face_input})
            scores = outputs[0][0]
            
            exp_scores = np.exp(scores - np.max(scores))
            probs = exp_scores / exp_scores.sum()
            
            neutral_prob = float(probs[0])
            happy_prob = float(probs[1])
            sad_prob = float(probs[3])
            
            pred = "neutral"
            if happy_prob > max(neutral_prob, sad_prob): pred = "happy"
            elif sad_prob > max(happy_prob, neutral_prob): pred = "sad"
            
            logger.info(f"[FACIAL] prediction = {pred}")
            logger.info(f"EXPRESSION PREDICTED: Happy: {happy_prob:.2f}, Neutral: {neutral_prob:.2f}, Sad: {sad_prob:.2f}")
            logger.info("[FACIAL] observation stored")
            
            return {
                "face_found": True,
                "happy": happy_prob,
                "neutral": neutral_prob,
                "sad": sad_prob
            }
        except Exception as e:
            logger.error(f"Error processing frame: {e}")
            return {"face_found": False, "happy": 0.0, "neutral": 0.0, "sad": 0.0}

model_instance = None

def get_facial_model():
    global model_instance
    if model_instance is None:
        try:
            model_instance = FacialExpressionModel()
        except Exception as e:
            logger.error(f"Error loading facial model: {e}")
            return None
    return model_instance
