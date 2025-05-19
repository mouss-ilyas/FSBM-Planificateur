import { useState, useEffect } from "react";

const Branche = () => {
  const [branches, setBranches] = useState([]);
  const [message, setMessage] = useState("");
  const [brancheName, setBrancheName] = useState("");
  // numberOfYears is now fixed at 1 for adding
  const [selectedBrancheId, setSelectedBrancheId] = useState(null);
  const token = localStorage.getItem("jwt_token");

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
        setMessage("Erreur lors du chargement des branches.");
      }
    } catch (error) {
      setMessage("Erreur de connexion au serveur.");
    }
  };

  // Add Method (numberOfYears is fixed at 1)
  const handleAddBranche = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/admin/branche/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // numberOfYears is hardcoded to 1 here
        body: JSON.stringify({ name: brancheName, n: 1 }),
      });
      const data = await response.json();
      if (response.ok) {
        // Assuming the API returns the added branch with n=1
        setBranches([...branches, data.branche]);
        setMessage("Branche ajoutée avec succès.");
        // Clear branch name input after successful add
        setBrancheName("");
      } else {
        setMessage(data.detail || "Erreur lors de l'ajout de la branche.");
      }
    } catch (error) {
      setMessage("Erreur de connexion au serveur.");
    }
    // Refresh the list after adding
    fetchBranches();
  };

  // Modify Method
  const handleModifyBranche = async () => {
    if (!selectedBrancheId) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/admin/branche/${selectedBrancheId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // The API for PUT only takes 'name', so we only send the name
        body: JSON.stringify({ name: brancheName }),
      });
      const data = await response.json();
      if (response.ok) {
        // Update the branch name in the local state
        setBranches(branches.map(b => b.id === selectedBrancheId ? { ...b, name: brancheName } : b));
        setMessage("Branche mise à jour avec succès.");
        // Clear input fields and deselect after successful modify
        setBrancheName("");
        setSelectedBrancheId(null);
      } else {
        setMessage(data.detail || "Erreur lors de la mise à jour de la branche.");
      }
    } catch (error) {
      setMessage("Erreur de connexion au serveur.");
    }
    // Refresh the list after modifying
    fetchBranches();
  };

  // Delete Method
  const handleDeleteBranche = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/admin/branche/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setBranches(branches.filter((branche) => branche.id !== id));
        setMessage("Branche supprimée avec succès.");
        setSelectedBrancheId(null); // Deselect the branch
      } else {
        setMessage(data.error || "Erreur lors de la suppression de la branche.");
      }
    } catch (error) {
      setMessage("Erreur de connexion au serveur.");
    }
    // Refresh the list after deleting
    fetchBranches();
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // Populate brancheName input when a branch is selected for modification
  useEffect(() => {
    if (selectedBrancheId) {
      const selectedBranch = branches.find(b => b.id === parseInt(selectedBrancheId));
      if (selectedBranch) {
        setBrancheName(selectedBranch.name);
        // We don't populate numberOfYears as it's not used for modification
      }
    } else {
      // Clear brancheName input when no branch is selected
      setBrancheName("");
    }
  }, [selectedBrancheId, branches]);


  return (
    <div>
      {message && <p>{message}</p>}

      {/* Section for Add */}
      <h3>Ajouter une nouvelle branche</h3>
      <input
        type="text"
        placeholder="Nom de la branche"
        value={brancheName}
        onChange={(e) => setBrancheName(e.target.value)}
      />
      {/* Removed the input for numberOfYears */}
      <button onClick={handleAddBranche} className="mt-3">Ajouter</button>

      <hr /> {/* Separator */}

      {/* Section for Modify and Delete */}
      <h3>Modifier ou supprimer une branche existante</h3>
      <select onChange={(e) => setSelectedBrancheId(e.target.value)} value={selectedBrancheId || ""}>
        <option value="">Sélectionner une branche</option>
        {branches.map((branche) => (
          <option key={branche.id} value={branche.id}>
            {branche.name} ({branche.n} années)
          </option>
        ))}
      </select>

      {selectedBrancheId && (
        <>
          {/* Input for modification (only visible when a branch is selected) */}
          <input
            type="text"
            placeholder={`Nouveau nom pour "${branches.find(b => b.id === parseInt(selectedBrancheId))?.name}"`}
            value={brancheName}
            onChange={(e) => setBrancheName(e.target.value)}
          />
          {/* Note: The API for PUT only accepts 'name'. */}
          <button  style={{marginTop:"6px"}} onClick={handleModifyBranche}>Modifier </button>
          <button style={{backgroundColor:"red",marginTop:"3px"}} onClick={() => handleDeleteBranche(selectedBrancheId)}>
            Supprimer 
          </button>
        </>
      )}
    </div>
  );
};

export default Branche;