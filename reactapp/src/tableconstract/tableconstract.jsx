import "./tablecontract.css"
import { useEffect, useState } from "react";

const Table = ({ type, id }) => {
  const [classesNames, setClassesNames] = useState({});
  const [teachersNames, setTeachersNames] = useState({});
  const [roomsNames, setRoomsNames] = useState({});
  const [schedule, setSchedule] = useState([]);
  const [filteredSchedule, setFilteredSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch classes
  useEffect(() => {
    fetch("http://127.0.0.1:8000/admin/classes/")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch classes");
        return response.json();
      })
      .then((data) => {
        const classDict = {};
        data.forEach((cls) => {
          classDict[cls.id] = cls.name;
        });
        setClassesNames(classDict);
      })
      .catch((error) => {
        console.error("Error fetching classes:", error);
        setError("Failed to load classes data");
      });
  }, []);
    
  // Fetch teachers
  useEffect(() => {
    fetch("http://127.0.0.1:8000/teachers/")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch teachers");
        return response.json();
      })
      .then((data) => {
        const teacherDict = {};
        data.forEach((teacher) => {
          teacherDict[teacher.id] = teacher.name;
        });
        setTeachersNames(teacherDict);
      })
      .catch((error) => {
        console.error("Error fetching teachers:", error);
        setError("Failed to load teachers data");
      });
  }, []);
  
  // Fetch rooms
  useEffect(() => {
    fetch("http://127.0.0.1:8000/admin/rooms/")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch rooms");
        return response.json();
      })
      .then((data) => {
        const roomDict = {};
        data.forEach((room) => {
          roomDict[room.id] = room.name;
        });
        setRoomsNames(roomDict);
      })
      .catch((error) => {
        console.error("Error fetching rooms:", error);
        setError("Failed to load rooms data");
      });
  }, []);
  
  // Fetch full schedule
  useEffect(() => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/get_schedule")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch schedule");
        return response.json();
      })
      .then((data) => {
        setSchedule(data.schedule);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching schedule:", error);
        setError("Failed to load schedule data");
        setLoading(false);
      });
  }, []);
  
  // Filter schedule based on type and id
  useEffect(() => {
    if (schedule.length > 0 && type && id) {
      let filtered = [];
      const numericId = parseInt(id, 10);
      const numericType = parseInt(type, 10);
      
      // Type: 1 = teacher, 2 = room, 3 = class
      switch (numericType) {
        case 1: // Teacher
          filtered = schedule.filter((e) => e.teacher_id === numericId);
          break;
        case 2: // Room
          filtered = schedule.filter((e) => e.room_id === numericId);
          break;
        case 3: // Class
          filtered = schedule.filter((e) => e.class_id === numericId);
          break;
        default:
          console.warn("Invalid type:", type);
          setError(`Invalid type: ${type}. Expected 1 (teacher), 2 (room), or 3 (class).`);
          return;
      }
      setFilteredSchedule(filtered);
    }
  }, [schedule, type, id]);

  // Structure the timetable
  const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
  const periods = [1, 2, 3, 4, 5];
  const periodTimes = [
    "8:30 - 10:00",
    "10:15 - 11:45",
    "12:00 - 13:30",
    "13:25 - 15:15",
    "15:30 - 17:00",
  ];

  // Initialize empty timetable
  const tableData = {};
  days.forEach((day) => {
    tableData[day] = {};
    periods.forEach((period) => {
      tableData[day][period] = null;
    });
  });

  // Fill timetable with filtered schedule data
  filteredSchedule.forEach((entry) => {
    if (entry.day >= 1 && entry.day <= 5 && entry.period >= 1 && entry.period <= 5) {
      const dayName = days[entry.day - 1]; // Convert from 1-indexed to 0-indexed array
      const period = entry.period;

      tableData[dayName][period] = {
        module: entry.module_name,
        room: roomsNames[entry.room_id] || `Room ${entry.room_id}`,
        teacher: teachersNames[entry.teacher_id] || `Teacher ${entry.teacher_id}`,
        class_name: classesNames[entry.class_id] || `Class ${entry.class_id}`,
        class_id: entry.class_id,
        type: parseInt(entry.type_, 10),
        group: entry.grp_number
      };
    }
  });

  if (loading) {
    return (
      <div className="schedule-container">
        <div className="schedule-loading">
          <div className="loading-spinner"></div>
          Chargement de l'emploi du temps...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="schedule-container">
        <div className="schedule-error">{error}</div>
      </div>
    );
  }

  const getTypeLabel = () => {
    switch (parseInt(type, 10)) {
      case 1:
        return `Emploi d'enseignement: ${teachersNames[parseInt(id, 10)] || id}`;
      case 2:
        return `Emploi du salle: ${roomsNames[parseInt(id, 10)] || id}`;
      case 3:
        return `Emploi du classe: ${classesNames[parseInt(id, 10)] || id}`;
      default:
        return "Emploi du temps";
    }
  };

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h2 className="schedule-title">{getTypeLabel()}</h2>
        <p className="schedule-subtitle">Emploi du temps hebdomadaire</p>
      </div>

      <div className="schedule-table-container">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Jour / Heure</th>
              {periodTimes.map((time, i) => (
                <th key={i}>{time}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day}>
                <th className="day-header">{day}</th>
                {periods.map((period) => (
                  <td key={`${day}-${period}`}>
                    {tableData[day][period] ? (
                      <div className={`schedule-entry ${tableData[day][period].type === 1 ? 'cours' : 'td'}`}>
                        <div className="module-name">
                          {tableData[day][period].module}
                        </div>
                        
                        {/* Show class name if not filtering by class */}
                        {parseInt(type, 10) !== 3 && (
                          <div className="entry-detail class-detail">
                            <span className="entry-label">Classe:</span>
                            {tableData[day][period].class_name}
                          </div>
                        )}
                        
                        {/* Show teacher if not filtering by teacher */}
                        {parseInt(type, 10) !== 1 && (
                          <div className="entry-detail teacher-detail">
                            <span className="entry-label">Prof:</span>
                            {tableData[day][period].teacher}
                          </div>
                        )}
                        
                        {/* Show room if not filtering by room */}
                        {parseInt(type, 10) !== 2 && (
                          <div className="entry-detail room-detail">
                            <span className="entry-label">Salle:</span>
                            {tableData[day][period].room}
                          </div>
                        )}
                        
                        {/* Show type and group */}
                        <div className="entry-detail">
                          <span className="entry-label">Type:</span>
                          <span className={`type-badge ${tableData[day][period].type === 1 ? 'cours' : 'td'}`}>
                            {tableData[day][period].type === 1 ? "Cours" : "TD"}
                          </span>
                          {tableData[day][period].type === 2 && (
                            <span className="group-badge">
                              Groupe {tableData[day][period].group}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="empty-cell">-</div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;