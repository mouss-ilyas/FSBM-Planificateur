from sqlalchemy import JSON, Column, Integer, String, ForeignKey, create_engine 
from sqlalchemy.orm import relationship, sessionmaker, declarative_base
from passlib.context import CryptContext

# Database URL 
DATABASE_URL = "sqlite:///./database.db"

# Create database engine
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Define Base class for ORM models
Base = declarative_base()

# Create a session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()  # Create a new database session
    try:
        yield db
    finally:
        db.close()  # Ensure the connection is closed after the transaction

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class Teacher(Base):
    __tablename__ = "teachers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    hashed_password = Column(String, nullable=False)  
    
    # Method to hash a password
    @staticmethod
    def set_password(password: str) -> str:
        return pwd_context.hash(password)
    # Method to verify password
    def verify_password(self, password: str) -> bool:
        return pwd_context.verify(password, self.hashed_password)
    

class Branche(Base):
    __tablename__ = "branches"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    number_of_years = Column(Integer, nullable=False)
    classes = relationship("Clases", back_populates="branch", cascade="all, delete-orphan", passive_deletes=True)

class Clases(Base):
    __tablename__ = "classes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    level = Column(Integer, nullable=False)
    branch = relationship("Branche", back_populates="classes")

class RoomType(Base):
    __tablename__ = "room_types"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    rooms = relationship("Rooms", back_populates="room_type")

class Rooms(Base):
    __tablename__ = "rooms"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    room_type_id = Column(Integer, ForeignKey("room_types.id"), nullable=False)
    allowed_levels = Column(JSON, nullable=False)
    room_type = relationship("RoomType", back_populates="rooms")

class TeacherAssignment(Base):
    __tablename__ = "teacher_assignments"
    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    module_name = Column(String, nullable=False)
    type_ = Column(Integer, ForeignKey("room_types.id"), nullable=False)
    teacher = relationship("Teacher", backref="assignments")
    class_ = relationship("Clases", backref="assignment")

class TeacherAvailability(Base):
    __tablename__ = "teacher_availability"
    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=False)
    day_of_week = Column(String, nullable=False)
    period = Column(Integer, nullable=False)

# Create tables
Base.metadata.create_all(bind=engine)
