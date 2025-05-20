import { useState, useEffect } from "react";
import { API_URL } from "./../config";

const Branche = () => {
  const [branches, setBranches] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success"); // success or error
  const [brancheName, setBrancheName] = useState("");
  const [numberOfYears, setNumberOfYears] = useState(1); // Number of years field
  const [selectedBrancheId, setSelectedBrancheId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem("jwt_token");

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    // Clear message after 5 seconds
    setTimeout(() => setMessage(""), 5000);
  };

  const fetchBranches = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/branche/`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setBranches(data);
      } else {
        showMessage(data.detail || "Erreur lors du chargement des branches.", "error");
      }
    } catch (error) {
      showMessage("Erreur de connexion au serveur.", "error");
    }
  };

  // Add Method
  const handleAddBranche = async () => {
    if (!brancheName.trim()) {
      showMessage("Veuillez entrer un nom de branche.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/branche/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: brancheName.trim(), n: numberOfYears }),
      });
      const data = await response.json();
      if (response.ok) {
        setBranches([...branches, data.branche]);
        showMessage("Branche ajoutée avec succès.", "success");
        setBrancheName("");
        setNumberOfYears(1); // Reset number of years
      } else {
        showMessage(data.detail || "Erreur lors de l'ajout de la branche.", "error");
      }
    } catch (error) {
      showMessage("Erreur de connexion au serveur.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Modify Method - Now includes numberOfYears in the update
  const handleModifyBranche = async () => {
    if (!selectedBrancheId) return;
    if (!brancheName.trim()) {
      showMessage("Veuillez entrer un nom de branche.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/admin/branche/${selectedBrancheId}?name=${encodeURIComponent(brancheName.trim())}&n=${numberOfYears}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        showMessage("Branche mise à jour avec succès.", "success");
        setBrancheName("");
        setNumberOfYears(1);
        setSelectedBrancheId(null);
        await fetchBranches(); // Refresh the data
      } else {
        showMessage(data.detail || "Erreur lors de la mise à jour de la branche.", "error");
      }
    } catch (error) {
      showMessage("Erreur de connexion au serveur.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Method
  const handleDeleteBranche = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette branche ?")) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/branche/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        showMessage(data.message || "Branche supprimée avec succès.", "success");
        setSelectedBrancheId(null);
        setBrancheName("");
        setNumberOfYears(1);
        await fetchBranches(); // Refresh the data
      } else {
        showMessage(data.error || data.detail || "Erreur lors de la suppression de la branche.", "error");
      }
    } catch (error) {
      showMessage("Erreur de connexion au serveur.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // Populate brancheName and numberOfYears inputs when a branch is selected for modification
  useEffect(() => {
    if (selectedBrancheId) {
      const selectedBranch = branches.find(b => b.id === parseInt(selectedBrancheId));
      if (selectedBranch) {
        setBrancheName(selectedBranch.name);
        setNumberOfYears(selectedBranch.number_of_years || 1);
      }
    } else {
      setBrancheName("");
      setNumberOfYears(1);
    }
  }, [selectedBrancheId, branches]);

  return (
    <div>
      {message && (
        <p style={{
          color: messageType === "success" ? "green" : "red",
          padding: "10px",
          backgroundColor: messageType === "success" ? "#d4edda" : "#f8d7da",
          border: `1px solid ${messageType === "success" ? "#c3e6cb" : "#f5c6cb"}`,
          borderRadius: "5px",
          marginBottom: "15px"
        }}>
          {message}
        </p>
      )}

      {/* Section for Add */}
      <h3>Ajouter une nouvelle branche</h3>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Nom de la branche"
          value={brancheName}
          onChange={(e) => setBrancheName(e.target.value)}
          disabled={isLoading}
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <input
          type="number"
          placeholder="Nombre d'années"
          value={numberOfYears}
          onChange={(e) => setNumberOfYears(Math.max(1, parseInt(e.target.value) || 1))}
          disabled={isLoading}
          min="1"
          style={{ marginRight: "10px", padding: "5px", width: "150px" }}
        />
        <button
          onClick={handleAddBranche}
          disabled={isLoading}
          className="mt-3"
        >
          {isLoading ? "Ajout..." : "Ajouter"}
        </button>
      </div>

      <hr />

      {/* Section for Modify and Delete */}
      <h3>Modifier ou supprimer une branche existante</h3>
      <div style={{ marginBottom: "20px" }}>
        <select
          onChange={(e) => setSelectedBrancheId(e.target.value)}
          value={selectedBrancheId || ""}
          disabled={isLoading}
          style={{ marginBottom: "10px", padding: "5px", width: "300px" }}
        >
          <option value="">Sélectionner une branche</option>
          {branches.map((branche) => (
            <option key={branche.id} value={branche.id}>
              {branche.name} ({branche.number_of_years} années)
            </option>
          ))}
        </select>

        {selectedBrancheId && (
          <div style={{ marginTop: "10px" }}>
            <input
              type="text"
              placeholder={`Nouveau nom pour "${branches.find(b => b.id === parseInt(selectedBrancheId))?.name}"`}
              value={brancheName}
              onChange={(e) => setBrancheName(e.target.value)}
              disabled={isLoading}
              style={{ marginRight: "10px", padding: "5px", width: "250px", marginBottom: "10px" }}
            />
            <input
              type="number"
              placeholder="Nombre d'années"
              value={numberOfYears}
              onChange={(e) => setNumberOfYears(Math.max(1, parseInt(e.target.value) || 1))}
              disabled={isLoading}
              min="1"
              style={{ marginRight: "10px", padding: "5px", width: "150px", marginBottom: "10px" }}
            />
            <div style={{ marginTop: "10px" }}>
              <button
                onClick={handleModifyBranche}
                disabled={isLoading}
                style={{ margin: "0 auto", marginBottom:"6px", padding: "5px 15px" }}
              >
                {isLoading ? "Modification..." : "Modifier"}
              </button>
              <button
                onClick={() => handleDeleteBranche(selectedBrancheId)}
                disabled={isLoading}
                style={{
                  backgroundColor: "red",
                  color: "white",
                  padding: "5px 15px",
                  border: "none",
                  borderRadius: "3px"
                }}
              >
                {isLoading ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Branche;
