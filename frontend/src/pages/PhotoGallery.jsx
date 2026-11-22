import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

const viewerNavButtonStyle = {
  padding: "11px 22px",
  background: "rgba(181, 168, 143, 0.12)",
  color: "#EAE7DF",
  border: "1px solid rgba(181, 168, 143, 0.4)",
  borderRadius: "10px",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.25s ease",
};

function PhotoGallery({ onBack }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

const selectedPhoto =
  selectedPhotoIndex !== null ? photos[selectedPhotoIndex] : null;
  
  const showNextPhoto = () => {
  setSelectedPhotoIndex((previous) =>
    (previous + 1) % photos.length
  );
};

const showPreviousPhoto = () => {
  setSelectedPhotoIndex((previous) =>
    (previous - 1 + photos.length) % photos.length
  );
};

  useEffect(() => {
  const fetchPhotos = async () => {
    try {
      const response = await axios.get(`${API}/photos/shared`);

      const photoList = response.data.photos.map((photo) => ({
        ...photo,
        imageUrl: `http://localhost:5000${photo.imageUrl}`,
      }));

      setPhotos(photoList);
      setError("");
    } catch (err) {
      setError("Could not load gallery photos.");
    } finally {
      setLoading(false);
    }
  };

  fetchPhotos();
}, []);

  return (
  <div
    style={{
      minHeight: "100vh",
      padding: "35px",
      boxSizing: "border-box",
      backgroundImage:
  "linear-gradient(rgba(23, 35, 51, 0.48), rgba(23, 35, 51, 0.55)), url('/User Images.jpeg')",
backgroundSize: "cover",
backgroundPosition: "center",
backgroundRepeat: "no-repeat",
backgroundAttachment: "fixed",
      color: "#EAE7DF",
      fontFamily: "'Segoe UI', sans-serif",
    }}
  >
    <header style={{ textAlign: "center", marginBottom: "40px" }}>
      <h1
        style={{
          fontSize: "32px",
          fontWeight: "600",
          letterSpacing: "1.5px",
          marginBottom: "10px",
        }}
      >
        Community Gallery
      </h1>
<div style={{ maxWidth: "1250px", margin: "0 auto 25px" }}>
  <button
    onClick={onBack}
    style={{
      padding: "10px 20px",
      background: "rgba(181, 168, 143, 0.12)",
      color: "#EAE7DF",
      border: "1px solid rgba(181, 168, 143, 0.4)",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: "14px",
    }}
  >
    ← Back to Login
  </button>
</div>
      <p style={{ color: "#B5A88F", letterSpacing: "1px" }}>
        MOMENTS · MEMORIES · PEOPLE
      </p>
    </header>
    {loading ? (
  <p style={{ textAlign: "center", color: "#B5A88F" }}>
    Loading memories...
  </p>
) : error ? (
  <p style={{ textAlign: "center", color: "#EAE7DF" }}>
    {error}
  </p>
) : photos.length === 0 ? (
  <p style={{ textAlign: "center", color: "#B5A88F" }}>
    No approved photos available yet.
  </p>
) : (
  <div
    style={{
      columns: "3 250px",
      columnGap: "18px",
      maxWidth: "1250px",
      margin: "0 auto",
    }}
  >
    {photos.map((photo, index) => (
      <div
        key={photo._id}
        onClick={() => setSelectedPhotoIndex(index)}
        style={{
          breakInside: "avoid",
          marginBottom: "18px",
          overflow: "hidden",
          borderRadius: "12px",
          background: "rgba(234, 231, 223, 0.06)",
          border: "1px solid rgba(181, 168, 143, 0.2)",
          cursor: "pointer",
        }}
      >
        <img
          src={photo.imageUrl}
          alt={photo.originalName}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            borderRadius: "12px",
          }}
        />
      </div>
      
    ))}
  </div>
  
)}
{selectedPhoto && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 1000,
      background: "rgba(10, 17, 27, 0.96)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "25px",
      boxSizing: "border-box",
    }}
  >
    <button
      onClick={() => setSelectedPhotoIndex(null)}
      style={{
        position: "absolute",
        top: "25px",
        right: "30px",
        background: "transparent",
        color: "#EAE7DF",
        border: "1px solid rgba(181, 168, 143, 0.5)",
        borderRadius: "50%",
        width: "42px",
        height: "42px",
        fontSize: "23px",
        cursor: "pointer",
      }}
    >
      ×
    </button>
    <div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "24px",
    width: "100%",
    maxWidth: "1200px",
  }}
>
  <button
    onClick={showPreviousPhoto}
    style={{
      ...viewerNavButtonStyle,
      width: "48px",
      height: "48px",
      padding: 0,
      borderRadius: "50%",
      fontSize: "22px",
    }}
  >
    ←
  </button>
    <img
      src={selectedPhoto.imageUrl}
      alt={selectedPhoto.originalName}
      style={{
        maxWidth: "90%",
        maxHeight: "78vh",
        objectFit: "contain",
        borderRadius: "10px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}
    />
  <button
    onClick={showNextPhoto}
    style={{
      ...viewerNavButtonStyle,
      width: "48px",
      height: "48px",
      padding: 0,
      borderRadius: "50%",
      fontSize: "22px",
    }}
  >
    →
  </button>
</div>
    <p
      style={{
        color: "#EAE7DF",
        marginTop: "20px",
        fontSize: "16px",
      }}
    >
      {selectedPhoto.originalName}
    </p>
  </div>
)}
  </div>
);

}

export default PhotoGallery;