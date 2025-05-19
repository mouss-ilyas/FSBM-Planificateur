from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from controller.cruddb.auth import get_teacher_id_from_token
from controller.database import TeacherAvailability, get_db, Teacher, TeacherAssignment
router = APIRouter()

class AvailabilityCreate(BaseModel):
    day_of_week: int
    period: int
class TeacherUpdate(BaseModel):
    name: str
    email: str

# Get all teachers (admin only)
@router.get("/")
def get_teachers(db: Session = Depends(get_db)):
    teachers = db.query(Teacher).all()
    return [{"id": e.id, "name": e.name,"email":e.email} for e in teachers]

@router.put("/{teacher_id}")
def update_teacher(
    teacher_id: int,
    teacher: TeacherUpdate,  # Use the model as input
    db: Session = Depends(get_db),
    teacher_id_from_token: int = Depends(get_teacher_id_from_token)  
):
    teacher_data = db.query(Teacher).get(teacher_id)
    if not teacher_data:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    if teacher_data.id != teacher_id_from_token and teacher_id_from_token != 1:
        raise HTTPException(status_code=403, detail="Not authorized to update this teacher")
    
    teacher_data.name = teacher.name
    teacher_data.email = teacher.email
    # Update password if provided (optional)
    db.commit()
    
    return {"success": True, "data": teacher_data}


# Pydantic model for password change
class PasswordUpdate(BaseModel):
    password: str

@router.put("/password/{teacher_id}")
def update_password_teacher(
    teacher_id: int,
    password_update: PasswordUpdate,  # Receive the password as part of the body
    db: Session = Depends(get_db),
    teacher_id_from_token: int = Depends(get_teacher_id_from_token)
):
    teacher_data = db.query(Teacher).get(teacher_id)
    if not teacher_data:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    if teacher_data.id != teacher_id_from_token and teacher_id_from_token != 1:
        raise HTTPException(status_code=403, detail="Not authorized to update this teacher's password")
    
    # Hash and set the new password
    hashed_password = teacher_data.set_password(password_update.password)
    teacher_data.hashed_password = hashed_password
    db.commit()
    
    # Optionally, exclude sensitive data like 'hashed_password' from the response
    teacher_data.hashed_password = None
    
    return {"success": True, "message": "Password updated successfully"}

# Delete teacher (only admin)
@router.delete("/{teacher_id}")
def delete_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
  # Ensure only admin can delete teachers
):
    teacher_to_delete = db.query(Teacher).get(teacher_id)
    if not teacher_to_delete:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    db.delete(teacher_to_delete)
    db.commit()
    return {"success": True, "message": "Teacher deleted"}

# Assign teacher to a class (admin only)
@router.post("/teacher_assignments/")
def teacher_assignment(
    teacher_id: int, 
    class_id: int, 
    module_name: str, 
    type: str,  
    db: Session = Depends(get_db),
  # Ensure only admin can assign teachers
):
    try:
        type_int = int(type)  # Convert 'type' to integer to match the model
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid type value")

    assignment = TeacherAssignment(
        teacher_id=teacher_id,
        class_id=class_id,
        module_name=module_name,
        type_=type_int,  
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment

# Get all teacher assignments (admin only)
@router.get("/teacher_assignments/")
def get_teacher_assignments(
    db: Session = Depends(get_db),
  # Ensure only admin can view all assignments
):
    return db.query(TeacherAssignment).all()

# Update teacher assignment (only admin or the teacher themselves)
@router.put("/teacher_assignments/{assignment_id}")
def update_teacher_assignment(
    assignment_id: int, 
    module_name: str, 
    type: str, 
    db: Session = Depends(get_db),
 # Get teacher from token
):
    assignment = db.query(TeacherAssignment).filter(TeacherAssignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    assignment.module_name = module_name
    assignment.type_ = type
    db.commit()
    db.refresh(assignment)
    return assignment

# Delete teacher assignment (only admin or the teacher themselves)
@router.delete("/teacher_assignments/{assignment_id}")
def delete_teacher_assignment(
    assignment_id: int, 
    db: Session = Depends(get_db),

):
    assignment = db.query(TeacherAssignment).filter(TeacherAssignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    # Check if the assignment belongs to the teacher making the request or if they are admin
    db.delete(assignment)
    db.commit()
    return {"message": "Assignment deleted"}

# Get teacher availability (only the teacher or admin)
@router.get("/teacher_availability")
def get_teacher_availability(
    db: Session = Depends(get_db),
   # Get teacher from token
):
        return db.query(TeacherAvailability).all()
@router.get("/teacher_availability/{tid}")
def get_teacher_availability_by_id(tid: int, db: Session = Depends(get_db)):
    return db.query(TeacherAvailability).filter(TeacherAvailability.teacher_id == tid).all()


# Delete teacher availability (only the teacher or admin)
@router.delete("/teacher_availability/{id}/{availability_id}")
def delete_teacher_availability(
    availability_id: int, 
    db: Session = Depends(get_db),
    teacher_id: int = Depends(get_teacher_id_from_token)  
):
    if (teacher_id ==id or teacher_id==1): 
        availability = db.query(TeacherAvailability).filter(TeacherAvailability.id == availability_id).first()
        
        if not availability :
            raise HTTPException(status_code=404, detail="Availability not found")

        if availability.teacher_id != teacher_id and teacher_id != 1:
            raise HTTPException(status_code=403, detail="Not authorized to delete this availability")
        
        db.delete(availability)
        db.commit()
        return {"message": "Teacher availability deleted"}


@router.post("/teacher_availability/{teacher_id_param}")
def add_teacher_availability(
    teacher_id_param: int,  # Nouveau nom pour éviter la confusion avec `id`
    availability: AvailabilityCreate,
    teacher_id: int = Depends(get_teacher_id_from_token),
    db: Session = Depends(get_db)
):
    # Vérifier si l'utilisateur est autorisé à ajouter une disponibilité
    if teacher_id != teacher_id_param and teacher_id != 1:
        raise HTTPException(status_code=403, detail="Not authorized to add availability")

    # Vérifier si la disponibilité existe déjà
    existing_availability = db.query(TeacherAvailability).filter(
        TeacherAvailability.teacher_id == teacher_id_param,
        TeacherAvailability.day_of_week == availability.day_of_week,
        TeacherAvailability.period == availability.period
    ).first()

    if existing_availability:
        raise HTTPException(status_code=400, detail="Availability already exists")

    # Création et enregistrement de la nouvelle disponibilité
    new_availability = TeacherAvailability(
        teacher_id=teacher_id_param,
        day_of_week=availability.day_of_week,
        period=availability.period
    )
    db.add(new_availability)
    db.commit()
    db.refresh(new_availability)
    return new_availability

@router.get("/modules_names")
def get_modules_names(db: Session = Depends(get_db)):
    modules_names = db.query(TeacherAssignment).all()
    
    # Créer une liste de dictionnaires
    res = [{"id": i.class_id, "name": i.module_name} for i in modules_names]
    
    return res
