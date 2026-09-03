from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import assessment, users
from .database import engine, Base

Base.metadata.create_all(bind=engine)

import os

app = FastAPI(title="StressSense API")

cors_origins_env = os.getenv("CORS_ORIGINS", "*")
origins = [origin.strip() for origin in cors_origins_env.split(",")] if cors_origins_env else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(assessment.router, prefix="/api/assessment", tags=["assessment"])

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
