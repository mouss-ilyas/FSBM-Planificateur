import React, { useState, useEffect } from "react";
import Table from "../tableconstract/tableconstract";
import { API_URL } from "./../config";
const Rooms = () => {
    const [rooms, setRooms] = useState([]);
    const [message, setMessage] = useState("");
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [addForm, setAddForm] = useState({ name: "", room_type_id: "", allowed_levels: [] });
    const [modifyForm, setModifyForm] = useState({ name: "", room_type_id: "", allowed_levels: [] });
    const token = localStorage.getItem("jwt_token");

    const roomTypes = [
        { id: 1, name: "AMP" },
        { id: 2, name: "TD" }
    ];

    const allowedLevels = [
        { id: 1, name: "Licence" },
        { id: 2, name: "Master" },
        { id: 3, name: "Doctorat" }
    ];

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/rooms/`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setRooms(data);
            } else {
                setMessage("Erreur lors du chargement des salles.");
            }
        } catch (error) {
            setMessage("Erreur de connexion au serveur.");
        }
    };

    const handleInputChange = (e, formType) => {
        if (formType === "add") {
            setAddForm({ ...addForm, [e.target.name]: e.target.value });
        } else {
            setModifyForm({ ...modifyForm, [e.target.name]: e.target.value });
        }
    };

    const handleCheckboxChange = (levelId, formType) => {
        if (formType === "add") {
            setAddForm((prevForm) => {
                const updatedLevels = prevForm.allowed_levels.includes(levelId)
                    ? prevForm.allowed_levels.filter((id) => id !== levelId)
                    : [...prevForm.allowed_levels, levelId];
                return { ...prevForm, allowed_levels: updatedLevels };
            });
        } else {
            setModifyForm((prevForm) => {
                const updatedLevels = prevForm.allowed_levels.includes(levelId)
                    ? prevForm.allowed_levels.filter((id) => id !== levelId)
                    : [...prevForm.allowed_levels, levelId];
                return { ...prevForm, allowed_levels: updatedLevels };
            });
        }
    };

    const handleRoomSelection = (roomId) => {
        const room = rooms.find((r) => r.id === parseInt(roomId));
        setSelectedRoom(room.id);
        setModifyForm({
            name: room.name,
            room_type_id: room.room_type_id.toString(),
            allowed_levels: room.allowed_levels,
        });
    };

    const createRoom = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/rooms/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(addForm),
            });

            if (response.ok) {
                setMessage("Salle ajoutée avec succès.");
                setAddForm({ name: "", room_type_id: "", allowed_levels: [] });
                fetchRooms();
            } else {
                setMessage("Erreur lors de l'ajout de la salle.");
            }
        } catch (error) {
            setMessage("Erreur serveur lors de l'ajout.");
        }
    };

    const updateRoom = async () => {
        if (!selectedRoom) return;

        try {
            const response = await fetch(`${API_URL}/admin/rooms/${selectedRoom}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(modifyForm),
            });

            if (response.ok) {
                setMessage("Salle mise à jour avec succès.");
                fetchRooms();
            } else {
                setMessage("Erreur lors de la mise à jour.");
            }
        } catch (error) {
            setMessage("Erreur serveur lors de la mise à jour.");
        }
    };

    const deleteRoom = async () => {
        if (!selectedRoom) return;

        try {
            const response = await fetch(`${API_URL}/admin/rooms/${selectedRoom}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                setMessage("Salle supprimée avec succès.");
                setSelectedRoom(null);
                fetchRooms();
            } else {
                setMessage("Erreur lors de la suppression.");
            }
        } catch (error) {
            setMessage("Erreur serveur lors de la suppression.");
        }
    };

    return (
        <div className="salles">
            <h2 className="text-center "> <strong>  <q> Gestion des Salles </q> </strong> </h2>
            {message && <p style={{ color: "red" }}>{message}</p>}

            {/* Formulaire pour Ajouter une Salle */}
            <h4><strong>1) Ajouter une nouvelle salle</strong></h4>
            <hr />
            <div >
                <label htmlFor="namesalle" >Nom de la salle:</label>
                <input
                id="namesalle"
                    type="text"
                    name="name"
                    placeholder="Nom de la salle"
                    value={addForm.name}
                    onChange={(e) => handleInputChange(e, "add")}
                />
                <select  name="room_type_id" value={addForm.room_type_id} onChange={(e) => handleInputChange(e, "add")}>
                    <option value="">Sélectionner un type</option>
                    {roomTypes.map((type) => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                </select>
                <div className="checkbox-container">
                <h6>les niveaux autorisés</h6>
                    {allowedLevels.map((level) => (
                        <label key={level.id} style={{ marginRight: "10px" }}>
                            <input
                                type="checkbox"
                                checked={addForm.allowed_levels.includes(level.id)}
                                onChange={() => handleCheckboxChange(level.id, "add")}
                            />
                            {level.name}
                        </label>
                    ))}
                </div>
                <button onClick={createRoom}>Ajouter</button>
            </div>
<hr />
            {/* Formulaire pour Modifier une Salle */}
            <h4><strong> 2) Modifier une Salle</strong></h4>
      
            <select onChange={(e) => handleRoomSelection(e.target.value)}>
                <option value="">Sélectionner une salle</option>
                {rooms.map((room) => (
                    <option key={room.id} value={room.id}>{room.name}</option>
                ))}
            </select>

            {selectedRoom && (
                <div>
                    
                    <input
                        type="text"
                        name="name"
                        placeholder="Nom de la salle"
                        value={modifyForm.name}
                        onChange={(e) => handleInputChange(e, "modify")}
                    />
                    <select name="room_type_id" value={modifyForm.room_type_id} onChange={(e) => handleInputChange(e, "modify")}>
                        <option value="">Sélectionner un type</option>
                        {roomTypes.map((type) => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                    </select>
                    <div className="checkbox-container">
                    <h6>les niveaux autorisés</h6>
                        {allowedLevels.map((level) => (
                            <label key={level.id} style={{ marginRight: "10px" }}>
                                <input
                                    type="checkbox"
                                    checked={modifyForm.allowed_levels.includes(level.id)}
                                    onChange={() => handleCheckboxChange(level.id, "modify")}
                                />
                                {level.name}
                            </label>
                        ))}
                    </div>
                    <button  
                    onClick={updateRoom} disabled={!selectedRoom}>Modifier</button>
                    <button className="mt-2" onClick={deleteRoom} disabled={!selectedRoom} style={{ backgroundColor: "red", color: "white" }}>
                        Supprimer
                    </button>
                
                </div>
                
            )}

            <Table type={2} id={Number(selectedRoom)} />
        </div>
    );
};

export default Rooms;
