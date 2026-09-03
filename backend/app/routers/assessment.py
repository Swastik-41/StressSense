from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import Assessment, Answer, Question
from ..schemas.assessment import StartAssessmentResponse, NextQuestionResponse, AnswerRequest, FrameRequest, FrameResponse, CompleteAssessmentRequest, AssessmentResultResponse, CategoryResultResponse, RecommendationResponse
from ..services.adaptive_question_service import get_next_question
from ..services.facial_service import get_facial_model
from ..services.scoring_service import calculate_questionnaire_score
from ..services.fusion_service import perform_multimodal_fusion
from ..models.models import FacialResult, CategoryResult, Recommendation

router = APIRouter()

from ..dependencies import get_current_user
from ..models.models import User

@router.post("/start", response_model=StartAssessmentResponse)
def start_assessment(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Create new assessment
    new_assessment = Assessment(user_id=current_user.id)
    db.add(new_assessment)
    db.commit()
    db.refresh(new_assessment)
    return {"id": new_assessment.id}

@router.get("/{assessment_id}/next-question", response_model=NextQuestionResponse)
def next_question(assessment_id: str, db: Session = Depends(get_db)):
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
        
    answered_count = db.query(Answer).filter(Answer.assessment_id == assessment_id).count()
    if answered_count >= 30:
        return {"id": "completed", "question_text": "", "options": [], "progress": 30}
        
    next_q = get_next_question(db, assessment_id)
    if not next_q:
        return {"id": "completed", "question_text": "", "options": [], "progress": 30}
        
    return {
        "id": next_q.id,
        "question_text": next_q.question_text,
        "options": next_q.options,
        "progress": answered_count
    }

@router.post("/{assessment_id}/answer")
def submit_answer(assessment_id: str, answer_req: AnswerRequest, db: Session = Depends(get_db)):
    next_q = get_next_question(db, assessment_id)
    if not next_q:
        raise HTTPException(status_code=400, detail="Assessment already completed")
        
    # Calculate score based on selected option
    option_index = next_q.options.index(answer_req.selected_option) if answer_req.selected_option in next_q.options else 0
    # Option index: Never=0, Rarely=1, Sometimes=2, Often=3, Very Often=4
    score = option_index
    if next_q.is_reverse_scored:
        score = 4 - score
        
    new_answer = Answer(
        assessment_id=assessment_id,
        question_id=next_q.id,
        selected_option=answer_req.selected_option,
        score=score
    )
    db.add(new_answer)
    db.commit()
    
    return {"status": "success"}

@router.post("/{assessment_id}/process-frame", response_model=FrameResponse)
def process_frame(assessment_id: str, frame_req: FrameRequest, db: Session = Depends(get_db)):
    model = get_facial_model()
    if not model:
        return {"face_found": False, "happy": 0.0, "neutral": 0.0, "sad": 0.0}
        
    result = model.process_frame(frame_req.image)
    return result

@router.post("/{assessment_id}/complete")
def complete_assessment(assessment_id: str, complete_req: CompleteAssessmentRequest, db: Session = Depends(get_db)):
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
        
    # Calculate average facial expression if frames were processed successfully
    happy = 0.0
    neutral = 0.0
    sad = 0.0
    reliability = 0.0
    
    if complete_req.successful_frames > 0:
        happy = (complete_req.happy_total / complete_req.successful_frames) * 100
        neutral = (complete_req.neutral_total / complete_req.successful_frames) * 100
        sad = (complete_req.sad_total / complete_req.successful_frames) * 100
        # Reliability based on success rate of face detection
        reliability = (complete_req.successful_frames / complete_req.total_frames_processed) * 100 if complete_req.total_frames_processed > 0 else 0.0
        
    facial_result = FacialResult(
        assessment_id=assessment_id,
        happy_percentage=happy,
        neutral_percentage=neutral,
        sad_percentage=sad,
        reliability_score=reliability,
        dominant_expression="Happy" if happy > max(neutral, sad) else ("Sad" if sad > max(happy, neutral) else "Neutral")
    )
    db.add(facial_result)
    db.commit()
    
    q_score = calculate_questionnaire_score(db, assessment_id)
    perform_multimodal_fusion(db, assessment_id, q_score)
    
    return {"status": "completed"}

@router.get("/{assessment_id}/result", response_model=AssessmentResultResponse)
def get_result(assessment_id: str, db: Session = Depends(get_db)):
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
        
    categories = db.query(CategoryResult).filter(CategoryResult.assessment_id == assessment_id).all()
    recommendations = db.query(Recommendation).filter(Recommendation.assessment_id == assessment_id).all()
    
    return AssessmentResultResponse(
        id=assessment.id,
        overall_score=assessment.overall_score or 0.0,
        stress_level=assessment.stress_level or "Unknown",
        primary_factor=assessment.primary_factor or "Unknown",
        signal_agreement=assessment.signal_agreement or "Unknown",
        confidence_score=assessment.confidence_score or 0.0,
        questionnaire_score=assessment.questionnaire_score or 0.0,
        facial_score=assessment.facial_score or 0.0,
        facial_reliability=assessment.facial_reliability or 0.0,
        categories=[CategoryResultResponse(category=c.category, score=c.score) for c in categories],
        recommendations=[RecommendationResponse(category=r.category, recommendation_text=r.recommendation_text) for r in recommendations]
    )

@router.get("/history/list")
def get_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    assessments = db.query(Assessment).filter(
        Assessment.user_id == current_user.id,
        Assessment.status == "completed"
    ).order_by(Assessment.created_at.desc()).all()
    return [{
        "id": a.id,
        "date": a.created_at.isoformat(),
        "stress_level": a.stress_level,
        "overall_score": a.overall_score,
        "status": a.status
    } for a in assessments]
