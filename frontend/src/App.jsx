
import { useState } from "react";
import axios from "axios";
import UserDashboard from "./pages/UserDashboard";
import PhotoGallery from "./pages/PhotoGallery";
import SharedSlideshow from "./pages/SharedSlideshow";

const API = "http://localhost:5000/api";

function App() {
  const [showGallery, setShowGallery] = useState(false);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [visitorId, setVisitorId] = useState("");
  const [pin, setPin] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Visitor login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(`${API}/visitors/login`, {
        visitorId,
        pin,
      });

      setToken(response.data.token);
      setMessage("Login successful!");
      setPin("");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Login failed."
      );
    } finally {
      setLoading(false);
    }
  };

  // Visitor logout
  const handleLogout = () => {
  setToken("");
  setVisitorId("");
  setPin("");
  setMessage("You have logged out.");
};
if (showSlideshow) {
  return (
    <SharedSlideshow
      onBack={() => setShowSlideshow(false)}
      onOpenGallery={() => {
  setShowSlideshow(false);
  setShowGallery(true);
}}
    />
  );
}

if (showGallery) {
  return (
    <PhotoGallery
      onBack={() => setShowGallery(false)}
    />
  );
}

  return token ? (
  <UserDashboard
    token={token}
    visitorId={visitorId}
    handleLogout={handleLogout}
    onOpenGallery={() => setShowGallery(true)}
    onOpenSlideshow={() => setShowSlideshow(true)}
  />
  
) : (
  <div style={pageStyle}>
    <h1 style={titleStyle}>Moments, Made Memories.</h1>

    <p style={subtitleStyle}>
      Every picture tells a story. Keep yours alive.
    </p>

    <div style={{ textAlign: "center", marginBottom: "25px" }}>
      <button
        onClick={() => setShowGallery(true)}
        style={{
          padding: "11px 24px",
          background: "rgba(81, 64, 79, 0.85)",
          color: "#FFFFFF",
          border: "1px solid rgba(255,255,255,0.5)",
          borderRadius: "10px",
          fontSize: "14px",
          cursor: "pointer",
        }}
      >
        Explore Community Gallery
      </button>
    </div>

    <form onSubmit={handleLogin} style={loginCardStyle}>
      <div style={{ textAlign: "center", marginBottom: "25px" }}>
        <div style={{ fontSize: "33px", marginBottom: "10px" }}>
          📸
        </div>

        <h2 style={{ color: "#FFFFFF", margin: 0 }}>
          Visitor Login
        </h2>

        <p
          style={{
            color: "#F5EAF0",
            fontSize: "13px",
            marginTop: "8px",
          }}
        >
          Welcome back to your memories
        </p>
      </div>

      <input
        type="text"
        placeholder="Enter Visitor ID"
        value={visitorId}
        onChange={(e) => setVisitorId(e.target.value)}
        required
        style={inputStyle}
      />

      <input
        type="password"
        placeholder="Enter PIN"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        required
        style={inputStyle}
      />

      <button
        type="submit"
        disabled={loading}
        style={buttonStyle}
        className="login-button"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <p style={{ textAlign: "center", marginTop: "15px" }}>
        New visitor?{" "}
        <a
          href="/register"
          style={{
            color: "#51404F",
            fontWeight: "bold",
            textDecoration: "none",
          }}
        >
          Create an account
        </a>
      </p>
    </form>

    {message && <p>{message}</p>}
  </div>
);
}


const pageStyle = {
  minHeight: "100vh",
  boxSizing: "border-box",
  
backgroundImage:
  "linear-gradient(rgba(233, 220, 229, 0.28), rgba(233, 220, 229, 0.28)), url('/Pastel Memories Photo Nook.png')",
backgroundSize: "cover",
backgroundPosition: "center",
backgroundRepeat: "no-repeat",

  padding: "40px 20px",
  fontFamily: "'Segoe UI', sans-serif",
  color: "#51404F",
};


const inputStyle = {
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
  transition: "border 0.2s ease, box-shadow 0.2s ease",
};


const buttonStyle = {
  width: "100%",
  padding: "14px",
  background: "#51404F",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "12px",
  fontSize: "16px",
  fontWeight: "600",
  cursor: "pointer",
  boxShadow: "0 5px 14px rgba(81, 64, 79, 0.18)",
  transition: "all 0.2s ease",
};

const titleStyle = {
  textAlign: "center",
  color: "#FFFFFF",
  fontSize: "38px",
  fontWeight: "700",
  letterSpacing: "0.5px",
  marginBottom: "8px",
  textShadow: "0 3px 12px rgba(50, 30, 50, 0.55)",
};

const subtitleStyle = {
  textAlign: "center",
  color: "#f6fff5",
  fontSize: "15px",
  fontWeight: "500",
  marginTop: "0",
  marginBottom: "28px",
  textShadow: "0 2px 8px rgba(50, 30, 50, 0.5)",
};


const loginCardStyle = {
  maxWidth: "400px",
  margin: "30px auto",
  padding: "35px",
  background: "rgba(128, 103, 122, 0.94)",
  border: "1px solid rgba(255,255,255,0.35)",
  borderRadius: "20px",
  boxShadow: "0 18px 45px rgba(45, 30, 48, 0.25)",
  color: "#FFFFFF",
};

export default App;
//joke joke hhahahahahah