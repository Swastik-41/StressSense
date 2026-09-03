import logging
from sqlalchemy.orm import Session
from ..models.models import Question, Answer, Assessment
import random

logger = logging.getLogger("api")

def get_next_question(db: Session, assessment_id: str):
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise ValueError("Assessment not found")
        
    answered_questions = db.query(Answer).filter(Answer.assessment_id == assessment_id).all()
    answered_ids = [a.question_id for a in answered_questions]
    
    # Check if exactly 30 answered
    if len(answered_ids) >= 30:
        logger.info(f"Assessment {assessment_id} reached 30 questions limit.")
        return None
        
    all_questions = db.query(Question).all()
    
    # Filter out answered questions
    available_questions = [q for q in all_questions if q.id not in answered_ids]
    
    if not available_questions:
        logger.info(f"Assessment {assessment_id} has no available questions left.")
        return None
        
    # Categories coverage and scores
    categories_stats = {}
    for q in all_questions:
        categories_stats[q.category] = {'count': 0, 'total_score': 0}
        
    for a in answered_questions:
        q = next((q for q in all_questions if q.id == a.question_id), None)
        if q:
            categories_stats[q.category]['count'] += 1
            categories_stats[q.category]['total_score'] += a.score
            
    # Calculate priority for each category
    # Higher average score (stress) -> higher priority
    # Lower count -> higher priority
    category_priorities = {}
    for cat, stats in categories_stats.items():
        count = stats['count']
        avg_score = stats['total_score'] / count if count > 0 else 2.0 # Default mid-score if no answers
        # Formula: higher avg_score increases priority, higher count decreases priority
        category_priorities[cat] = (avg_score + 1.0) / (count + 1)
        
    # Score available questions based on priority
    scored_questions = []
    for q in available_questions:
        priority = category_priorities[q.category] * q.scoring_weight
        scored_questions.append((priority, q))
        
    # Sort descending by priority, add a tiny bit of determinism/randomness safely
    scored_questions.sort(key=lambda x: (-x[0], x[1].id))
    
    selected_priority, selected_q = scored_questions[0]
    logger.info(f"Selected Q{selected_q.id}: Category='{selected_q.category}', Priority={selected_priority:.4f}, AnsweredCount={len(answered_ids)}")
    
    # Return the highest priority question
    return selected_q
