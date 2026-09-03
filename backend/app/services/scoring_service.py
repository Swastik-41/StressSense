from sqlalchemy.orm import Session
from ..models.models import Answer, Assessment, Question, CategoryResult

def calculate_questionnaire_score(db: Session, assessment_id: str):
    answers = db.query(Answer).filter(Answer.assessment_id == assessment_id).all()
    questions = {q.id: q for q in db.query(Question).all()}
    
    category_scores = {}
    category_max = {}
    
    for ans in answers:
        q = questions.get(ans.question_id)
        if not q: continue
        
        cat = q.category
        if cat not in category_scores:
            category_scores[cat] = 0
            category_max[cat] = 0
            
        category_scores[cat] += ans.score * q.scoring_weight
        category_max[cat] += 4.0 * q.scoring_weight
        
    total_score = 0
    total_max = 0
    
    # Save category results
    for cat in category_scores.keys():
        cat_pct = (category_scores[cat] / category_max[cat]) * 100 if category_max[cat] > 0 else 0
        db_cat = CategoryResult(assessment_id=assessment_id, category=cat, score=cat_pct)
        db.add(db_cat)
        
        total_score += category_scores[cat]
        total_max += category_max[cat]
        
    db.commit()
    
    overall_pct = (total_score / total_max) * 100 if total_max > 0 else 0
    return overall_pct
