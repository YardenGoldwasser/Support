from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from models import Base, Report
from pydantic import BaseModel
from typing import List
from datetime import datetime
import pandas as pd
from fastapi.responses import FileResponse
import os

DATABASE_URL = 'sqlite:///./reports.db'
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ReportCreate(BaseModel):
    name: str = None
    email: str = None
    category: str
    description: str

class ReportOut(BaseModel):
    id: int
    name: str = None
    email: str = None
    category: str
    description: str
    timestamp: datetime
    class Config:
        orm_mode = True

@app.post("/report", response_model=ReportOut)
def create_report(report: ReportCreate, db: Session = Depends(get_db)):
    db_report = Report(
        name=report.name,
        email=report.email,
        category=report.category,
        description=report.description
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

@app.get("/reports", response_model=List[ReportOut])
def get_reports(db: Session = Depends(get_db)):
    return db.query(Report).order_by(Report.timestamp.desc()).all()

@app.get("/export")
def export_reports(db: Session = Depends(get_db)):
    reports = db.query(Report).all()
    data = [
        {
            "ID": r.id,
            "Name": r.name,
            "Email": r.email,
            "Category": r.category,
            "Description": r.description,
            "Timestamp": r.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        }
        for r in reports
    ]
    df = pd.DataFrame(data)
    file_path = "reports_export.xlsx"
    df.to_excel(file_path, index=False)
    return FileResponse(path=file_path, filename="reports_export.xlsx", media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')