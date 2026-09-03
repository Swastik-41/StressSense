from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from ..database import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=generate_uuid)
    firebase_uid = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    age = Column(Integer)
    gender = Column(String)
    student_status = Column(String)
    academic_level = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Question(Base):
    __tablename__ = "questions"
    id = Column(String, primary_key=True, default=generate_uuid)
    question_text = Column(Text, nullable=False)
    category = Column(String, index=True)
    scoring_weight = Column(Float, default=1.0)
    options = Column(JSON)
    related_question_ids = Column(JSON, default=list)
    is_reverse_scored = Column(Boolean, default=False)
    priority_metadata = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Assessment(Base):
    __tablename__ = "assessments"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    questionnaire_score = Column(Float, nullable=True)
    facial_score = Column(Float, nullable=True)
    facial_reliability = Column(Float, nullable=True)
    response_consistency = Column(String, nullable=True)
    signal_agreement = Column(String, nullable=True)
    confidence_score = Column(Float, nullable=True)
    overall_score = Column(Float, nullable=True)
    stress_level = Column(String, nullable=True)
    primary_factor = Column(String, nullable=True)
    status = Column(String, default="in_progress")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User")
    answers = relationship("Answer", back_populates="assessment")
    category_results = relationship("CategoryResult", back_populates="assessment")
    facial_results = relationship("FacialResult", back_populates="assessment")
    recommendations = relationship("Recommendation", back_populates="assessment")

class Answer(Base):
    __tablename__ = "answers"
    id = Column(String, primary_key=True, default=generate_uuid)
    assessment_id = Column(String, ForeignKey("assessments.id"))
    question_id = Column(String, ForeignKey("questions.id"))
    selected_option = Column(String)
    score = Column(Float)
    answered_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    assessment = relationship("Assessment", back_populates="answers")
    question = relationship("Question")

class CategoryResult(Base):
    __tablename__ = "category_results"
    id = Column(String, primary_key=True, default=generate_uuid)
    assessment_id = Column(String, ForeignKey("assessments.id"))
    category = Column(String)
    score = Column(Float)

    assessment = relationship("Assessment", back_populates="category_results")

class FacialResult(Base):
    __tablename__ = "facial_results"
    id = Column(String, primary_key=True, default=generate_uuid)
    assessment_id = Column(String, ForeignKey("assessments.id"))
    happy_percentage = Column(Float)
    neutral_percentage = Column(Float)
    sad_percentage = Column(Float)
    dominant_expression = Column(String)
    reliability_score = Column(Float)

    assessment = relationship("Assessment", back_populates="facial_results")

class Recommendation(Base):
    __tablename__ = "recommendations"
    id = Column(String, primary_key=True, default=generate_uuid)
    assessment_id = Column(String, ForeignKey("assessments.id"))
    category = Column(String)
    recommendation_text = Column(Text)

    assessment = relationship("Assessment", back_populates="recommendations")
