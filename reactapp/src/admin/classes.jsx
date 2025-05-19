import React, { useState, useEffect } from "react";
import Table from "../tableconstract/tableconstract";

const Classes = () => {
    const [classes, setClasses] = useState([]);
    const [branches, setBranches] = useState([]);
    const [message, setMessage] = useState("");
    const [selectedClass, setSelectedClass] = useState(null);
    const [form, setForm] = useState({ name: "", brancheid: "", level: "" });
    const token = localStorage.getItem("jwt_token");

    const levels = [
        { id: 1, name: "Licence" },
        { id: 2, name: "Master" },
        { id: 3, name: "Doctorat" }
    ];

    // Fetch branches and classes
    useEffect(() => {
        fetchBranches();
        fetchClasses();
    }, []);

    // Fetch branches from the API
    const fetchBranches = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/admin/branche/", {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setBranches(data);
            } else {
                setMessage("Error loading branches.");
            }
        } catch (error) {
            setMessage("Server connection error while loading branches.");
        }
    };

    // Fetch classes from the API
    const fetchClasses = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/admin/classes/", {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setClasses(data);
            } else {
                setMessage("Error loading classes.");
            }
        } catch (error) {
            setMessage("Server connection error.");
        }
    };

    // Handle input changes for form fields
    const handleInputChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Handle form submission for creating a new class
    const createClass = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/admin/classes/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),  // Ensure the correct keys are sent
            });

            if (response.ok) {
                setMessage("Class added successfully.");
                setForm({ name: "", brancheid: "", level: "" }); // Clear form after success
                fetchClasses();
            } else {
                setMessage("Error adding class.");
            }
        } catch (error) {
            setMessage("Server error while adding.");
        }
    };

    // Handle update functionality
    const updateClass = async () => {
        if (!selectedClass) return;

        try {
            const response = await fetch(`http://127.0.0.1:8000/admin/classes/${selectedClass}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name: form.name, level: form.level }),
            });

            if (response.ok) {
                setMessage("Class updated successfully.");
                fetchClasses();
            } else {
                setMessage("Error updating class.");
            }
        } catch (error) {
            setMessage("Server error while updating.");
        }
    };

    // Handle delete functionality
    const deleteClass = async () => {
        if (!selectedClass) return;

        try {
            const response = await fetch(`http://127.0.0.1:8000/admin/classes/${selectedClass}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                setMessage("Class deleted successfully.");
                setSelectedClass(null);
                fetchClasses();
            } else {
                setMessage("Error deleting class.");
            }
        } catch (error) {
            setMessage("Server error while deleting.");
        }
    };

    // Handle selecting a class for editing
    const handleClassSelection = (classId) => {
        setSelectedClass(classId);
        const selected = classes.find((c) => c.id === classId);
        setForm({ name: selected.name, brancheid: selected.branch_id, level: selected.level });
    };

    // Get branch name by ID
    const getBranchName = (branchId) => {
        const branch = branches.find((b) => b.id === branchId);
        return branch ? branch.name : "Unknown";
    };

    return (
   <div>
         <div>
         <h2 className="text-center "> <strong>  <q> Gestion des class </q> </strong> </h2>
         {message && <p style={{ color: "red" }}>{message}</p>}

            {/* Add Class Form */}
            <div>
            
            <div className="availability-container">
            <h4>1) ajouter nouvel class</h4>
                <input
                    type="text"
                    name="name"
                    placeholder="Class Name"
                    value={form.name}
                    onChange={handleInputChange}
                />
                <select name="brancheid" value={form.brancheid} onChange={handleInputChange}>
                    <option value="">Select Branch</option>
                    {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                            {branch.name}
                        </option>
                    ))}
                </select>
                <select name="level" value={form.level} onChange={handleInputChange}>
                    <option value="">Select Level</option>
                    {levels.map((level) => (
                        <option key={level.id} value={level.id}>
                            {level.name}
                        </option>
                    ))}
                </select>
                <button onClick={createClass}>Add Class</button>
            </div>
            </div>

            {/* Modify Class Form */}
            <h4> 2) modifier ou supprimer un class</h4>
            <select onChange={(e) => handleClassSelection(e.target.value)}>
                <option value="">Select a class</option>
                {classes.map((theClass) => (
                    <option key={theClass.id} value={theClass.id}>
                        {theClass.name} - {getBranchName(theClass.branch_id)} - {levels.find(l => l.id === theClass.level)?.name}
                    </option>
                ))}
            </select>

            {selectedClass && (
                <div className="availability-container">
                    <input
                        type="text"
                        name="name"
                        placeholder="nouveau class Name"
                        value={form.name}
                        onChange={handleInputChange}
                    />
                    <select name="brancheid" value={form.brancheid} onChange={handleInputChange}>
                        <option value="">Select Branch</option>
                        {branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>
                                {branch.name}
                            </option>
                        ))}
                    </select>
                    <select name="level" value={form.level} onChange={handleInputChange}>
                        <option value="">Select Level</option>
                        {levels.map((level) => (
                            <option key={level.id} value={level.id}>
                                {level.name}
                            </option>
                        ))}
                    </select>
                    <button onClick={updateClass} disabled={!selectedClass}>
                        modifier
                    </button>
                    <button className="mt-3" onClick={deleteClass} disabled={!selectedClass} style={{ backgroundColor: "red", color: "white" }}>
                       supprimer
                    </button>
                </div>
            )}
        </div>
        <div>
        <Table type={3} id={Number(selectedClass)} />
        </div>
   </div>
    );
};

export default Classes;
