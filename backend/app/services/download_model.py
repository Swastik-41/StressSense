import os
import urllib.request

def download_models():
    models_dir = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    # Download ONNX Emotion Model (FERPlus)
    emotion_model_url = "https://github.com/onnx/models/raw/main/validated/vision/body_analysis/emotion_ferplus/model/emotion-ferplus-8.onnx"
    emotion_model_path = os.path.join(models_dir, "emotion-ferplus-8.onnx")
    
    if not os.path.exists(emotion_model_path):
        print(f"Downloading emotion model to {emotion_model_path}...")
        urllib.request.urlretrieve(emotion_model_url, emotion_model_path)
        print("Emotion model downloaded.")
    else:
        print("Emotion model already exists.")
        
    # Download Haar Cascade for face detection
    cascade_url = "https://raw.githubusercontent.com/opencv/opencv/master/data/haarcascades/haarcascade_frontalface_default.xml"
    cascade_path = os.path.join(models_dir, "haarcascade_frontalface_default.xml")
    
    if not os.path.exists(cascade_path):
        print(f"Downloading Haar cascade to {cascade_path}...")
        urllib.request.urlretrieve(cascade_url, cascade_path)
        print("Haar cascade downloaded.")
    else:
        print("Haar cascade already exists.")

if __name__ == "__main__":
    download_models()
