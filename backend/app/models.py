from sqlalchemy import Column, Float, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

class Temple(Base):
    __tablename__ = "temples"

    id = Column(Integer, primary_key=True)
    temple_id = Column(String(32), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    deity = Column(String(255))
    locality = Column(String(255))
    latitude = Column(Float)
    longitude = Column(Float)
    description = Column(Text)
