import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css"
const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const login = async (e) => {
        e.preventDefault(); 

        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error("Login failed");
            }

            const data = await response.json();
            const token = data.access_token;

            // Stockage des données dans le localStorage
            localStorage.setItem("jwt_token", token);
            localStorage.setItem("teacher_id", data.teacher_id);
            (data.teacher_id===1)?navigate("/adminDashbord"):navigate("/prof")
            
        } catch (error) {
            console.error(error);
            alert("Login failed. Please check your credentials.");
        }
    };

    return (
        <div className="login-container ">
  <h2 className="login-title">Login</h2>
  <form className="login-form" onSubmit={login}>
    <input
      className="login-input"
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />
    <input
      className="login-input"
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />
    <button className="login-button" type="submit">Login</button>
  </form>
  <div className="login-message">{message}</div>
</div>
    );
};

export default Login;
