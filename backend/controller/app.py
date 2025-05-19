import json
from controller.cruddb import room,roomtype,teacher,branche,clases,assignement
from controller.pyclass import * 
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from controller.database import get_db,TeacherAssignment
from controller.generate_sechlule_fuctions import generate_schedule,get_from_csv_schedule, save_to_csv
from controller.cruddb.auth import  router as auth_router
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

app.include_router(auth_router) 
app.include_router(roomtype.router, prefix="/admin/roomtypes", tags=["Room Types"])
app.include_router(teacher.router, prefix="/teachers", tags=["Teachers"])
app.include_router(branche.router, prefix="/admin/branche", tags=["Branches"])
app.include_router(room.router, prefix="/admin/rooms", tags=["Rooms"])
app.include_router(clases.router, prefix="/admin/classes", tags=["Classes"])
app.include_router(assignement.router, prefix="/admin/assignments", tags=["assignement"])


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

#read data from csv file  n  

@app.get("/get_schedule")
async def get_schedule_func():
    return get_from_csv_schedule()  
 

#generate the schedule
@app.post("/schedule")
async def generate_schedule_view(db: Session = Depends(get_db)):
    
    try:
        response = generate_schedule(db) 
        if response["status"] == "success":
            save_to_csv(response["schedule"],response["assign"])
            return {
                "schedule": response["schedule"]
            }
        else:
            raise HTTPException(status_code=400, detail=json.dumps(response))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    