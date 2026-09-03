import requests
import base64
import time

API_URL = "http://localhost:8000/api"
image_path = r"C:\Users\SWASTIK MISHRA\.gemini\antigravity-ide\brain\bed02b27-db34-41be-bfea-c6d4f8cc0c06\happy_face_1788467031379.jpg"

print("Starting assessment...")
res = requests.post(f"{API_URL}/assessment/start", headers={"Authorization": "Bearer mock_token_test-face-user"})
if res.status_code != 200:
    print("Failed to start assessment", res.text)
    exit(1)

assessment_id = res.json()["id"]
print(f"Assessment started: {assessment_id}")

print("Loading image...")
with open(image_path, "rb") as image_file:
    encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
    base64_image = f"data:image/jpeg;base64,{encoded_string}"

print("Sending frame to process...")
res = requests.post(f"{API_URL}/assessment/{assessment_id}/process-frame", json={"image": base64_image})
print("Process frame result:", res.status_code, res.text)
