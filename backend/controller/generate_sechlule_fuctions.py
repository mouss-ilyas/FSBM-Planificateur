from fastapi import Depends
from ortools.sat.python import cp_model
from sqlalchemy.orm import Session
from controller.database import get_db
from controller.cruddb.auth import is_admin
from controller.database import Clases, Rooms, TeacherAssignment,TeacherAvailability,Teacher
import os
from typing import List,Dict
import csv
from collections import defaultdict

def get_from_csv_schedule():
    """
    Read schedule data from a CSV file and return it as a structured dictionary.
    
    Returns:
        dict: Either a dictionary with a "schedule" key containing the schedule data,
              or a dictionary with an "error" key containing an error message.
    """
    # Get the directory where the script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Define the path to the CSV file (one directory up from the script)
    csv_file_path = os.path.join(script_dir, '../schedule_data.csv')
    absolute_path = os.path.abspath(csv_file_path)
    
    schedule_data = []
    
    # Check if the file exists
    if os.path.exists(absolute_path):
        try:
            with open(absolute_path, mode='r', newline='', encoding='utf-8') as file:
                csv_reader = csv.DictReader(file)
                for row in csv_reader:
                    try:
                        schedule_data.append({
                            "day": int(row['day']),
                            "period": int(row['period']),
                            "class_id": int(row['class_id']),
                            "room_id": int(row['room_id']),
                            "teacher_id": int(row['teacher_id']),
                            "assign_id": int(row['assign_id']),
                            "module_name": row['module_name'],
                            "type_": int(row['type_']),
                            "grp_number": row['grp_number']
                        })
                    except (ValueError, KeyError) as e:
                        return {"error": f"Error parsing row data: {e}. Row content: {row}"}
                
                result = {"schedule": schedule_data}
                return result
        except Exception as e:
            return {"error": f"Error reading file: {e}"}
    else:
        return {"error": f"The file at {absolute_path} does not exist."}

 


def group_class_assignments(assignments):
    grouped = defaultdict(list)
    for a in assignments:
        if a['type_'] == 2:
            grouped[a['class_id']].append(a)

    result = {}
    
    for class_id, assigns in grouped.items():
        n = len(assigns)
        model = cp_model.CpModel()
        max_groups = n  # worst case: all assignments conflict
        group_vars = [model.NewIntVar(0, max_groups - 1, f'grp_{i+1}') for i in range(n)]

        # Add constraint: no two overlapping assignments in same group
        for i in range(n):
            for j in range(i + 1, n):
                if assigns[i]['day'] == assigns[j]['day'] and assigns[i]['period'] == assigns[j]['period']:
                    model.Add(group_vars[i] != group_vars[j])

        # Optionally minimize number of groups
        max_group = model.NewIntVar(0, max_groups - 1, 'max_group')
        for var in group_vars:
            model.Add(var <= max_group)
        model.Minimize(max_group)

        solver = cp_model.CpSolver()
        status = solver.Solve(model)

        if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            class_groups = defaultdict(list)
            for i, assign in enumerate(assigns):
                grp_id = solver.Value(group_vars[i])
                group_name = f'class_{class_id}_grp_{grp_id + 1}'
                class_groups[group_name].append(assign)
            result[class_id] = dict(class_groups)
        else:
            print(f"No solution found for class {class_id}.")

    return dict(result)



