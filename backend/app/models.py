from sqlalchemy import Column, Float, ForeignKey, Integer, String, Table, Text
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


temple_sources = Table(
    "temple_sources",
    Base.metadata,
    Column("temple_id", Integer, ForeignKey("temples.id"), primary_key=True),
    Column("source_id", Integer, ForeignKey("sources.id"), primary_key=True),
)

locality_sources = Table(
    "locality_sources",
    Base.metadata,
    Column("locality_id", Integer, ForeignKey("localities.id"), primary_key=True),
    Column("source_id", Integer, ForeignKey("sources.id"), primary_key=True),
)


class Locality(Base):
    __tablename__ = "localities"

    id = Column(Integer, primary_key=True)
    locality_id = Column(String(64), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    locality_type = Column(String(100))
    current_district = Column(String(255))
    state = Column(String(255))
    country = Column(String(255))
    name_origin_summary = Column(Text)
    history_summary = Column(Text)
    evidence_status = Column(String(64), default="needs-review", nullable=False)

    temples = relationship("Temple", back_populates="locality")
    sources = relationship("Source", secondary=locality_sources, back_populates="localities")


class Source(Base):
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True)
    source_id = Column(String(64), unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    publisher = Column(String(255))
    url = Column(Text)
    source_type = Column(String(100))
    reliability = Column(String(255))

    temples = relationship("Temple", secondary=temple_sources, back_populates="sources")
    localities = relationship("Locality", secondary=locality_sources, back_populates="sources")


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
    evidence_status = Column(String(64), default="needs-review", nullable=False)

    locality = relationship("Locality", back_populates="temples")
    sources = relationship("Source", secondary=temple_sources, back_populates="temples")
