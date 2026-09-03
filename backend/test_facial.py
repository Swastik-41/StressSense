import os
import sys

# Add backend to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.facial_service import get_facial_model
import cv2
import numpy as np
import base64

def test_model():
    model = get_facial_model()
    if not model:
        print("Failed to get model")
        return
        
    print("Model loaded successfully")
    
    # Create a dummy image
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    
    # Encode to base64
    _, buffer = cv2.imencode('.jpg', img)
    base64_image = "data:image/jpeg;base64," + base64.b64encode(buffer).decode('utf-8')
    
    result = model.process_frame(base64_image)
    print("Result:", result)

if __name__ == "__main__":
    test_model()
