
import { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

const adminPageStyle = {
  minHeight: "100vh",
  boxSizing: "border-box",
  padding: "40px 20px",
  backgroundImage:
    "linear-gradient(rgba(233, 220, 229, 0.28), rgba(233, 220, 229, 0.28)), url('/Pastel Memories Photo Nook.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  fontFamily: "'Segoe UI', sans-serif",
  color: "#51404F",
};

const adminCardStyle = {
  maxWidth: "450px",
  margin: "50px auto",
  padding: "35px",
  boxSizing: "border-box",
  background: "rgba(128, 103, 122, 0.94)",
  border: "1px solid rgba(255,255,255,0.35)",
  borderRadius: "20px",
  boxShadow: "0 20px 55px rgba(45, 30, 48, 0.35)",
  color: "#FFFFFF",
};


function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const response = await axios.post(`${API}/admin/login`, {
        email,
        password,
      });

      localStorage.setItem("adminToken", response.data.token);

      window.location.href = "/admin/dashboard";
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Admin login failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
   <div style={adminPageStyle}>
  <form onSubmit={handleLogin} style={adminCardStyle}>
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
  <div style={{ fontSize: "36px", marginBottom: "10px" }}>🔐</div>

  <h1 style={{
    color: "#FFFFFF",
    fontSize: "30px",
    margin: 0,
  }}>
    Admin Login
  </h1>

  <p style={{
    color: "#F5EAF0",
    fontSize: "14px",
    marginTop: "10px",
  }}>
    Welcome back, Administrator
  </p>
</div>

        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          style={{
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: "14px 16px",
  marginBottom: "16px",
  border: "1px solid #E4C9DA",
  borderRadius: "12px",
  background: "#F8EDF4",
  color: "#51404F",
  fontSize: "15px",
  outline: "none",
  boxShadow: "0 3px 10px rgba(81, 64, 79, 0.08)",
}}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          style={{
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: "14px 16px",
  marginBottom: "16px",
  border: "1px solid #E4C9DA",
  borderRadius: "12px",
  background: "#F8EDF4",
  color: "#51404F",
  fontSize: "15px",
  outline: "none",
  boxShadow: "0 3px 10px rgba(81, 64, 79, 0.08)",
}}
        />

        
<button
  type="submit"
  disabled={loading}
  className="login-button"
  style={{
    width: "100%",
    padding: "14px",
    background: "#51404F",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: loading ? "not-allowed" : "pointer",
    boxShadow: "0 5px 14px rgba(81, 64, 79, 0.18)",
  }}
>
  {loading ? "Logging in..." : "Admin Login"}
</button>

      </form>

     {message && (
  <p
    style={{
      marginTop: "18px",
      padding: "12px",
      background: "rgba(255, 235, 238, 0.95)",
      color: "#9B2635",
      borderRadius: "10px",
      fontSize: "14px",
      textAlign: "center",
    }}
  >
    {message}
  </p>
)}
    </div>
  );
}

export default AdminLogin;
