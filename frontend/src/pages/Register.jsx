import { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

const registerPageStyle = {
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

const registerCardStyle = {
  maxWidth: "450px",
  margin: "25px auto",
  padding: "35px",
  background: "rgba(128, 103, 122, 0.94)",
  border: "1px solid rgba(255,255,255,0.35)",
  borderRadius: "20px",
  boxShadow: "0 20px 55px rgba(45, 30, 48, 0.35)",
  color: "#FFFFFF",
};


function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");
  const [visitorId, setVisitorId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setVisitorId("");

      const response = await axios.post(`${API}/visitors/register`, {
        name,
        email,
        pin,
      });

      setMessage(response.data.message);
      setVisitorId(response.data.visitor.visitorId);

      setName("");
      setEmail("");
      setPin("");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={registerPageStyle}>
     

      <form onSubmit={handleRegister} style={registerCardStyle}>
         <div style={{ textAlign: "center", marginBottom: "25px" }}>
  <div style={{ fontSize: "33px", marginBottom: "10px" }}>
    📸
  </div>

  <h1 style={{ color: "#FFFFFF", fontSize: "30px", margin: 0 }}>
    Join Our Memories
  </h1>

  <p style={{ color: "#F5EAF0", fontSize: "14px", marginTop: "10px" }}>
    Create your account and start collecting moments.
  </p>
</div>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          style={{
  width: "100%",
  boxSizing: "border-box",
  padding: "14px 16px",
  marginBottom: "16px",
  border: "1px solid #E4C9DA",
  borderRadius: "12px",
  background: "#F8EDF4",
  color: "#51404F",
  fontSize: "15px",
  boxShadow: "0 3px 10px rgba(81, 64, 79, 0.08)",
}}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          style={{
  width: "100%",
  boxSizing: "border-box",
  padding: "14px 16px",
  marginBottom: "16px",
  border: "1px solid #E4C9DA",
  borderRadius: "12px",
  background: "#F8EDF4",
  color: "#51404F",
  fontSize: "15px",
  boxShadow: "0 3px 10px rgba(81, 64, 79, 0.08)",
}}
        />

        <input
          type="password"
          placeholder="PIN"
          value={pin}
          onChange={(event) => setPin(event.target.value)}
          required
          inputMode="numeric"
          style={{
  width: "100%",
  boxSizing: "border-box",
  padding: "14px 16px",
  marginBottom: "16px",
  border: "1px solid #E4C9DA",
  borderRadius: "12px",
  background: "#F8EDF4",
  color: "#51404F",
  fontSize: "15px",
  boxShadow: "0 3px 10px rgba(81, 64, 79, 0.08)",
}}
        />

        <button
  type="submit"
  disabled={loading}
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
  className="login-button"
>
  {loading ? "Registering..." : "Create Account"}
</button>
      </form>
      <p style={{ textAlign: "center", marginTop: "15px" }}>
  Already registered?{" "}
  <a
    href="/"
    style={{
  color: "#FFFFFF",
  fontWeight: "600",
  textDecoration: "underline",
}}
  >
    Back to Login
  </a>
</p>

      {message && <p>{message}</p>}

      
{visitorId && (
  <div
    style={{
      marginTop: "25px",
      padding: "22px",
      background: "#F5EAF0",
      color: "#51404F",
      border: "1px solid #E4C9DA",
      borderRadius: "16px",
      textAlign: "center",
      boxShadow: "0 8px 20px rgba(45, 30, 48, 0.12)",
    }}
  >
    <div style={{ fontSize: "30px" }}>🎉</div>

    <h3 style={{ margin: "10px 0", color: "#51404F" }}>
      You're all set!
    </h3>

    <p>Your personal Visitor ID is:</p>

    <div
      style={{
        background: "#E9DCE5",
        padding: "13px",
        borderRadius: "10px",
        fontSize: "20px",
        fontWeight: "700",
        letterSpacing: "1px",
        color: "#51404F",
      }}
    >
      {visitorId}
    </div>

    <p style={{ fontSize: "13px", marginTop: "14px" }}>
      Keep this ID safe. You'll need it to log in and revisit your memories.
    </p>
  </div>
)}

    </div>
  );
}

export default Register;