from pydantic import BaseModel
from typing import List, Optional

class StartAssessmentResponse(BaseModel):
    id: str

class NextQuestionResponse(BaseModel):
    id: str
    question_text: str
    options: List[str]
    progress: int

class AnswerRequest(BaseModel):
    selected_option: str

class FrameRequest(BaseModel):
    image: str # Base64 encoded

class FrameResponse(BaseModel):
    face_found: bool
    happy: float
    neutral: float
    sad: float

class CompleteAssessmentRequest(BaseModel):
    total_frames_processed: int
    successful_frames: int
    happy_total: float
    neutral_total: float
    sad_total: float

class CategoryResultResponse(BaseModel):
    category: str
    score: float

class RecommendationResponse(BaseModel):
    category: str
    recommendation_text: str

class AssessmentResultResponse(BaseModel):
    id: str
    overall_score: float
    stress_level: str
    primary_factor: str
    signal_agreement: str
    confidence_score: float
    questionnaire_score: float
    facial_score: float
    facial_reliability: float
    categories: List[CategoryResultResponse]
    recommendations: List[RecommendationResponse]
