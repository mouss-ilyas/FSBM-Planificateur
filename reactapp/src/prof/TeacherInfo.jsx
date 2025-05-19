import React, { useState, useEffect } from "react";
import Availability from "./avaibility";
import Table from "../tableconstract/tableconstract";
const TeacherInfo = ({teacherId}) => {
    const [teacher, setTeacher] = useState({
        name: "",
        email: "",
    });
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    const jwtToken = localStorage.getItem("jwt_token");

    useEffect(() => {
        const fetchTeacherData = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/teachers/`, {
                    headers: {
                        "Authorization": `Bearer ${jwtToken}`,
                    },
                });
                const data = await response.json();
                if (response.ok) {
                    const teacherData = data.find(teacher => teacher.id === parseInt(teacherId));
                    if (teacherData) {
                        setTeacher(teacherData);
                    } else {
                        setMessage("Teacher not found");
                    }
                } else {
                    setMessage("Error fetching teacher data");
                }
            } catch (error) {
                setMessage("Error fetching teacher data");
            } finally {
                setLoading(false);
            }
        };
        fetchTeacherData();
    }, [teacherId, jwtToken]);

    const handleTeacherChange = (e) => {
        const { name, value } = e.target;
        setTeacher({ ...teacher, [name]: value });
    };

    const handleTeacherSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`http://127.0.0.1:8000/teachers/${teacherId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${jwtToken}`,
                },
                body: JSON.stringify(teacher),
            });

            if (response.ok) {
                setMessage("Teacher information updated successfully!");
            } else {
                setMessage("Failed to update teacher information.");
            }
        } catch (error) {
            setMessage("Error updating teacher information.");
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="teacherinfo  ">
            <div className="availability-container">
            <h3 className="availability-title text-center"> a) modifier les informations de l'enseignement</h3>
            {message && <p>{message}</p>}
            <form onSubmit={handleTeacherSubmit}>
                <div>
                    <label>Nom:</label>
                    <input
                        type="text"
                        name="name"
                        value={teacher.name}
                        onChange={handleTeacherChange}
                        required
                    />
                </div>
                <div>
                    <label>Email :</label>
                    <input
                        type="email"
                        name="email"
                        value={teacher.email}
                        onChange={handleTeacherChange}
                        required
                    />
                </div>
                <button className="mt-2" type="submit">Update Information</button>
            </form>
            </div>

         
            <Availability  teacher_id={teacherId}/>
            <Table type={1} id={Number(teacherId)} />
        </div>
    );
};

export default TeacherInfo;
