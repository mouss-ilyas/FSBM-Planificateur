import React, { useEffect, useState } from "react";
import TeacherInfo from "../prof/TeacherInfo";
import AddTeacherForm from "./addteacher";
import { API_URL } from "./../config";
const Teachers = () => {
  const [teachersinfo, setTeachersInfo] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedIdTeachers, setSelectedIdTeachers] = useState("");

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await fetch(`${API_URL}/teachers/`);
        const data = await response.json();

        if (response.ok) {
          setTeachersInfo(data);
        } else {
          setMessage("Erreur lors du chargement des enseignants.");
        }
      } catch (error) {
        setMessage("Erreur lors du chargement des enseignants.");
      }
    };

    fetchTeachers();
  }, []);

  const handleChange = (event) => {
    setSelectedIdTeachers(event.target.value);
  };

  return (
    <div >
      <h2 className="text-center">
        {" "}
        <strong>
          <q>gérer les enseignements</q>
        </strong>{" "}
      </h2>
      <hr />

      <AddTeacherForm />
      <hr />
      <h4 >
        <strong> 2) Détail et modification </strong>
      </h4>

      {message && <p style={{ color: "red" }}>{message}</p>}
      <select onChange={handleChange}>
        <option value="">choisir un enseignement</option>
        {teachersinfo.map((teacher) => (
          <option key={teacher.id} value={teacher.id}>
            {teacher.name}
          </option>
        ))}
      </select>

      {selectedIdTeachers && <TeacherInfo teacherId={selectedIdTeachers} />}
    </div>
  );
};

export default Teachers;