def save_to_csv(schedule_data: List[Dict], types):
    # Create a dictionary for quick lookup of assign data by id
    assign_lookup = {item['id']: item for item in types}

    # First, we need to identify groups by (module_name, type_=2, class_id) and assign numbers
    group_counters = {}  # To track the count for each group

    # First pass: collect all type_=2 groups
    for item in types:
        if item['type_'] == 2:
            key = (item['module_name'], item['class_id'])
            if key not in group_counters:
                group_counters[key] = []
            group_counters[key].append(item['id'])

    # Now assign numbers to each group
    group_numbers = {}
    for key, ids in group_counters.items():
        for index, assign_id in enumerate(ids):
            group_numbers[assign_id] = index



    # Create a dictionary for quick lookup of assign data by id
    assign_lookup = {item['id']: item for item in types}

    # Add the module_name, type_, and grp_number to each schedule item
    enhanced_schedule = []
    for schedule_item in schedule_data:
        assign_id = schedule_item['assign_id']
        
        # Create a new dict with all original schedule data
        enhanced_item = schedule_item.copy()
        
        # Add module_name, type_, and grp_number if available
        if assign_id in assign_lookup:
            assign_info = assign_lookup[assign_id]
            enhanced_item['module_name'] = assign_info['module_name']
            enhanced_item['type_'] = assign_info['type_']
            
            # Add grp_number based on type_
            if assign_info['type_'] == 1:
                # For type_=1, just use the module_name
                enhanced_item['grp_number'] = assign_info['module_name']
            else:
                # For type_=2, add group number
                group_number = group_numbers.get(assign_id, 0)
                enhanced_item['grp_number'] = f"grp_{group_number}"
        else:
            # Default values if assign_id not found
            enhanced_item['grp_number'] = "Unknown"
        
        enhanced_schedule.append(enhanced_item)
    # CSV file path
    csv_file_path = 'schedule_data.csv'

    # Write data to CSV
    with open(csv_file_path, 'w', newline='') as csvfile:
        # Get field names from the first dictionary
        field_names = enhanced_schedule[0].keys()
        
        # Create CSV writer
        writer = csv.DictWriter(csvfile, fieldnames=field_names)
        
        # Write header
        writer.writeheader()
        
        # Write data rows
        writer.writerows(enhanced_schedule)

    
    
    

   

#those fuctions get data from db
def get_classes(db: Session):
    classes = db.query(Clases).all()
    return [{"class_id": cls.id, "level": cls.level} for cls in classes]  # ✅ Liste de dictionnaires

def get_rooms(db: Session):
    rooms = db.query(Rooms).all()
    return {
        room.id: {
            "room_id": room.id,  # ✅ Ajout explicite de room_id
            "name": room.name,
            "room_type_id": room.room_type_id,
            "allowed_levels": list(room.allowed_levels) if isinstance(room.allowed_levels, list) else []
        }
        for room in rooms
    }

def get_assignments(db: Session):
    assignments = db.query(TeacherAssignment).all()
    return [{"id":assignment.id,"module_name":assignment.module_name,"teacher_id": assignment.teacher_id, "class_id": assignment.class_id, "type_": assignment.type_,"id":assignment.id} for assignment in assignments]

def get_teacher_unavailability(db: Session):
    # Query TeacherAvailability for unavailability data
    assignments = db.query(TeacherAvailability.teacher_id, TeacherAvailability.day_of_week, TeacherAvailability.period).all()

    # Create a dictionary to store teacher unavailability by teacher_id
    teacher_unavailability = defaultdict(list)
    for teacher_id, day_of_week, period in assignments:
        teacher_unavailability[teacher_id].append((int(day_of_week), period))

    return dict(teacher_unavailability)

#this fuction generate a new time managment 

