from pydantic import BaseModel, ConfigDict, Field


class SourceSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str = Field(description="Stable source identifier")
    title: str
    publisher: str | None = None
    url: str | None = None
    source_type: str | None = None


class MediaSummary(BaseModel):
    url: str
    caption: str | None = None
    source_url: str | None = None
    credit: str | None = None


class TempleSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str = Field(description="Stable Guntur Heritage Atlas identifier")
    name: str
    city: str
    status: str


class TempleDetail(TempleSummary):
    deity: str | None = None
    locality: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    description: str | None = None
    evidence: str
    sources: list[SourceSummary] = []
    media: list[MediaSummary] = []


class LocalitySummary(BaseModel):
    id: str = Field(description="Stable locality identifier")
    name: str
    type: str | None = None
    district: str | None = None
    status: str


class LocalityDetail(LocalitySummary):
    state: str | None = None
    country: str | None = None
    name_origin: str | None = None
    history: str | None = None
    temples: list[TempleSummary] = []
    sources: list[SourceSummary] = []
