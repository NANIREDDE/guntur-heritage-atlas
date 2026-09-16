from sqlalchemy import Column, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class Locality(Base):
    __tablename__ = "localities"

    id = Column(Integer, primary_key=True)
    locality_id = Column(String(64), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    name_origin_summary = Column(Text)
    evidence_status = Column(String(64), default="needs-review", nullable=False)

    temples = relationship("Temple", back_populates="locality")


class Source(Base):
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True)
    source_id = Column(String(64), unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    publisher = Column(String(255))
    url = Column(Text)
    source_type = Column(String(100))
    reliability = Column(String(255))


class Temple(Base):
    __tablename__ = "temples"

    id = Column(Integer, primary_key=True)
    temple_id = Column(String(32), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    deity = Column(String(255))
    locality_id = Column(Integer, ForeignKey("localities.id"), nullable=True)
    latitude = Column(Float)
    longitude = Column(Float)
    description = Column(Text)

    locality = relationship("Locality", back_populates="temples")
