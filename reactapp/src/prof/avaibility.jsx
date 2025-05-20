import "./avaibility.css"
import React, { useState, useEffect } from "react";
import { API_URL } from "./../config";

const Availability = ({ teacher_id }) => {
    const [availability, setAvailability] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("jwt_token");

    useEffect(() => {
        const fetchAvailability = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/teachers/teacher_availability/${teacher_id}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await response.json();

                if (response.ok) {
                    setAvailability(data);
                    setMessage("");
                } else {
                    setMessage("Erreur lors du chargement des disponibilités.");
                }
            } catch (error) {
                setMessage("Erreur lors du chargement des disponibilités.");
            } finally {
                setLoading(false);
            }
        };

        fetchAvailability();
    }, [teacher_id]);

    const handleAvailabilityClick = async (dayOfWeek, period) => {
        const availabilityExists = availability.some(
            (avail) => avail.day_of_week === dayOfWeek.toString() && avail.period === period
        );

        if (availabilityExists) {
            const availabilityToDelete = availability.find(
                (avail) => avail.day_of_week === dayOfWeek.toString() && avail.period === period
            );

            try {
                const response = await fetch(
                    `${API_URL}/teachers/teacher_availability/${teacher_id}/${availabilityToDelete.id}`,
                    {
                        method: "DELETE",
                        headers: { "Authorization": `Bearer ${token}` },
                    }
                );

                if (response.ok) {
                    setAvailability(availability.filter((avail) => avail.id !== availabilityToDelete.id));
                    setMessage("Disponibilité supprimée avec succès !");
                    setTimeout(() => setMessage(""), 3000);
                } else {
                    setMessage("Échec de la suppression de la disponibilité.");
                    setTimeout(() => setMessage(""), 3000);
                }
            } catch (error) {
                setMessage("Erreur lors de la suppression de la disponibilité.");
                setTimeout(() => setMessage(""), 3000);
            }
        } else {
            try {
                const response = await fetch(`${API_URL}/teachers/teacher_availability/${teacher_id}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({ day_of_week: dayOfWeek.toString(), period: period }),
                });

                if (response.ok) {
                    const newAvailability = await response.json();
                    setAvailability([...availability, newAvailability]);
                    setMessage("Disponibilité ajoutée avec succès !");
                    setTimeout(() => setMessage(""), 3000);
                } else {
                    const errorData = await response.json();
                    setMessage(`Erreur ajout disponibilité: ${errorData.detail}`);
                    setTimeout(() => setMessage(""), 3000);
                }
            } catch (error) {
                setMessage("Erreur lors de l'ajout de la disponibilité.");
                setTimeout(() => setMessage(""), 3000);
            }
        }
    };

    const renderAvailabilityTable = () => {
        const daysOfWeek = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
        const periods = [
            "8:30 - 10:00",
            "10:15 - 11:45",
            "12:00 - 13:30",
            "13:25 - 15:15",
            "15:30 - 17:00"
        ];

        const availabilityMap = availability.reduce((acc, avail) => {
            acc[avail.day_of_week] = acc[avail.day_of_week] || {};
            acc[avail.day_of_week][avail.period] = true;
            return acc;
        }, {});

        return (
            <table className="availability-table">
                <thead>
                    <tr>
                        <th>Jour</th>
                        {periods.map((period, index) => (
                            <th key={index}>{period}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {daysOfWeek.map((day, index) => (
                        <tr key={index}>
                            <td>{day}</td>
                            {periods.map((_, pIndex) => {
                                const isAvailable = availabilityMap[(index + 1).toString()]?.[(pIndex + 1)];
                                return (
                                    <td key={pIndex}>
                                        <div
                                            className={`availability-cell ${isAvailable ? 'available' : 'not-available'}`}
                                            data-tooltip={isAvailable ? 'Cliquez pour rendre indisponible' : 'Cliquez pour rendre disponible'}
                                            onClick={() => handleAvailabilityClick(index + 1, pIndex + 1)}
                                        >
                                            {isAvailable ? "❌" : "✔️"}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    if (loading) {
        return (
            <div className="availability-container">
                <div className="availability-loading">
                    <div className="loading-spinner"></div>
                    Chargement des disponibilités...
                </div>
            </div>
        );
    }

    return (
        <div className="availability-container">
            <div className="availability-header">
                <h2 className="availability-title">b) Gestion des Disponibilités</h2>
                <p className="availability-subtitle">Cliquez sur les créneaux pour modifier votre disponibilité</p>
            </div>

            {message && (
                <div className={`availability-message ${message.includes('succès') ? 'success' : 'error'}`}>
                    {message}
                </div>
            )}

            {renderAvailabilityTable()}

            <div className="availability-legend">
                <div className="legend-item">
                    <div className="legend-color not-available">✔️</div>
                    <span>Disponible</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color available">❌</div>
                    <span>Non disponible</span>
                </div>
            </div>
        </div>
    );
};

export default Availability;