from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from controller.cruddb.auth import is_admin
from controller.database import Teacher, get_db,Branche,Clases,RoomType

router = APIRouter()
# ✅ Branches & Classes

class Brachemodule(BaseModel):
    name:str
    n:int

@router.get("/")
def get_branches(db: Session = Depends(get_db)):
    return db.query(Branche).all()

@router.post("/")
def create_branche(newbranche:Brachemodule, db: Session = Depends(get_db)):
    if newbranche.n < 1:
        raise HTTPException(status_code=400, detail="Number of years must be at least 1")

    branche = Branche(name=newbranche.name, number_of_years=newbranche.n)
    db.add(branche)
    db.commit()
    db.refresh(branche)

    # Create classes with levels
    for year in range(1, newbranche.n + 1):
        class_name = f"{newbranche.name}_{year}"
        new_class = Clases(name=class_name, branch_id=branche.id, level=1)
        db.add(new_class)
        db.commit() 
    # Create room
    db.commit()  # Commit all changes

    return {
        "branche": branche,
    }

@router.delete("/{branche_id}")
def delete_branche(branche_id: int, db: Session = Depends(get_db),teacher: Teacher = Depends(is_admin)):
    branche = db.query(Branche).filter(Branche.id == branche_id).first()
    if not branche:
        return {"error": "Branche not found"}
    db.delete(branche)
    db.commit()
    return {"message": "Branche deleted"}

@router.put("/{branche_id}")
def update_branche(branche_id: int, name: str, n:int,db: Session = Depends(get_db), teacher: Teacher = Depends(is_admin)):
    branche = db.query(Branche).filter(Branche.id == branche_id).first()
    if not branche:
        raise HTTPException(status_code=400, detail="Branche not found")
    
    branche.name = name
    branche.number_of_years=n
    db.commit()
    db.refresh(branche)
    
    return {"success": True, "branche": {"id": branche.id, "name": branche.name}}
