import requests
import pytest
import time
import base64
import cv2
import numpy as np

API_URL = "http://localhost:8000/api"

# Helper for mock token
def get_headers(uid="test-user-123"):
    return {"Authorization": f"Bearer mock_token_{uid}"}

def test_mock_auth_flow():
    # In Mock Mode, if we hit /me with a mock token, it should return the user profile.
    # If the user doesn't exist, it creates one.
    headers = get_headers("test-auth-user")
    res = requests.get(f"{API_URL}/users/me", headers=headers)
    assert res.status_code == 200, "Auth should succeed with valid mock token"
    data = res.json()
    assert "id" in data
    assert data["email"] == "test-auth-user@mock.com"
    
    # Missing Auth
    res_no_auth = requests.get(f"{API_URL}/users/me")
    assert res_no_auth.status_code in [401, 403], f"Unauthenticated access should be denied, got {res_no_auth.status_code}"
    
    # Invalid token
    res_invalid = requests.get(f"{API_URL}/users/me", headers={"Authorization": "Bearer invalid_token_123"})
    assert res_invalid.status_code == 401, "Invalid mock token should be denied"

def test_profile_creation_and_retrieval():
    headers = get_headers("test-profile-user")
    
    # Create profile
    payload = {
        "age": 22,
        "gender": "Boy",
        "student_status": "Student",
        "academic_level": "Undergraduate"
    }
    res = requests.put(f"{API_URL}/users/me", json=payload, headers=headers)
    assert res.status_code == 200
    
    # Retrieve profile
    res2 = requests.get(f"{API_URL}/users/me", headers=headers)
    data = res2.json()
    assert data["age"] == 22
    assert data["gender"] == "Boy"
    
def test_adaptive_engine():
    headers = get_headers("test-adaptive-user")
    
    # Start assessment
    res = requests.post(f"{API_URL}/assessment/start", headers=headers)
    assert res.status_code == 200
    assessment_id = res.json()["id"]
    
    questions_seen = set()
    
    for i in range(30):
        q_res = requests.get(f"{API_URL}/assessment/{assessment_id}/next-question", headers=headers)
        q_data = q_res.json()
        
        assert q_data["id"] != "completed", f"Should not complete early. Stopped at {i}"
        
        q_id = q_data["id"]
        assert q_id not in questions_seen, "Should not repeat questions"
        questions_seen.add(q_id)
        
        # Submit answer
        ans_res = requests.post(f"{API_URL}/assessment/{assessment_id}/answer", json={"selected_option": q_data["options"][0]}, headers=headers)
        assert ans_res.status_code == 200
        
    # 31st request should be completed
    q_res_final = requests.get(f"{API_URL}/assessment/{assessment_id}/next-question", headers=headers)
    assert q_res_final.json()["id"] == "completed", "Should return completed after 30 questions"

def test_fusion_edge_cases():
    headers = get_headers("test-fusion-user")
    
    # Start assessment
    res = requests.post(f"{API_URL}/assessment/start", headers=headers)
    assessment_id = res.json()["id"]
    
    for i in range(30):
        q_res = requests.get(f"{API_URL}/assessment/{assessment_id}/next-question", headers=headers)
        ans_res = requests.post(f"{API_URL}/assessment/{assessment_id}/answer", json={"selected_option": q_res.json()["options"][2]}, headers=headers) # Usually "Sometimes"
        
    # Complete with Reliability = 0
    comp_res_0 = requests.post(f"{API_URL}/assessment/{assessment_id}/complete", json={
        "total_frames_processed": 100,
        "successful_frames": 0,
        "happy_total": 0.0,
        "neutral_total": 0.0,
        "sad_total": 0.0
    }, headers=headers)
    
    assert comp_res_0.status_code == 200
    
    res_data_0 = requests.get(f"{API_URL}/assessment/{assessment_id}/result", headers=headers).json()
    assert res_data_0["facial_reliability"] == 0.0
    
    print("All tests passed successfully!")

if __name__ == "__main__":
    print("Waiting for server to start...")
    time.sleep(2)
    print("Testing Mock Auth Flow...")
    test_mock_auth_flow()
    print("Testing Profile...")
    test_profile_creation_and_retrieval()
    print("Testing Adaptive Engine...")
    test_adaptive_engine()
    print("Testing Fusion...")
    test_fusion_edge_cases()
