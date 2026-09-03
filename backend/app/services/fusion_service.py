from sqlalchemy.orm import Session
from ..models.models import Assessment, CategoryResult, FacialResult, Recommendation

def perform_multimodal_fusion(db: Session, assessment_id: str, questionnaire_score: float):
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    facial = db.query(FacialResult).filter(FacialResult.assessment_id == assessment_id).first()
    
    facial_score = 0
    facial_reliability = 0
    
    if facial:
        facial_reliability = facial.reliability_score / 100.0
        # Heuristic: Sad = 100, Neutral = 50, Happy = 0 stress score equivalent
        facial_score = (facial.sad_percentage * 1.0 + facial.neutral_percentage * 0.5)
        
    print(f"[FACIAL] reliability = {facial_reliability * 100}%")
    print(f"[FACIAL] stress signal = {facial_score}")
        
    # Default weights
    q_base_weight = 0.75
    f_base_weight = 0.25
    
    effective_f_weight = f_base_weight * facial_reliability
    effective_q_weight = q_base_weight + (f_base_weight - effective_f_weight)
    
    overall_score = (questionnaire_score * effective_q_weight) + (facial_score * effective_f_weight)
    
    # Determine stress level
    stress_level = "Low"
    if overall_score >= 70:
        stress_level = "High"
    elif overall_score >= 40:
        stress_level = "Moderate"
        
    # Determine primary factor
    categories = db.query(CategoryResult).filter(CategoryResult.assessment_id == assessment_id).all()
    primary_cat = max(categories, key=lambda c: c.score) if categories else None
    primary_factor = primary_cat.category if primary_cat else "Unknown"
    
    # Update assessment
    assessment.questionnaire_score = questionnaire_score
    assessment.facial_score = facial_score
    assessment.facial_reliability = facial_reliability * 100
    assessment.overall_score = overall_score
    assessment.stress_level = stress_level
    assessment.primary_factor = primary_factor
    assessment.status = "completed"
    
    # Determine signal agreement
    q_level = "High" if questionnaire_score >= 70 else ("Moderate" if questionnaire_score >= 40 else "Low")
    f_level = "High" if facial_score >= 70 else ("Moderate" if facial_score >= 40 else "Low")
    
    levels = {"Low": 0, "Moderate": 1, "High": 2}
    diff = abs(levels[q_level] - levels[f_level])
    if diff == 0:
        agreement = "Strong Agreement"
    elif diff == 1:
        agreement = "Moderate Agreement"
    else:
        agreement = "Low Agreement"
        
    assessment.signal_agreement = agreement
    assessment.confidence_score = 80.0 + (facial_reliability * 20.0) # Simplified heuristic
    
    db.commit()
    
    generate_recommendations(db, assessment_id, categories)

def generate_recommendations(db, assessment_id, categories):
    sorted_cats = sorted(categories, key=lambda c: c.score, reverse=True)[:3]
    
    rec_texts = {
        "Academic Pressure": "Break large assignments into smaller tasks and prioritize immediate deadlines.",
        "Concentration": "Try focused study sessions with short breaks.",
        "Sleep & Rest": "Maintain a consistent sleep and wake schedule.",
        "Time Management": "Use a simple daily plan and prioritize urgent responsibilities.",
        "Social Pressure": "Consider speaking with a trusted friend, teacher, family member, or counselor.",
        "Emotional State": "Consider healthy coping strategies and reach out to someone you trust if stress persists.",
        "Physical Stress": "Make time for rest and consider seeking professional support if symptoms persist.",
        "General Wellbeing": "Prioritize activities that bring you joy and help you relax."
    }
    
    for cat in sorted_cats:
        rec = Recommendation(
            assessment_id=assessment_id,
            category=cat.category,
            recommendation_text=rec_texts.get(cat.category, "Take time to rest and reset.")
        )
        db.add(rec)
    db.commit()
