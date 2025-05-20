import React, { useState } from "react";

import { API_URL } from "./../config";
const UpdatePassword = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const teacherId = localStorage.getItem("teacher_id");  // Get teacher_id from localStorage
    const jwtToken = localStorage.getItem("jwt_token");  // Get jwt_token from localStorage

    // Check if teacherId is not set
    if (!teacherId) {
        return <p>Error: Teacher ID is missing!</p>;  // Display an error if teacherId is missing
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate if the passwords match
        if (newPassword !== confirmPassword) {
            setMessage("Les mots de passe ne correspondent pas.");
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/teachers/password/${teacherId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${jwtToken}`,  // Use jwtToken for authorization
                    },
                    body: JSON.stringify({
                        password: newPassword,
                    }),
                }
            );

            if (response.ok) {
                setMessage("Mot de passe mis à jour avec succès !");
            } else {
                const errorData = await response.json();
                setMessage(`Erreur: ${errorData.detail}`);
            }
        } catch (error) {
            setMessage("Erreur lors de la mise à jour du mot de passe.");
        }
    };

    return (
        <div>
            <h3>Mettre à jour le mot de passe</h3>
            {message && <p>{message}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="newPassword">Nouveau mot de passe:</label>
                    <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="confirmPassword">Confirmer le mot de passe:</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Mettre à jour le mot de passe</button>
            </form>
        </div>
    );
};

export default UpdatePassword;
