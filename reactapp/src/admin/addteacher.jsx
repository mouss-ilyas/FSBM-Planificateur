import React, { useState } from 'react';
import { API_URL } from "./../config";
function AddTeacherForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
const jwtToken = localStorage.getItem("jwt_token");
  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage('');
    setError('');

    try {
      const response = await fetch(`${API_URL}/admin/add_teacher`, {
        method: 'POST',

        headers: {
          "Authorization": `Bearer ${jwtToken}`,
          "Content-Type": "application/json", // Added missing header
      },

        
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        // Optionally, reset the form after successful submission
        setName('');
        setEmail('');
        setPassword('');
      } else {
        setError(data.detail || 'An error occurred while adding the teacher.');
      }
    } catch (err) {
      setError('Network error or server is not reachable.');
      console.error('Error adding teacher:', err);
    }
  };

  return (
    <div className='addenseignement availability-container'>
      <h4><strong> 1) Ajouter un nouvel enseignement</strong></h4>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" >Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className='mt-2'>ajouter</button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default AddTeacherForm;