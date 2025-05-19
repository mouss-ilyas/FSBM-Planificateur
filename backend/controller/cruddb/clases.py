from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from controller.cruddb.auth import is_admin
from controller.database import Clases, get_db, Teacher

router = APIRouter()

class ClassCreateRequest(BaseModel):
    name: str
    brancheid: int
    level: int

@router.post("/")
def create_class(request: ClassCreateRequest, db: Session = Depends(get_db)):
    new_class = Clases(name=request.name, branch_id=request.brancheid, level=request.level)
    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    return {"class": "success added"}


@router.get("/")
def get_classes(db: Session = Depends(get_db)):
    return db.query(Clases).all()

@router.delete("/{class_id}")
def delete_class(class_id: int, db: Session = Depends(get_db)):
    the_class = db.query(Clases).filter(Clases.id == class_id).first()
    if not the_class:
        return {"error": "Class not found"}
    db.delete(the_class)
    db.commit()
    return {"message": "Class deleted"}

@router.put("/{class_id}")
def update_class(class_id: int, name: str, db: Session = Depends(get_db), teacher: Teacher = Depends(is_admin)):
    the_class = db.query(Clases).filter(Clases.id == class_id).first()
    if not the_class:
        return {"error": "Class not found"}
    the_class.name = name
    db.commit()
    db.refresh(the_class)
    return {"message": f"Class {class_id} updated"}
