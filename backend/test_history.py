import requests


API_URL = "http://localhost:8000/api"
MOCK_UID = "test-history-user"

print("Starting assessment...")
res = requests.post(f"{API_URL}/assessment/start", headers={"Authorization": f"Bearer mock_token_{MOCK_UID}"})
assessment_id = res.json()["id"]
print(f"Assessment started: {assessment_id}")

print("Completing assessment...")
res = requests.post(f"{API_URL}/assessment/{assessment_id}/complete", json={
    "total_frames_processed": 10,
    "successful_frames": 8,
    "happy_total": 4,
    "neutral_total": 4,
    "sad_total": 0
})
print("Completed status:", res.status_code, res.text)

print("Fetching history...")
res = requests.get(f"{API_URL}/assessment/history/list", headers={"Authorization": f"Bearer mock_token_{MOCK_UID}"})
print("History status:", res.status_code)
history = res.json()
print(f"Found {len(history)} history entries.")
for entry in history:
    print(f" - {entry['id']}: {entry['status']} | Stress: {entry['stress_level']} | Score: {entry['overall_score']}")

if len(history) > 0 and history[0]['id'] == assessment_id:
    print("SUCCESS: Assessment history saved and retrieved correctly!")
else:
    print("ERROR: History does not match!")
