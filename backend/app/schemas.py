from pydantic import BaseModel, ConfigDict, Field


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
