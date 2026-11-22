
import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

function UserDashboard({
  token,
  visitorId,
  handleLogout,
  onOpenGallery,
  onOpenSlideshow,
}) {
  const [photos, setPhotos] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [galleryRefresh, setGalleryRefresh] = useState(0);
  const [message, setMessage] = useState("");
  const handleFileSelection = (e) => {
  const files = Array.from(e.target.files || []);

  if (files.length > 7) {
    setUploadMessage("You can upload a maximum of 7 photos at a time.");
    setSelectedFiles([]);
    e.target.value = "";
    return;
  }

  const allowed = ["image/jpeg", "image/png"];

  const invalid = files.find(
    (file) =>
      !allowed.includes(file.type) ||
      file.size > 20 * 1024 * 1024
  );

  if (invalid) {
    setUploadMessage(
      "Only JPG, JPEG and PNG files up to 20 MB each are allowed."
    );
    setSelectedFiles([]);
    e.target.value = "";
    return;
  }

  setSelectedFiles(files);
  setUploadMessage(`${files.length} photo(s) selected.`);
};

const handleUpload = async () => {
  if (!selectedFiles.length) {
    setUploadMessage("Please select at least one photo.");
    return;
  }

  const formData = new FormData();

  selectedFiles.forEach((file) => {
    formData.append("photos", file);
  });

  setUploading(true);
  setUploadMessage("");

  try {
    const response = await axios.post(
      `${API}/photos/upload`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { totalUploaded, totalFailed } = response.data;

    setUploadMessage(
      `${totalUploaded} photo(s) uploaded successfully. ${totalFailed} failed.`
    );

    setSelectedFiles([]);
    setGalleryRefresh((previous) => previous + 1);
  } catch (error) {
    setUploadMessage(
      error.response?.data?.message || "Photo upload failed."
    );
  } finally {
    setUploading(false);
  }
};
const handleVisibilityChange = async (photoId, visibility) => {
  try {
    if (visibility === "public") {
      const confirmed = window.confirm(
        "Make this photo public? It will be sent for admin approval and may appear in the shared slideshow after approval."
      );

      if (!confirmed) return;

      const consent = window.confirm(
        "I confirm that I have the right to upload/share this photo and have permission from identifiable people in it."
      );

      if (!consent) return;

      await axios.patch(
        `${API}/photos/${photoId}/visibility`,
        {
          visibility: "public",
          consent: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } else {
      await axios.patch(
        `${API}/photos/${photoId}/visibility`,
        { visibility: "private" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }

    setGalleryRefresh((previous) => previous + 1);
  } catch (error) {
    setMessage(
      error.response?.data?.message ||
        "Could not change photo visibility."
    );
  }
};

const handleDeletePhoto = async (photoId) => {
  const confirmed = window.confirm(
    "Are you sure you want to permanently delete this photo? This action cannot be undone."
  );

  if (!confirmed) return;

  try {
    await axios.delete(`${API}/photos/${photoId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setMessage("Photo deleted successfully!");
    setGalleryRefresh((previous) => previous + 1);
  } catch (error) {
    setMessage(
      error.response?.data?.message ||
        "Could not delete photo."
    );
  }
};
const handleDownloadPhoto = async (photoId, fileName) => {
  try {
    const response = await axios.get(
      `${API}/photos/${photoId}/download`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      }
    );

    const downloadUrl = window.URL.createObjectURL(
      new Blob([response.data])
    );

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(downloadUrl);

    setMessage("Photo downloaded successfully!");
  } catch (error) {
    setMessage("Could not download your photo.");
  }
};

const handleHidePhoto = async (photoId, isHidden) => {
  try {
    await axios.patch(
      `${API}/photos/${photoId}/hide`,
      { isHidden },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setMessage(
      isHidden
        ? "Photo hidden successfully!"
        : "Photo unhidden successfully!"
    );

    setGalleryRefresh((previous) => previous + 1);
  } catch (error) {
    setMessage(
      error.response?.data?.message ||
        "Could not update photo."
    );
  }
};
useEffect(() => {
  if (!token) return;

  let cancelled = false;
  const imageUrls = [];

  const loadGallery = async () => {
    setGalleryLoading(true);
    setMessage("");

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await axios.get(
        `${API}/photos/my-photos`,
        { headers }
      );

      const photoList = response.data.photos;

      const photosWithImages = await Promise.all(
        photoList.map(async (photo) => {
          try {
            const imageResponse = await axios.get(
              `${API}/photos/${photo._id}/image`,
              {
                headers,
                responseType: "blob",
              }
            );

            const imageUrl = URL.createObjectURL(
              imageResponse.data
            );

            imageUrls.push(imageUrl);

            return { ...photo, imageUrl };
          } catch (error) {
            console.error(
              "Image loading failed:",
              photo.originalName,
              error
            );

            return { ...photo, imageUrl: null };
          }
        })
      );

      if (!cancelled) {
        setPhotos(photosWithImages);
      }
    } catch (error) {
      if (!cancelled) {
        setMessage(
          error.response?.data?.message ||
            "Could not load your gallery."
        );
      }
    } finally {
      if (!cancelled) {
        setGalleryLoading(false);
      }
    }
  };

  loadGallery();

  return () => {
    cancelled = true;
    imageUrls.forEach((url) => URL.revokeObjectURL(url));
  };
}, [token, galleryRefresh]);
  
return (
  <div style={dashboardPageStyle}>
    <style>
  {`
    .photo-card {
  cursor: default;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.photo-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
}

    .photo-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 16px;
      background: linear-gradient(
        transparent,
        rgba(25, 37, 52, 0.97) 25%
      );
      opacity: 0;
      transform: translateY(12px);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }

    .photo-card:hover .photo-overlay {
      opacity: 1;
      transform: translateY(0);
    }

    .photo-card:hover .photo-image {
      transform: scale(1.03);
    }

    @media (hover: none), (pointer: coarse) {
      .photo-overlay {
        position: relative;
        opacity: 1;
        transform: none;
        background: rgba(38, 54, 74, 0.95);
      }
    }
  `}
</style>
    <div>
      <h2
  style={{
    color: "#263238",
    fontSize: "27px",
    fontWeight: "600",
    letterSpacing: "0.4px",
    marginTop: "0",
  }}
>
  Welcome, Visitor!
</h2>
      <p
  style={{
    color: "#263238",
    fontSize: "14px",
    letterSpacing: "0.5px",
    marginBottom: "22px",
  }}
>
  Visitor ID: <strong style={{ color: "#263238" }}>{visitorId}</strong>
</p>
<div
  style={{
    display: "flex",
flexWrap: "wrap",
justifyContent: "center",
alignItems: "center",
gap: "15px",
marginTop: "22px",
width: "100%",
  }}
>
  <button
    onClick={onOpenGallery}
    style={buttonStyle}
  >
    Community Photo Gallery
  </button>

  <button
    onClick={onOpenSlideshow}
    style={buttonStyle}
  >
    Shared Slideshow
  </button>

  <button
  onClick={handleLogout}
  style={logoutButtonStyle}
>
  Logout
</button>
</div>    </div>

    <div>
      <h2
  style={{
    color: "#263238",
    fontSize: "23px",
    fontWeight: "600",
    marginTop: "0",
    marginBottom: "22px",
  }}
>
  Upload Your Moments
</h2>

     <input
  type="file"
  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
  multiple
  onChange={handleFileSelection}
  style={{
    width: "100%",
    padding: "14px",
    boxSizing: "border-box",
    background: "rgba(255, 255, 255, 0.75)",
    border: "1px solid #596779",  
    borderRadius: "10px",
    color: "#263238",
    cursor: "pointer",
  }}
/>

      <p
  style={{
    color: "#263238",
    fontSize: "15px",
    marginTop: "12px",
    lineHeight: "1.6",
  }}
>
  Maximum 7 photos per upload · JPG, PNG · Up to 20 MB per photo
</p>

      <p
  style={{
    color: "#263238",
    fontSize: "15px",
    margin: "14px 0",
  }}
>
  <strong style={{ color: "#263238" }}>
    {selectedFiles.length}
  </strong>{" "}
  photo(s) selected
</p>

     <button
  onClick={handleUpload}
  disabled={uploading || selectedFiles.length === 0}
  style={{
    padding: "12px 24px",
    background: uploading || selectedFiles.length === 0
      ? "#596779"
      : "#B5A88F",
    color: "#26364A",
    border: "none",
    borderRadius: "9px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: uploading || selectedFiles.length === 0
      ? "not-allowed"
      : "pointer",
  }}
>
        {uploading ? "Uploading..." : "Upload Photos"}
      </button>

      {uploadMessage && (
  <p
    style={{
      color: "#D8C9A8",
      fontSize: "15px",
      marginTop: "14px",
      lineHeight: "1.5",
    }}
  >
    {uploadMessage}
  </p>
)}
    </div>

    <h2
  style={{
    color: "#263238",
    fontSize: "26px",
    fontWeight: "600",
    letterSpacing: "0.3px",
    marginTop: "45px",
    marginBottom: "10px",
  }}
>
  My Photo Gallery
</h2>

    {galleryLoading && (
  <p
    style={{
      color: "#D0C9BA",
      textAlign: "center",
      padding: "25px",
      fontSize: "14px",
      letterSpacing: "0.4px",
    }}
  >
    Preparing your memories...
  </p>
)}

    {!galleryLoading && photos.length === 0 && (
  <div
    style={{
      textAlign: "center",
      padding: "45px 20px",
      marginTop: "20px",
      background: "rgba(234, 231, 223, 0.05)",
      border: "1px dashed rgba(181, 168, 143, 0.4)",
      borderRadius: "16px",
      color: "#D0C9BA",
    }}
  >
    <h3 style={{ color: "#263238", fontWeight: "500" }}>
      Your gallery is waiting ✨
    </h3>
    <p style={{ fontSize: "14px" }}>
      Upload your favourite moments and they'll appear here.
    </p>
  </div>
)}

    <div style={galleryStyle}>
      {photos.map((photo) => (
        <div
  key={photo._id}
  className="photo-card"
  style={photoCardStyle}
>
          {photo.imageUrl ? (
            <img
  className="photo-image"
  src={photo.imageUrl}
  alt={photo.originalName}
  style={imageStyle}
/>
          ) : (
            <p>Image unavailable</p>
          )}
            <div className="photo-overlay">
          <h3
  style={{
    color: "#263238",
    fontSize: "15px",
    fontWeight: "600",
    margin: "14px 0 10px",
    overflowWrap: "anywhere",
  }}
>
  {photo.originalName}
</h3>

          <p
  style={{
    color: "#D0C9BA",
    fontSize: "13px",
    margin: "8px 0",
  }}
>
  Visibility: <strong style={{ color: "#263238" }}>
    {photo.visibility.toUpperCase()}
  </strong>
</p>

          <p
  style={{
    color: "#D0C9BA",
    fontSize: "13px",
    lineHeight: "1.6",
    margin: "8px 0",
  }}
>
  Moderation Status: {
    photo.moderationStatus === "pending"
      ? "Waiting for Admin Approval"
      : photo.moderationStatus === "approved"
      ? "Approved for Public Sharing"
      : photo.moderationStatus === "rejected"
      ? "Rejected by Admin"
      : photo.moderationStatus === "approval_revoked"
      ? "Approval Revoked"
      : "Not Submitted"
  }
</p>

         <p
  style={{
    color: "#D0C9BA",
    fontSize: "13px",
    margin: "8px 0 14px",
  }}
>
  Visit ID: <strong style={{ color: "#263238" }}>
    {photo.visit?.visitId || "N/A"}
  </strong>
</p>

          <div style={{ marginTop: "12px" }}>
    </div>
            {photo.visibility === "private" ? (
              <button
              style={actionButtonStyle}
                onClick={() =>
                  handleVisibilityChange(photo._id, "public")
                }
              >
                Make Public
              </button>
            ) : (
              <button
              style={actionButtonStyle}
                onClick={() =>
                  handleVisibilityChange(photo._id, "private")
                }
              >
                Make Private
              </button>
            )}

            <button
                style={actionButtonStyle}
              onClick={() =>
                handleDownloadPhoto(photo._id, photo.originalName)
              }
            >
              Download Photo
            </button>

            <button
            style={actionButtonStyle}
              onClick={() =>
                handleHidePhoto(photo._id, !photo.isHidden)
              }
            >
              {photo.isHidden ? "Unhide Photo" : "Hide Photo"}
            </button>

            <button
              onClick={() => handleDeletePhoto(photo._id)}
              style={{
  ...actionButtonStyle,
  background: "#783F46",
  color: "#F5EAEA",
  border: "1px solid rgba(245, 234, 234, 0.2)",
}}
            >
              Delete Photo
            </button>
          </div>
        </div>
      ))}
    </div>

    {message && <p>{message}</p>}
  </div>
);

}

const dashboardPageStyle = {
  minHeight: "100vh",
  boxSizing: "border-box",
  padding: "35px 25px",
  //background: "transparent",
  backgroundImage:
  "linear-gradient(rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.15)), url('/User Image.jpeg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundAttachment: "fixed",
  fontFamily: "'Segoe UI', sans-serif",
  color: "#263238",
};

const cardStyle = {
  maxWidth: "1200px",
  margin: "25px auto 30px",
  padding: "15px 0",
  background: "transparent",
  border: "none",
  borderRadius: "0",
  boxShadow: "none",
  backdropFilter: "none",
};

const buttonStyle = {
  padding: "13px 24px",
  background: "rgba(77, 96, 120, 0.92)",
  color: "#F5F2EA",
  border: "1px solid rgba(234, 231, 223, 0.55)",
  borderRadius: "12px",
  fontSize: "14px",
  fontWeight: "600",
  letterSpacing: "0.3px",
  cursor: "pointer",
  transition: "all 0.25s ease",
  boxShadow: "0 4px 12px rgba(38, 50, 56, 0.16)",
};

const logoutButtonStyle = {
  ...buttonStyle,
  background: "rgba(120, 63, 70, 0.90)",
  color: "#F5EAEA",
  border: "1px solid rgba(245, 234, 234, 0.45)",
  boxShadow: "0 4px 12px rgba(38, 50, 56, 0.16)",
};

const galleryStyle = {
  columnWidth: "280px",
  columnGap: "22px",
  marginTop: "25px",
};

const photoCardStyle = {
  position: "relative",
  display: "inline-block",
  width: "100%",
  boxSizing: "border-box",
  breakInside: "avoid",
  marginBottom: "22px",
  overflow: "hidden",
  borderRadius: "14px",
};

const actionButtonStyle = {
  padding: "9px 12px",
  background: "#4D6078",
  color: "#263238",
  border: "1px solid rgba(234, 231, 223, 0.2)",
  borderRadius: "8px",
  fontSize: "12px",
  fontWeight: "600",
  cursor: "pointer",
  margin: "5px",
};

const imageStyle = {
  width: "100%",
  height: "auto",
  maxHeight: "320px",
  objectFit: "contain",
  display: "block",
  borderRadius: "14px",
  transition: "transform 0.3s ease",
};
export default UserDashboard;