def generate_schedule(db: Session):
    # Fetch data
    CLASSES = get_classes(db)
    ROOMS = get_rooms(db)
    ASSIGNMENTS = get_assignments(db)
    TEACHER_UNAVAILABILITY = get_teacher_unavailability(db)

    # Constants
    DAYS = [1, 2, 3, 4, 5]  
    PERIODS_PER_DAY = 5    
    model = cp_model.CpModel()

    # Create binary variables: X[d, p, class_id, room_id, teacher_id, assign_id]
    X = {}
    for d in DAYS:
        for p in range(PERIODS_PER_DAY):
            for assign in ASSIGNMENTS:
                class_id = assign["class_id"]
                teacher_id = assign["teacher_id"]
                assign_id = assign["id"]
                for room in ROOMS.values():
                    X[d, p, class_id, room["room_id"], teacher_id, assign_id] = model.NewBoolVar(
                        f"X_{d}_{p}_{class_id}_{room['room_id']}_{teacher_id}_{assign_id}"
                    )

    # Constraint: Each assignment must be scheduled exactly once
    for assign in ASSIGNMENTS:
        class_id = assign["class_id"]
        teacher_id = assign["teacher_id"]
        assign_id = assign["id"]
        model.Add(
            sum(
                X[d, p, class_id, room["room_id"], teacher_id, assign_id]
                for d in DAYS
                for p in range(PERIODS_PER_DAY)
                for room in ROOMS.values()
            ) == 1
        )

    # Teacher conflict constraint
    for d in DAYS:
        for p in range(PERIODS_PER_DAY):
            for teacher_id in {a["teacher_id"] for a in ASSIGNMENTS}:
                model.Add(
                    sum(
                        X[d, p, a["class_id"], room["room_id"], teacher_id, a["id"]]
                        for a in ASSIGNMENTS if a["teacher_id"] == teacher_id
                        for room in ROOMS.values()
                    ) <= 1
                )

    # Room conflict constraint
    for d in DAYS:
        for p in range(PERIODS_PER_DAY):
            for room in ROOMS.values():
                model.Add(
                    sum(
                        X[d, p, a["class_id"], room["room_id"], a["teacher_id"], a["id"]]
                        for a in ASSIGNMENTS
                    ) <= 1
                )

    # Room-level constraint
    for d in DAYS:
        for p in range(PERIODS_PER_DAY):
            for assign in ASSIGNMENTS:
                class_id = assign["class_id"]
                teacher_id = assign["teacher_id"]
                assign_id = assign["id"]
                class_level = next(c["level"] for c in CLASSES if c["class_id"] == class_id)
                for room in ROOMS.values():
                    if class_level not in room["allowed_levels"]:
                        model.Add(X[d, p, class_id, room["room_id"], teacher_id, assign_id] == 0)

    # Teacher unavailability constraint
    for teacher_id, unavailable_times in TEACHER_UNAVAILABILITY.items():
        for (day, period) in unavailable_times:
            for assign in ASSIGNMENTS:
                if assign["teacher_id"] == teacher_id:
                    class_id = assign["class_id"]
                    assign_id = assign["id"]
                    for room in ROOMS.values():
                        model.Add(X[day, period, class_id, room["room_id"], teacher_id, assign_id] == 0)

    # Objective: Minimize total number of days used
    model.Minimize(
        sum(
            X[d, p, a["class_id"], r["room_id"], a["teacher_id"], a["id"]]
            for d in DAYS
            for p in range(PERIODS_PER_DAY)
            for a in ASSIGNMENTS
            for r in ROOMS.values()
        )
    )

    # Solve the model
    solver = cp_model.CpSolver()
    status = solver.Solve(model)

    if status in [cp_model.OPTIMAL, cp_model.FEASIBLE]:
        schedule = []
        for d in DAYS:
            for p in range(PERIODS_PER_DAY):
                for assign in ASSIGNMENTS:
                    class_id = assign["class_id"]
                    teacher_id = assign["teacher_id"]
                    assign_id = assign["id"]
                    for room in ROOMS.values():
                        if solver.Value(X[d, p, class_id, room["room_id"], teacher_id, assign_id]) == 1:
                            schedule.append({
                                "day": d,
                                "period": p + 1,
                                "class_id": class_id,
                                "room_id": room["room_id"],
                                "teacher_id": teacher_id,
                                "assign_id": assign_id,
                            })
        return {"status": "success", "schedule": schedule,"assign":ASSIGNMENTS}
    
    return {"status": "failure", "message": "No feasible solution found"}
