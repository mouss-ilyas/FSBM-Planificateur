from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from controller.database import SessionLocal, get_db, Teacher  # Import relative database dependencies
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta


# Secret key for encoding and decoding the JWT (make sure to keep this safe)
SECRET_KEY = "code@hhh.com///sat,??pasword"
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Helper function to get the teacher_id from the JWT token
def get_teacher_id_from_token(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode the JWT token to get the teacher_id
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        teacher_id = payload.get("teacher_id")
        if teacher_id is None:
            raise credentials_exception
        return teacher_id
    except JWTError:
        raise credentials_exception


# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()

# Function to create the admin teacher if it doesn't exist
def create_admin_teacher():
    db = SessionLocal()
    try:
        # Check if teacher with ID 1 already exists
        admin_teacher = db.query(Teacher).filter(Teacher.id == 1).first()
        if not admin_teacher:
            # Create a new teacher with ID 1 (admin)
            admin_teacher = Teacher(
                id=1,
                name="Admin Teacher",
                email="admin@school.com",
                hashed_password=Teacher.set_password("adminpassword123") 
            )
            db.add(admin_teacher)
            db.commit()
            db.refresh(admin_teacher)  # Refresh to get the inserted object with the ID
            print("Admin teacher created.")
    finally:
        db.close()

# Call the function to create the admin teacher
create_admin_teacher()

# Dependency to check if the user is admin
def is_admin(db: Session = Depends(get_db), teacher_id: int = Depends(get_teacher_id_from_token)):
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher or teacher.id != 1:  
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action"
        )
    return teacher



# Function to create JWT token
def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=1000)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

class LoginRequest(BaseModel):
    email: str
    password: str

class AddTeacherRequest(BaseModel):
    name: str
    email: str
    password: str

@router.post("/admin/add_teacher")
async def add_teacher(
    add_teacher_request: AddTeacherRequest,
    db: Session = Depends(get_db), # Ensure that only admin can access this route
):
    # Check if teacher with the same email already exists
    existing_teacher = db.query(Teacher).filter(Teacher.email == add_teacher_request.email).first()
    if existing_teacher:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Teacher already exists")

    # Create a new teacher object
    new_teacher = Teacher(
        name=add_teacher_request.name,
        email=add_teacher_request.email,
        hashed_password=Teacher.set_password(add_teacher_request.password)  # Hash password correctly
    )

    db.add(new_teacher)
    db.commit()
    db.refresh(new_teacher)  # Refresh to get the newly inserted teacher's ID

    return {"message": "Teacher added successfully", "teacher_id": new_teacher.id}


@router.post("/login")
async def login(login_request: LoginRequest, db: Session = Depends(get_db)):
    email = login_request.email.strip() 
    password = login_request.password

    # Authenticate the teacher using email as the username
    teacher = db.query(Teacher).filter(Teacher.email == email).first()
    if not teacher or not teacher.verify_password(password):  
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    # Create JWT token
    access_token = create_access_token(data={"teacher_id": teacher.id})
    # Check if the teacher is admin (teacher_id = 1)
    if teacher.id == 1:
        return {"message": "Admin login successful", "teacher_id": teacher.id, "role": "admin", "access_token": access_token}
    
    # If the teacher is not admin, return the regular teacher ID and role
    return {"message": "Teacher login successful", "teacher_id": teacher.id, "role": "teacher", "access_token": access_token}# Admin route to add teachers (accessible only by the admin)





