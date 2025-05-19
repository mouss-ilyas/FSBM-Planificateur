from typing import List
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from controller.database import get_db, TeacherAssignment

class AssignmentCreate(BaseModel):
    teacher_id: int
    class_id: int
    module_name: str
    type_: int  # Renommé pour éviter le conflit avec "type"

class AssignmentResponse(AssignmentCreate):
    id: int

    class Config:
        orm_mode = True  # Permet à SQLAlchemy de conver    tir en dict JSON

router = APIRouter()

# Create
@router.post("/", response_model=AssignmentResponse)
def create_assignment(a: AssignmentCreate, db: Session = Depends(get_db)):
    new_assignment = TeacherAssignment(
        teacher_id=a.teacher_id,
        class_id=a.class_id,
        module_name=a.module_name,
        type_=a.type_
    )
    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)
    return new_assignment

# Read (Get all assignments)
@router.get("/", response_model=List[AssignmentResponse])
def get_assignments(db: Session = Depends(get_db)):
    return db.query(TeacherAssignment).all()

# Read (Get by ID)
@router.get("/{assignment_id}", response_model=AssignmentResponse)
def get_assignment(assignment_id: int, db: Session = Depends(get_db)):
    assignment = db.query(TeacherAssignment).filter(TeacherAssignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return assignment

# Update
@router.put("/{assignment_id}", response_model=AssignmentResponse)
def update_assignment(assignment_id: int, a: AssignmentCreate, db: Session = Depends(get_db)):
    assignment = db.query(TeacherAssignment).filter(TeacherAssignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    assignment.teacher_id = a.teacher_id
    assignment.class_id = a.class_id
    assignment.module_name = a.module_name
    assignment.type_ = a.type_

    db.commit()
    db.refresh(assignment)
    return assignment

# Delete
@router.delete("/{assignment_id}")
def delete_assignment(assignment_id: int, db: Session = Depends(get_db)):
    assignment = db.query(TeacherAssignment).filter(TeacherAssignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    db.delete(assignment)
    db.commit()
    return {"message": "Assignment deleted successfully"}
