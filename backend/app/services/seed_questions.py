import json
import uuid
import sys
import os

QUESTIONS = [
    # Academic Pressure (6)
    {"text": "I feel overwhelmed by my academic workload.", "category": "Academic Pressure", "weight": 1.0, "reverse": False},
    {"text": "I worry about my grades and academic performance.", "category": "Academic Pressure", "weight": 1.0, "reverse": False},
    {"text": "I find my coursework difficult to keep up with.", "category": "Academic Pressure", "weight": 1.0, "reverse": False},
    {"text": "I feel prepared for upcoming exams or assignments.", "category": "Academic Pressure", "weight": 1.0, "reverse": True},
    {"text": "The expectations placed on me academically feel too high.", "category": "Academic Pressure", "weight": 1.0, "reverse": False},
    {"text": "I can easily manage the amount of reading and studying required.", "category": "Academic Pressure", "weight": 1.0, "reverse": True},

    # Sleep & Rest (5)
    {"text": "I get at least 7-8 hours of quality sleep per night.", "category": "Sleep & Rest", "weight": 1.0, "reverse": True},
    {"text": "I feel exhausted when I wake up in the morning.", "category": "Sleep & Rest", "weight": 1.0, "reverse": False},
    {"text": "I have trouble falling asleep because my mind is racing.", "category": "Sleep & Rest", "weight": 1.0, "reverse": False},
    {"text": "I wake up multiple times during the night.", "category": "Sleep & Rest", "weight": 1.0, "reverse": False},
    {"text": "I feel well-rested during the day.", "category": "Sleep & Rest", "weight": 1.0, "reverse": True},

    # Concentration (5)
    {"text": "I can easily focus during lectures or study sessions.", "category": "Concentration", "weight": 1.0, "reverse": True},
    {"text": "My mind wanders when I try to read or study.", "category": "Concentration", "weight": 1.0, "reverse": False},
    {"text": "I make careless mistakes because I can't concentrate.", "category": "Concentration", "weight": 1.0, "reverse": False},
    {"text": "I have to read the same paragraph multiple times to understand it.", "category": "Concentration", "weight": 1.0, "reverse": False},
    {"text": "I am able to complete tasks without getting easily distracted.", "category": "Concentration", "weight": 1.0, "reverse": True},

    # Emotional State (6)
    {"text": "I feel anxious or on edge.", "category": "Emotional State", "weight": 1.0, "reverse": False},
    {"text": "I feel calm and relaxed.", "category": "Emotional State", "weight": 1.0, "reverse": True},
    {"text": "I get irritated or angry easily.", "category": "Emotional State", "weight": 1.0, "reverse": False},
    {"text": "I feel a sense of hopelessness about the future.", "category": "Emotional State", "weight": 1.0, "reverse": False},
    {"text": "I am able to handle unexpected problems well.", "category": "Emotional State", "weight": 1.0, "reverse": True},
    {"text": "I feel close to tears or cry easily.", "category": "Emotional State", "weight": 1.0, "reverse": False},

    # Social Pressure (4)
    {"text": "I feel pressured to fit in with my peers.", "category": "Social Pressure", "weight": 1.0, "reverse": False},
    {"text": "I have a strong support system of friends or family.", "category": "Social Pressure", "weight": 1.0, "reverse": True},
    {"text": "I worry about what others think of me.", "category": "Social Pressure", "weight": 1.0, "reverse": False},
    {"text": "I feel lonely or isolated from others.", "category": "Social Pressure", "weight": 1.0, "reverse": False},

    # Time Management (4)
    {"text": "I have enough time for everything I need to do.", "category": "Time Management", "weight": 1.0, "reverse": True},
    {"text": "I procrastinate on important tasks.", "category": "Time Management", "weight": 1.0, "reverse": False},
    {"text": "I feel like I am always rushing to meet deadlines.", "category": "Time Management", "weight": 1.0, "reverse": False},
    {"text": "I can effectively balance my studies and personal life.", "category": "Time Management", "weight": 1.0, "reverse": True},

    # Physical Stress (4)
    {"text": "I experience physical symptoms of stress (e.g., headaches, stomach aches).", "category": "Physical Stress", "weight": 1.0, "reverse": False},
    {"text": "My muscles feel tense or tight.", "category": "Physical Stress", "weight": 1.0, "reverse": False},
    {"text": "I feel physically energetic and healthy.", "category": "Physical Stress", "weight": 1.0, "reverse": True},
    {"text": "I experience changes in my appetite when I am busy.", "category": "Physical Stress", "weight": 1.0, "reverse": False},

    # General Wellbeing (3)
    {"text": "I feel positive about my life in general.", "category": "General Wellbeing", "weight": 1.0, "reverse": True},
    {"text": "I take time for hobbies or activities I enjoy.", "category": "General Wellbeing", "weight": 1.0, "reverse": True},
    {"text": "I feel overwhelmed by everyday tasks.", "category": "General Wellbeing", "weight": 1.0, "reverse": False},
]

# Ensure the backend directory is in the python path so it works from anywhere or Render shell
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from app.database import engine, SessionLocal, Base
from app.models.models import Question

def seed():
    print("Initializing Database Seeding...")
    try:
        # Create tables if they don't exist
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        
        expected_count = len(QUESTIONS)
        initial_count = db.query(Question).count()
        print(f"Question bank before seed: {initial_count} (Expected: {expected_count})")
        
        if initial_count == 0:
            print("Seeding questions...")
            for q in QUESTIONS:
                db_q = Question(
                    id=str(uuid.uuid4()),
                    question_text=q["text"],
                    category=q["category"],
                    scoring_weight=q["weight"],
                    options=["Never", "Rarely", "Sometimes", "Often", "Very Often"],
                    is_reverse_scored=q["reverse"]
                )
                db.add(db_q)
            db.commit()
            
            inserted_count = len(QUESTIONS)
            print(f"Questions inserted: {inserted_count}")
        else:
            print("Database already contains questions. Skipping insertion to prevent duplicates.")
            
        final_count = db.query(Question).count()
        print(f"Question bank after seed: {final_count}")
        
        if final_count != expected_count:
            print(f"ERROR: Expected question bank to have {expected_count} questions, but found {final_count}.")
            sys.exit(1)
            
        db.close()
        print("Seeding process completed successfully.")
        
    except Exception as e:
        print(f"ERROR: Database seeding failed with exception: {e}")
        sys.exit(1)

if __name__ == "__main__":
    seed()
