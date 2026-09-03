import requests
import base64
import time
import os
import cv2
import numpy as np

API_URL = "http://localhost:8000/api"

def create_dummy_image():
    # Create a simple 64x64 gray image as a dummy face
    img = np.ones((64, 64, 3), dtype=np.uint8) * 128
    _, buffer = cv2.imencode('.jpg', img)
    b64 = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/jpeg;base64,{b64}"

def test_flow():
    print("Starting test flow...")
    
    headers = {"Authorization": "Bearer mock_token_test-user"}
    
    # 1. Start Assessment
    res = requests.post(f"{API_URL}/assessment/start", headers=headers)
    res.raise_for_status()
    data = res.json()
    assessment_id = data["id"]
    print(f"Assessment Started. ID: {assessment_id}")
    
    # 2. Answer 30 questions
    for i in range(30):
        # Fetch next question
        q_res = requests.get(f"{API_URL}/assessment/{assessment_id}/next-question", headers=headers)
        q_res.raise_for_status()
        q_data = q_res.json()
        
        if q_data["id"] == "completed":
            print(f"Assessment early completed at question {i+1}")
            break
            
        print(f"Q{i+1}: {q_data['question_text']}")
        options = q_data["options"]
        selected_option = options[2] if len(options) > 2 else options[-1] # Middle or last option
        
        # Submit answer
        ans_res = requests.post(f"{API_URL}/assessment/{assessment_id}/answer", json={"selected_option": selected_option}, headers=headers)
        ans_res.raise_for_status()
        
    # 3. Complete Assessment
    print("Completing Assessment with mock facial data...")
    comp_res = requests.post(f"{API_URL}/assessment/{assessment_id}/complete", json={
        "total_frames_processed": 10,
        "successful_frames": 8,
        "happy_total": 5.0,
        "neutral_total": 2.0,
        "sad_total": 1.0
    }, headers=headers)
    comp_res.raise_for_status()
    print("Assessment completed successfully.")
    
    # 4. Fetch Result
    print("Fetching results...")
    res_data = requests.get(f"{API_URL}/assessment/{assessment_id}/result", headers=headers)
    res_data.raise_for_status()
    result = res_data.json()
    print(f"Result: {result}")
    
    # 5. Fetch History
    print("Fetching history...")
    hist_res = requests.get(f"{API_URL}/assessment/history/list", headers=headers)
    hist_res.raise_for_status()
    print(f"History count: {len(hist_res.json())}")
    
    print("All tests passed.")

if __name__ == "__main__":
    test_flow()
