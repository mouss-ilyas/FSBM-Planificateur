import React, { useState, useEffect } from "react";
import "./assign.css";
import { API_URL } from "./../config";
function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    teacher_id: "",
    class_id: "",
    module_name: "",
    type_: "",
  });
  const [editing, setEditing] = useState(null);
  const [filterTeacher, setFilterTeacher] = useState("");
  const [filterClass, setFilterClass] = useState("");

  useEffect(() => {
    fetchData(`${API_URL}/teachers/`, setTeachers);
    fetchData(`${API_URL}/admin/classes/`, setClasses);
    fetchData(`${API_URL}/admin/assignments/`, setAssignments);
  }, []);

  const fetchData = async (url, setter) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      setter(data);
    } catch (error) {
      console.error("Erreur de chargement:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `${API_URL}/admin/assignments/${editing.id}`
      : `${API_URL}/admin/assignments/`;

    const options = {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (method === "POST") {
        setAssignments([...assignments, data]);
      } else {
        setAssignments(assignments.map((a) => (a.id === data.id ? data : a)));
      }
      setEditing(null);
      setFormData({ teacher_id: "", class_id: "", module_name: "", type_: "" });
    } catch (error) {
      console.error("Erreur d'ajout/mise à jour:", error);
    }
  };

  const handleEdit = (assignment) => {
    setFormData(assignment);
    setEditing(assignment);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/admin/assignments/${id}`, {
        method: "DELETE",
      });
      setAssignments(assignments.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Erreur de suppression:", error);
    }
  };

  const filteredAssignments = assignments.filter(
    (a) =>
      (!filterTeacher || a.teacher_id.toString() === filterTeacher) &&
      (!filterClass || a.class_id.toString() === filterClass)
  );

  return (
    <div className="App">
      <h2 className="text-center ">
        <strong>
          <q> Gestion des affectations </q>
        </strong>
      </h2>
      <div className="availability-container">
        <h4>
          <strong>1) Ajouter une nouvelle salle</strong>
        </h4>
        <form onSubmit={handleSubmit}>
          <select
            name="teacher_id"
            value={formData.teacher_id}
            onChange={handleChange}
            required
          >
            <option value="">Sélectionner un enseignant</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <select
            name="class_id"
            value={formData.class_id}
            onChange={handleChange}
            required
          >
            <option value="">Sélectionner une classe</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="module_name"
            value={formData.module_name}
            onChange={handleChange}
            placeholder="Module"
            required
          />

          <select
            name="type_"
            value={formData.type_}
            onChange={handleChange}
            required
          >
            <option value="">Sélectionner le type</option>
            <option value="1">AMP</option>
            <option value="2">TD</option>
          </select>

          <button type="submit">{editing ? "Modifier" : "Ajouter"}</button>
        </form>
      </div>

      <div>
        <label>Filtrer par enseignant:</label>
        <select
          name="filterTeacher"
          value={filterTeacher}
          onChange={(e) => setFilterTeacher(e.target.value)}
        >
          <option value="">Tous</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <label>Filtrer par classe:</label>
        <select
          name="filterClass"
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
        >
          <option value="">Toutes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="table-container">
  <div className="table-wrapper">
    <table className="modern-table">
      <thead>
        <tr>
          <th>Enseignant</th>
          <th>Classe</th>
          <th>Module</th>
          <th>Type</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredAssignments.map((a) => {
          const teacher = teachers.find((t) => t.id === a.teacher_id);
          const classObj = classes.find((c) => c.id === a.class_id);
          return (
            <tr key={a.id}>
              <td>
                <div className="teacher-name">
                  {teacher ? teacher.name : "Inconnu"}
                </div>
              </td>
              <td>
                <div className="class-name">
                  {classObj ? classObj.name : "Inconnu"}
                </div>
              </td>
              <td>
                <div className="module-name">
                  {a.module_name}
                </div>
              </td>
              <td>
                <span className={`type-badge ${a.type_ === 1 ? 'amp' : 'td'}`}>
                  {a.type_ === 1 ? "AMP" : "TD"}
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  <button 
                    className="action-button edit-button" 
                    onClick={() => handleEdit(a)}
                  >
                    Modifier
                  </button>
                  <button 
                    className="action-button delete-button" 
                    onClick={() => handleDelete(a.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
</div>
    </div>
  );
}

export default Assignments;
