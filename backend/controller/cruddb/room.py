from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from controller.cruddb.auth import is_admin
from controller.database import Teacher, get_db, Rooms

router = APIRouter()

class RoomCreate(BaseModel):
    name: str
    room_type_id: int
    allowed_levels: List[int]  # Assuming allowed_levels is a list of integers

@router.post("/", response_model=RoomCreate)
def create_room(room: RoomCreate, db: Session = Depends(get_db)):
    existing_room = db.query(Rooms).filter(Rooms.name == room.name).first()
    if existing_room:
        raise HTTPException(status_code=400, detail="Room with this name already exists")

    new_room = Rooms(
        name=room.name,
        room_type_id=room.room_type_id,
        allowed_levels=room.allowed_levels
    )

    db.add(new_room)
    db.commit()
    db.refresh(new_room)

    return new_room

@router.get("/")
def get_rooms(db: Session = Depends(get_db)):
    return db.query(Rooms).all()

class RoomUpdate(BaseModel):
    name: Optional[str] = None
    room_type_id: Optional[int] = None
    allowed_levels: Optional[List[int]] = None

@router.put("/{room_id}", response_model=RoomCreate)
def update_room(room_id: int, room_update: RoomUpdate, db: Session = Depends(get_db)):
    room = db.query(Rooms).filter(Rooms.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    if room_update.name:
        existing_room = db.query(Rooms).filter(Rooms.name == room_update.name, Rooms.id != room_id).first()
        if existing_room:
            raise HTTPException(status_code=400, detail="Room with this name already exists")
        room.name = room_update.name

    if room_update.room_type_id is not None:
        room.room_type_id = room_update.room_type_id

    if room_update.allowed_levels is not None:
        room.allowed_levels = room_update.allowed_levels

    db.commit()
    db.refresh(room)

    return room

@router.delete("/{room_id}")
def delete_room(room_id: int, db: Session = Depends(get_db), teacher: Teacher = Depends(is_admin)):
    room = db.query(Rooms).filter(Rooms.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    db.delete(room)
    db.commit()
    return {"success": True, "message": "Room deleted"}
