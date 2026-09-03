import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from .database import get_db
from .models.models import User

security = HTTPBearer()

AUTH_MODE = os.getenv("AUTH_MODE", "firebase")

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    
    if AUTH_MODE == "mock":
        # In mock mode, token should be "mock_token_{uid}"
        if token.startswith("mock_token_"):
            uid = token.replace("mock_token_", "")
            
            # Check if user exists, otherwise create for mock mode
            user = db.query(User).filter((User.firebase_uid == uid) | (User.id == uid)).first()
            if user and not user.firebase_uid:
                user.firebase_uid = uid
                db.commit()
            if not user:
                user = User(firebase_uid=uid, email=f"{uid}@mock.com")
                db.add(user)
                db.commit()
                db.refresh(user)
            return user
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid mock token",
        )
        
    else:
        # Firebase Mode
        try:
            import firebase_admin
            from firebase_admin import auth, credentials as firebase_credentials
            import json
            
            if not firebase_admin._apps:
                firebase_creds_json = os.getenv("FIREBASE_CREDENTIALS")
                if firebase_creds_json:
                    creds_dict = json.loads(firebase_creds_json)
                    cred = firebase_credentials.Certificate(creds_dict)
                    firebase_admin.initialize_app(cred)
                else:
                    firebase_admin.initialize_app()
                
            decoded_token = auth.verify_id_token(token)
            uid = decoded_token['uid']
            email = decoded_token.get('email', '')
            
            user = db.query(User).filter((User.firebase_uid == uid) | (User.id == uid)).first()
            if user and not user.firebase_uid:
                user.firebase_uid = uid
                db.commit()
            if not user:
                user = User(firebase_uid=uid, email=email)
                db.add(user)
                db.commit()
                db.refresh(user)
            return user
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid authentication credentials: {e}",
            )
