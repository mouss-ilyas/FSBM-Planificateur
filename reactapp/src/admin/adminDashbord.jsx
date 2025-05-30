import { Route, Routes, Link } from "react-router-dom";
import { API_URL } from "./../config";
import Rooms from "./rooms";
import Teachers from "./teachers";
import Classes from "./classes";
import Assigne from "./assign";
import Branche from "./branche";
import "./admin.css"
const AdminDashbord = () => {
  const token = localStorage.getItem("jwt_token"); // Remplace par le token réel

  const handleClick = async () => {
    try {
      const response = await fetch(`${API_URL}/schedule`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        alert("Time management generated successfully!");
      } else {
        alert("Error generating schedule.");
      }
    } catch (error) {
      alert("Server connection error.");
    }
  };

  return (
    <>
      <div className="section-content">
        <div className="les-liens">
          <div>
            <Link to="/adminDashbord/rooms">salles</Link>
          </div>
          <div>
            <Link to="/adminDashbord/teachers">enseignement</Link>
          </div>
          <div>
            <Link to="/adminDashbord/classes">Classes</Link>
          </div>
          <div>
            <Link to="/adminDashbord/Branche">Branches</Link>
          </div>
          <div>
            <Link to="/adminDashbord/assign">affectations</Link>
          </div>
        </div>
        <Routes>
          <Route path="rooms" element={<Rooms />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="classes" element={<Classes />} />
          <Route path="assign" element={<Assigne />} />
          <Route path="Branche" element={<Branche />} />
        </Routes>

        <button onClick={handleClick} className="mt-3">Generate new time management</button>
      </div>
    </>
  );
};

export default AdminDashbord;
