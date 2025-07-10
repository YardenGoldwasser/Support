from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Report(Base):
    __tablename__ = 'reports'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    category = Column(String, nullable=False)  # 'Issue' or 'Product Request'
    description = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)