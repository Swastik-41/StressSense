from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import User
from ..dependencies import get_current_user

router = APIRouter()

@router.get("/me")
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "age": current_user.age,
        "gender": current_user.gender,
        "student_status": current_user.student_status,
        "academic_level": current_user.academic_level
    }

from pydantic import BaseModel
from typing import Optional

class UserUpdate(BaseModel):
    age: int
    gender: str
    student_status: str
    academic_level: str

@router.put("/me")
def update_current_user(user_data: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        current_user.age = user_data.age
        current_user.gender = user_data.gender
        current_user.student_status = user_data.student_status
        current_user.academic_level = user_data.academic_level
        db.commit()
        db.refresh(current_user)
        return current_user
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
