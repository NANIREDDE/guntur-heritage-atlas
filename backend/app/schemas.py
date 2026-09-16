from pydantic import BaseModel, Field

class TempleSummary(BaseModel):
    id: str = Field(description="Stable Guntur Heritage Atlas identifier")
    name: str
    city: str
    status: str

class TempleDetail(TempleSummary):
    evidence: str
