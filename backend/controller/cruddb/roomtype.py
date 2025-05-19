from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from controller.cruddb.auth import is_admin
from controller.database import Teacher, get_db,RoomType

router = APIRouter()

@router.post("/")
def create_type(name: str, db: Session = Depends(get_db),teacher: Teacher = Depends(is_admin)):
    if not name.strip():
        return {"success": False, "error": "Room type name cannot be empty."}
    new_type = RoomType(name=name)
    db.add(new_type)
    db.commit()
    db.refresh(new_type)  # Fix: Pass the object to refresh  
    return {"success": True, "message": f"'{name}' is added", "data": {"id": new_type.id, "name": new_type.name}}


@router.get("/")
def get_room_type(db: Session = Depends(get_db),teacher: Teacher = Depends(is_admin)):
    return db.query(RoomType).all()

@router.put("/{room_id}")
def update_room_type(room_id: int, type_name: str, db: Session = Depends(get_db),teacher: Teacher = Depends(is_admin)):  # Fix: Removed extra 'type' parameter
    roomtype = db.query(RoomType).filter(RoomType.id == room_id).first()
    if not roomtype:
        return {"success": False, "error": "Room type not found"}
    
    roomtype.name = type_name
    db.commit()
    db.refresh(roomtype)
    return {"success": True, "message": f"Updated room type {roomtype.id} successfully", "data": {"id": roomtype.id, "name": roomtype.name}}

@router.delete("/{room_id}")
def delete_room_type(room_id: int, db: Session = Depends(get_db),teacher: Teacher = Depends(is_admin)):
    room = db.query(RoomType).filter(RoomType.id == room_id).first()
    if not room:  # Fix: Check if room exists, not if room_id is falsey
        return {"success": False, "error": "Room type not found"}
    db.delete(room)  # Fix: Delete the object, not the ID
    db.commit()
    return {"success": True, "message": f"Room type {room_id} deleted"}
