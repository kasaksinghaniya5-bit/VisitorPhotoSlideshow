
import { useEffect, useRef, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

const slideshowButtonStyle = {
  padding: "12px 25px",
  background: "rgba(181, 168, 143, 0.12)",
  color: "#EAE7DF",
  border: "1px solid rgba(181, 168, 143, 0.4)",
  borderRadius: "10px",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.25s ease",
};

function SharedSlideshow({ onBack, onOpenGallery }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const photosRef = useRef([]);
  const currentPhotoIdRef = useRef(null);
  currentPhotoIdRef.current = photos[currentIndex]?._id || null;

  
useEffect(() => {
  let isMounted = true;
  let refreshTimeout;

  const fetchPhotos = async () => {
    try {
      const response = await axios.get(`${API}/photos/shared`);

      if (!isMounted) return;

      const photoList = response.data.photos.map((photo) => ({
        ...photo,
        imageUrl: `http://localhost:5000${photo.imageUrl}`,
      }));

      const previousPhotos = photosRef.current;

      const existingIds = new Set(
        previousPhotos.map((photo) => photo._id)
      );

      const incomingIds = new Set(
        photoList.map((photo) => photo._id)
      );

      const retainedPhotos = previousPhotos.filter((photo) =>
        incomingIds.has(photo._id)
      );

      const newPhotos = photoList.filter(
        (photo) => !existingIds.has(photo._id)
      );

      const updatedPhotos = [
        ...retainedPhotos,
        ...newPhotos,
      ];

      const samePhotoList =
        previousPhotos.length === updatedPhotos.length &&
        previousPhotos.every(
          (photo, index) =>
            photo._id === updatedPhotos[index]._id
        );

      // Update only when the actual photo list changes.
      if (!samePhotoList) {
        const currentPhotoId = currentPhotoIdRef.current;

        const newIndex = updatedPhotos.findIndex(
          (photo) => photo._id === currentPhotoId
        );

        photosRef.current = updatedPhotos;
        setPhotos(updatedPhotos);

        if (newIndex >= 0) {
          setCurrentIndex(newIndex);
        } else {
          setCurrentIndex(0);
        }
      }

      setError("");
    } catch (err) {
      if (isMounted && photosRef.current.length === 0) {
        setError("Could not load shared photos.");
      }
    } finally {
      if (isMounted) {
        setLoading(false);
        refreshTimeout = setTimeout(fetchPhotos, 5000);
      }
    }
  };

  fetchPhotos();

  return () => {
    isMounted = false;
    clearTimeout(refreshTimeout);
  };
}, []);

// Automatically change photos every 7 seconds
useEffect(() => {
  if (!isPlaying || photos.length <= 1) {
    return;
  }

  const intervalId = setInterval(() => {
    setCurrentIndex((previous) => (previous + 1) % photos.length);
  }, 7000);

  return () => clearInterval(intervalId);
}, [isPlaying, photos.length]);


  if (loading) {
  return (
    <div style={statusPageStyle}>
      <button onClick={onBack} style={backButtonStyle}>
        ← Back to Dashboard
      </button>
     
      <h2>Loading shared photos...</h2>
    </div>
  );
}
  if (error) {
  return (
    <div style={statusPageStyle}>
      <button onClick={onBack} style={backButtonStyle}>
        ← Back to Dashboard
      </button>

      <h2>{error}</h2>
    </div>
  );
}

  const currentPhoto = photos[currentIndex];

  if (photos.length === 0) {
  return (
    <div style={statusPageStyle}>
      <button onClick={onBack} style={backButtonStyle}>
        ← Back to Dashboard
      </button>

      <h2>No approved public photos available yet.</h2>
    </div>
  );
}

  
return (
  <div
  style={{
    minHeight: "100vh",
    boxSizing: "border-box",
    position: "relative",
    backgroundImage:
  "linear-gradient(rgba(23, 35, 51, 0.48), rgba(23, 35, 51, 0.55)), url('/User Image.jpeg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundAttachment: "fixed",
    color: "#EAE7DF",
    padding: "35px 25px",
    fontFamily: "'Segoe UI', sans-serif",
    textAlign: "center",
    overflow: "hidden",
  }}
>
  <button
  onClick={onBack}
  style={{
    position: "absolute",
    top: "25px",
    left: "25px",
    padding: "11px 20px",
    background: "rgba(77, 96, 120, 0.85)",
    color: "#F5F2EA",
    border: "1px solid rgba(234, 231, 223, 0.45)",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    
  }}
>
  ← Back to Dashboard
</button>

<button
  onClick={onOpenGallery}
  style={{
    position: "absolute",
    top: "25px",
    right: "25px",
    padding: "11px 20px",
    background: "rgba(77, 96, 120, 0.85)",
    color: "#F5F2EA",
    border: "1px solid rgba(234, 231, 223, 0.45)",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    zIndex: 10,
  }}
>
  Community Photo Gallery →
</button>

<h1
  style={{
    fontSize: "30px",    fontWeight: "600",
    letterSpacing: "1.5px",
    color: "#EAE7DF",
    marginBottom: "10px",
  }}
>
  Community Gallery
</h1>

   <p
  style={{
    color: "#B5A88F",
    fontSize: "13px",
    letterSpacing: "3px",
    fontWeight: "600",
    marginBottom: "28px",
  }}
>
  {String(currentIndex + 1).padStart(2, "0")} /{" "}
  {String(photos.length).padStart(2, "0")}
</p>
<style>
  {`
    @keyframes photoFadeIn {
      from {
        opacity: 0;
        transform: scale(0.985);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .slideshow-photo {
      animation: photoFadeIn 0.8s ease-in-out;
    }
      @keyframes progressFill {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}

.slideshow-progress {
  height: 3px;
  width: 100%;
  background: rgba(181, 168, 143, 0.2);
  border-radius: 10px;
  overflow: hidden;
  margin: 25px auto;
}

.slideshow-progress-fill {
  height: 100%;
  background: #B5A88F;
  animation: progressFill 7s linear infinite;
}
  .slideshow-button:hover {
  background: rgba(181, 168, 143, 0.25);
  border-color: #B5A88F;
  transform: translateY(-2px);
}

.slideshow-button:active {
  transform: translateY(0);
}
  `
  }
  
</style>
<div
  style={{
    position: "relative",
    width: "100%",
    maxWidth: "900px",
    margin: "0 auto",
    overflow: "visible",
  }}
>
  {/* Blurred background
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage: `url(${currentPhoto.imageUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      filter: "blur(45px) brightness(0.35)",
      opacity: 0.65,
      transform: "scale(1.15)",
      zIndex: 0,
      pointerEvents: "none",
    }}
  /> */}

  {/* Main photograph */}
  <img
    className="slideshow-photo"
    src={currentPhoto.imageUrl}
    alt={currentPhoto.originalName}
    style={{
  width: "100%",
  height: "min(70vh, 700px)",
  objectFit: "contain",
  display: "block",
  borderRadius: "8px",
}}
  />
  <div
  className="slideshow-progress"
  key={currentIndex}
>
  <div
    className="slideshow-progress-fill"
    style={{
      animationPlayState: isPlaying ? "running" : "paused",
    }}
  />
</div>
</div>    

    <div
  style={{
    marginTop: "22px",
    color: "#EAE7DF",
  }}
>
  <h3
    style={{
      fontSize: "19px",
      fontWeight: "500",
      marginBottom: "8px",
      overflowWrap: "anywhere",
    }}
  >
    {currentPhoto.originalName}
  </h3>

  <p
    style={{
      color: "#B5A88F",
      fontSize: "13px",
      letterSpacing: "1px",
    }}
  >
    VISIT ID · {currentPhoto.visitId}
  </p>
</div>
<div
  style={{
    width: "70px",
    height: "2px",
    background: "#B5A88F",
    margin: "25px auto",
    opacity: 0.7,
  }}
/>


    <div
      style={{
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "18px",
  marginTop: "25px",
  flexWrap: "wrap",
}}
    >
      <button
      style={slideshowButtonStyle}
        onClick={() =>
          setCurrentIndex(
            (currentIndex - 1 + photos.length) % photos.length
          )
        }
      >
        Previous
      </button>

      <button style={slideshowButtonStyle} onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? "Pause" : "Play"}
      </button>

      <button
      style={slideshowButtonStyle}
        onClick={() =>
          setCurrentIndex((currentIndex + 1) % photos.length)
        }
      >
        Next
      </button>
    </div>
  </div>
);

}

const statusPageStyle = {
  minHeight: "100vh",
  boxSizing: "border-box",
  position: "relative",
  backgroundImage:
    "linear-gradient(rgba(23, 35, 51, 0.48), rgba(23, 35, 51, 0.55)), url('/User Image.jpeg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundAttachment: "fixed",
  color: "#EAE7DF",
  fontFamily: "'Segoe UI', sans-serif",
  textAlign: "center",
  padding: "100px 25px",
};

const backButtonStyle = {
  position: "absolute",
  top: "25px",
  left: "25px",
  padding: "11px 20px",
  background: "rgba(77, 96, 120, 0.85)",
  color: "#F5F2EA",
  border: "1px solid rgba(234, 231, 223, 0.45)",
  borderRadius: "10px",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
};
export default SharedSlideshow;
