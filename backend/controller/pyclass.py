from pydantic import BaseModel
from typing import List
class ScheduleItem(BaseModel):
    day: int
    period: int
    class_id: int
    room_id: int
    teacher_id: int
    assign_id:int

class ScheduleRequest(BaseModel):
    schedule: List[ScheduleItem]

class AvailabilityRequest(BaseModel):
    teacher_id: int
    day_of_week: int
    period: int

# Define a response model to return to the user
class AvailabilityResponse(BaseModel):
    message: str
    availability_id: int

