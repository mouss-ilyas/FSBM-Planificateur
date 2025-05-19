import { useEffect, useState, useRef } from "react";
import Table from "../tableconstract/tableconstract";
import "./consuler.css"
const Consulter = () => {
  const classRef = useRef(null);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);

  // Fetch classes from backend
  useEffect(() => {
    fetch("http://127.0.0.1:8000/admin/classes/")
      .then((response) => response.json())
      .then((data) => setClasses(data))
      .catch((error) => console.error("Error fetching classes:", error));
  }, []);

  // Get Level Name Function
  const getLevelName = (level) => {
    switch (level) {
      case 1:
        return "License";
      case 2:
        return "Master";
      case 3:
        return "Doctorat";
      default:
        return "Inconnu";
    }
  };

  // Handle filtering
  const filterEmploi = () => {
    if (classRef.current) {
      setSelectedClassId(parseInt(classRef.current.value));
    }
  };

  return (
    <div className="consultation-page p-3 section-content">
      <h4 className="text-center"> veuillez choisir votre classe :</h4>

      {/* Filter by Level */}
      <div>
<ul>
  <li>      <label htmlFor="level-filter">Filtrer par niveau :</label>
      <select
        id="level-filter"
        value={selectedLevel}
        onChange={(e) => setSelectedLevel(e.target.value)}
      >
        <option value="">Tous</option>
        <option value="1">License</option>
        <option value="2">Master</option>
        <option value="3">Doctorat</option>
      </select></li>
  <li>
  <label htmlFor="class-select">Choisissez une classe :</label>
      <select id="class-select" ref={classRef}>
        {classes
          .filter((cls) =>
            selectedLevel ? cls.level === parseInt(selectedLevel) : true
          )
          .map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name} - Niveau: {getLevelName(cls.level)}
            </option>
          ))}
      </select>
  </li>
</ul>

     
      </div>

      <button onClick={filterEmploi} >Consulter l'emploi du temps</button>

      {selectedClassId && <Table type={3} id={selectedClassId} />}
    </div>
  );
};

export default Consulter;
