
import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";


const dashboardPageStyle = {
  minHeight: "100vh",
  boxSizing: "border-box",
  padding: "35px 25px",
  background:
    "linear-gradient(rgba(30, 42, 58, 0.82), rgba(120, 172, 250, 0.88)), url('/Admin Image.png') center / cover fixed",
  fontFamily: "'Segoe UI', sans-serif",
  color: "#EAE7DF",
};


const dashboardCardStyle = {
  background: "rgba(128, 103, 122, 0.94)",
  border: "1px solid rgba(255,255,255,0.35)",
  borderRadius: "18px",
  boxShadow: "0 12px 30px rgba(45, 30, 48, 0.18)",
  color: "#FFFFFF",
};


function AdminDashboard() {
  const [photos, setPhotos] = useState([]);
  const [allPublicPhotos, setAllPublicPhotos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [publicPhotosLoading, setPublicPhotosLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState({
  pendingPhotos: 0,
  approvedPhotos: 0,
  rejectedPhotos: 0,
  totalPublicPhotos: 0,
});

  const token = localStorage.getItem("adminToken");

  const fetchPendingPhotos = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API}/admin/pending-photos`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const pendingPhotos = response.data.photos || [];

const photosWithPreviews = await Promise.all(
  pendingPhotos.map(async (photo) => {
    try {
      const previewResponse = await axios.get(
        `${API}/admin/${photo._id}/preview`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return {
        ...photo,
        imageUrl: previewResponse.data.imageUrl,
      };
    } catch (error) {
      return {
        ...photo,
        imageUrl: "",
      };
    }
  })
);

setPhotos(photosWithPreviews);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Could not load pending photos."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  fetchPendingPhotos();
  fetchStats();
  fetchAllPublicPhotos();
}, []);

const fetchStats = async () => {
  try {
    const response = await axios.get(`${API}/admin/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setStats(response.data.stats);
  } catch (error) {
    console.error("Could not fetch dashboard statistics:", error);
  }
};

const fetchAllPublicPhotos = async () => {
  try {
    setPublicPhotosLoading(true);

    const response = await axios.get(
      `${API}/admin/public-photos`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const publicPhotos = response.data.photos || [];

const photosWithPreviews = await Promise.all(
  publicPhotos.map(async (photo) => {
    try {
      const previewResponse = await axios.get(
        `${API}/admin/${photo._id}/preview`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return {
        ...photo,
        imageUrl: previewResponse.data.imageUrl,
      };
    } catch (error) {
      return { ...photo, imageUrl: "" };
    }
  })
);

setAllPublicPhotos(photosWithPreviews);
  } catch (error) {
    console.error("Could not fetch public photos:", error);
  } finally {
    setPublicPhotosLoading(false);
  }
};

  const handleModeration = async (photoId, action) => {
    try {
      await axios.patch(
        `${API}/admin/${photoId}/moderation`,
        { action },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(`Photo ${action}d successfully!`);
      fetchPendingPhotos();
      fetchStats();
      fetchAllPublicPhotos();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Could not update photo status."
      );
    }
  };
  const filteredPublicPhotos = allPublicPhotos
  .filter((photo) => {
    const matchesSearch =
      photo.visitor?.visitorId
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      photo.visit?.visitId
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      photo.originalName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      photo.moderationStatus === statusFilter;

    return matchesSearch && matchesStatus;
  })
  .sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();

    return sortOrder === "newest"
      ? dateB - dateA
      : dateA - dateB;
  });
  const clearFilters = () => {
  setSearchTerm("");
  setStatusFilter("all");
  setSortOrder("newest");
};
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin";
  };

  if (loading) {
    return <h2>Loading pending photos...</h2>;
  }

  return (
    <div style={dashboardPageStyle}>
      
<div
  style={{
    textAlign: "center",
    marginBottom: "38px",
    padding: "25px 20px",
  }}
>
  <div
    style={{
      fontSize: "42px",
      marginBottom: "12px",
    }}
  >
    📸
  </div>

  <h1
    style={{
      color: "#EAE7DF",
      fontSize: "40px",
      fontWeight: "700",
      letterSpacing: "1.5px",
      margin: 0,
    }}
  >
    Admin Dashboard
  </h1>

  <div
    style={{
      width: "65px",
      height: "3px",
      background: "#B5A88F",
      margin: "16px auto",
      borderRadius: "5px",
    }}
  />

  <p
    style={{
      color: "#D4D0C7",
      fontSize: "15px",
      letterSpacing: "0.4px",
      margin: 0,
    }}
  >
    Your space to review, manage and curate memories.
  </p>
</div>


<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    margin: "25px 0",
  }}
>
  {[
    {
      title: "Pending Photos",
      value: stats.pendingPhotos,
      color: "#f59e0b",
    },
    {
      title: "Approved Photos",
      value: stats.approvedPhotos,
      color: "#16a34a",
    },
    {
      title: "Rejected Photos",
      value: stats.rejectedPhotos,
      color: "#dc2626",
    },
    {
      title: "Total Public Photos",
      value: stats.totalPublicPhotos,
      color: "#2563eb",
    },
  ].map((item) => (
    <div
      key={item.title}
      style={{
  padding: "22px",
  borderRadius: "16px",
  background: "rgba(234, 231, 223, 0.96)",
  color: "#35465D",
  border: "1px solid rgba(255,255,255,0.7)",
  borderLeft: "5px solid #B5A88F",
  boxShadow: "0 8px 22px rgba(25, 35, 50, 0.16)",
  transition: "transform 0.2s ease",
}}
    >
      <h3 style={{ margin: "0 0 10px" }}>{item.title}</h3>
      <h1
  style={{
    margin: 0,
    fontSize: "36px",
    fontWeight: "800",
    color: "#51404F",
  }}
>
  {item.value}
</h1>
    </div>
  ))}
</div>

      
<button
  onClick={handleLogout}
  className="login-button"
  style={{
  display: "block",
  margin: "20px auto 35px",
  padding: "12px 30px",
  background: "#B5A88F",
  color: "#35465D",
  border: "1px solid rgba(255,255,255,0.35)",
  borderRadius: "10px",
  fontSize: "15px",
  fontWeight: "700",
  letterSpacing: "0.3px",
  cursor: "pointer",
  boxShadow: "0 5px 15px rgba(20, 30, 45, 0.2)",
}}
>
  ↪ Logout
</button>


      <h2
  style={{
  color: "#EAE7DF",
  fontSize: "25px",
  fontWeight: "700",
  letterSpacing: "0.4px",
  marginTop: "35px",
  marginBottom: "20px",
  paddingBottom: "12px",
  borderBottom: "2px solid #B5A88F",
}}
>
  📋 Pending Photo Approvals
</h2>

      {message && <p>{message}</p>}

      
{photos.length === 0 ? (
  <p>No pending photos to review.</p>
) : (
  <div style={{ overflowX: "auto" }}>
    <table
      style={{
        width: "100%",
        minWidth: "850px",
        borderCollapse: "collapse",
        background: "rgba(234, 231, 223, 0.025)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: "1px solid rgba(234, 231, 223, 0.12)",
        borderRadius: "14px",
        overflow: "hidden",
        color: "#EAE7DF",
        boxShadow: "0 10px 28px rgba(20, 30, 45, 0.2)",
      }}
    >
      <thead>
       <tr
  style={{
    background: "rgba(53, 70, 93, 0.28)",
  }}
>
          {["Photo", "Visitor ID", "Visit ID", "Status", "Actions"].map(
            (heading) => (
              <th
                key={heading}
                style={{
                  padding: "16px",
                  textAlign: "left",
                  borderBottom: "2px solid #B5A88F",
                  color: "#EAE7DF",
                  whiteSpace: "nowrap",
                }}
              >
                {heading}
              </th>
            )
          )}
        </tr>
      </thead>

      <tbody>
        {photos.map((photo) => (
          <tr
  key={photo._id}
  style={{
    background:
  photos.indexOf(photo) % 2 === 0
    ? "rgba(234, 231, 223, 0.025)"
    : "rgba(30, 42, 58, 0.04)",
    transition: "background 0.2s ease",
  }}
>
            <td style={{ padding: "14px", borderBottom: "1px solid rgba(234,231,223,0.2)" }}>
              {photo.imageUrl ? (
                <img
                  src={photo.imageUrl}
                  alt={photo.originalName}
                  style={{
                    width: "100px",
height: "75px",
objectFit: "cover",
borderRadius: "10px",
border: "2px solid #B5A88F",
boxShadow: "0 4px 12px rgba(20, 30, 45, 0.25)",
                  }}
                />
              ) : (
                <span>Preview unavailable</span>
              )}
              <div style={{ marginTop: "6px", fontSize: "13px" }}>
                {photo.originalName}
              </div>
            </td>

            <td style={{ padding: "18px", borderBottom: "1px solid rgba(234,231,223,0.2)", verticalAlign: "middle",}}>
              {photo.visitor?.visitorId || "N/A"}
            </td>

            <td style={{ padding: "18px", borderBottom: "1px solid rgba(234,231,223,0.2)", verticalAlign: "middle", }}>
              {photo.visit?.visitId || "N/A"}
            </td>

            <td style={{ padding: "18px", borderBottom: "1px solid rgba(234,231,223,0.2)", verticalAlign: "middle", }}>
              <span
                style={{
                  background: "#B5A88F",
                  color: "#35465D",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontWeight: "700",
                  fontSize: "12px",
                }}
              >
                <span
  style={{
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "20px",
    background: "rgba(181, 168, 143, 0.2)",
    border: "1px solid #B5A88F",
    color: "#EAE7DF",
    fontSize: "12px",
    fontWeight: "600",
    letterSpacing: "0.3px",
    whiteSpace: "nowrap",
  }}
>
  {photo.moderationStatus.replace("_", " ").toUpperCase()}
</span>
              </span>
            </td>

            <td style={{ padding: "14px", whiteSpace: "nowrap", borderBottom: "1px solid rgba(234,231,223,0.2)" }}>
              <button
  onClick={() => handleModeration(photo._id, "approve")}
  style={{
    margin: "4px",
    padding: "9px 15px",
    background: "#B5A88F",
    color: "#35465D",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
  }}
>
  ✓ Approve
</button>
              <button
  onClick={() => handleModeration(photo._id, "reject")}
  style={{
    margin: "4px",
    padding: "9px 15px",
    background: "rgba(180, 90, 90, 0.18)",
    color: "#F2DADA",
    border: "1px solid rgba(220, 150, 150, 0.55)",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
  }}
>
  ✕ Reject
</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

      <hr />
      <div
  style={{
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
    marginBottom: "22px",
    alignItems: "center",
  }}
>
  <input
    type="text"
    placeholder="Search by Visitor ID, Visit ID or photo name..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    style={{
      flex: "1",
      minWidth: "240px",
      padding: "13px 16px",
      borderRadius: "10px",
      border: "1px solid #B5A88F",
      background: "rgba(234, 231, 223, 0.95)",
      color: "#35465D",
      fontSize: "14px",
      outline: "none",
    }}
  />
  <select
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
  style={{
    minWidth: "190px",
    padding: "13px 16px",
    borderRadius: "10px",
    border: "1px solid #B5A88F",
    background: "#EAE7DF",
    color: "#35465D",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  }}
>
  <option value="all">All Statuses</option>
  <option value="approved">Approved</option>
  <option value="rejected">Rejected</option>
  <option value="approval_revoked">Approval Revoked</option>
</select>
<select
  value={sortOrder}
  onChange={(e) => setSortOrder(e.target.value)}
  style={{
    minWidth: "170px",
    padding: "13px 16px",
    borderRadius: "10px",
    border: "1px solid #B5A88F",
    background: "#EAE7DF",
    color: "#35465D",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  }}
>
  <option value="newest">Newest First</option>
  <option value="oldest">Oldest First</option>
</select>
<button
  onClick={clearFilters}
  style={{
    padding: "13px 18px",
    borderRadius: "10px",
    border: "1px solid #B5A88F",
    background: "rgba(181, 168, 143, 0.18)",
    color: "#EAE7DF",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
  }}
>
  Clear Filters
</button>
</div>

<h2
  style={{
    color: "#FFFFFF",
    fontSize: "25px",
    marginTop: "35px",
    marginBottom: "20px",
    textShadow: "0 2px 8px rgba(50, 30, 50, 0.4)",
  }}
>
  🖼️ All Public Photos
</h2>
<p
  style={{
    color: "#D4D0C7",
    fontSize: "14px",
    marginTop: "-10px",
    marginBottom: "18px",
  }}
>
  Showing {filteredPublicPhotos.length} of {allPublicPhotos.length} public photos
</p>
{publicPhotosLoading ? (
  <p>Loading public photos...</p>
) : allPublicPhotos.length === 0 ? (
  <p>No public photos found.</p>
) : filteredPublicPhotos.length === 0 ? (
  <p
    style={{
      color: "#EAE7DF",
      textAlign: "center",
      padding: "25px",
      background: "rgba(77, 96, 120, 0.6)",
      borderRadius: "10px",
    }}
  >
    No photos match your search or selected status.
  </p>
) : (  <div style={{ overflowX: "auto" }}>
    <table
      style={{
        width: "100%",
        minWidth: "1050px",
        borderCollapse: "collapse",
        background: "rgba(234, 231, 223, 0.025)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: "1px solid rgba(234, 231, 223, 0.12)",
        borderRadius: "14px",
        overflow: "hidden",
        color: "#EAE7DF",
        boxShadow: "0 10px 28px rgba(20, 30, 45, 0.2)",
      }}
    >
      <thead>
        <tr
  style={{
    background: "rgba(53, 70, 93, 0.28)",
  }}
>
          {["Photo", "Visitor ID", "Visit ID", "Visibility", "Status", "Actions"].map(
            (heading) => (
              <th
                key={heading}
                style={{
                  padding: "16px",
                  textAlign: "left",
                  borderBottom: "2px solid #B5A88F",
                  color: "#EAE7DF",
                  whiteSpace: "nowrap",
                }}
              >
                {heading}
              </th>
            )
          )}
        </tr>
      </thead>

      <tbody>
        {filteredPublicPhotos.map((photo) => (
          <tr
  key={photo._id}
  style={{
    background:
  allPublicPhotos.indexOf(photo) % 2 === 0
    ? "rgba(234, 231, 223, 0.025)"
    : "rgba(30, 42, 58, 0.04)",
    transition: "background 0.2s ease",
  }}
>
            <td style={{ padding: "14px", borderBottom: "1px solid rgba(234,231,223,0.2)" }}>
              {photo.imageUrl ? (
                <img
                  src={photo.imageUrl}
                  alt={photo.originalName}
                  style={{
  width: "100px",
  height: "75px",
  objectFit: "cover",
  borderRadius: "10px",
  border: "2px solid #B5A88F",
  boxShadow: "0 4px 12px rgba(20, 30, 45, 0.25)",
}}
                />
              ) : (
                "Preview unavailable"
              )}
              <div style={{ marginTop: "6px", fontSize: "12px" }}>
                {photo.originalName}
              </div>
            </td>

            <td style={{
  padding: "18px",
  borderBottom: "1px solid rgba(234,231,223,0.2)",
  verticalAlign: "middle",
}}>
              {photo.visitor?.visitorId || "N/A"}
            </td>

            <td style={{
  padding: "18px",
  borderBottom: "1px solid rgba(234,231,223,0.2)",
  verticalAlign: "middle",
}}>
              {photo.visit?.visitId || "N/A"}
            </td>

            <td style={{
  padding: "18px",
  borderBottom: "1px solid rgba(234,231,223,0.2)",
  verticalAlign: "middle",
}}>
              {photo.visibility || "N/A"}
            </td>

            <td style={{ padding: "14px", borderBottom: "1px solid rgba(234,231,223,0.2)" }}>
              <span
  style={{
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "20px",
    background: "rgba(181, 168, 143, 0.2)",
    border: "1px solid #B5A88F",
    color: "#EAE7DF",
    fontSize: "12px",
    fontWeight: "600",
    letterSpacing: "0.3px",
    whiteSpace: "nowrap",
  }}
>
  {photo.moderationStatus.replace("_", " ").toUpperCase()}
</span>
            </td>

            <td style={{ padding: "14px", borderBottom: "1px solid rgba(234,231,223,0.2)" }}>
              {photo.moderationStatus === "approved" && (
                <button
  onClick={() => handleModeration(photo._id, "revoke")}
  style={{
    margin: "4px",
    padding: "9px 15px",
    background: "rgba(181, 168, 143, 0.18)",
    color: "#EAE7DF",
    border: "1px solid #B5A88F",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
  }}
>
  Revoke Approval
</button>
              )}

              {photo.moderationStatus === "approval_revoked" && (
                <>
                  <button
  onClick={() => handleModeration(photo._id, "approve")}
  style={{
    margin: "4px",
    padding: "9px 15px",
    background: "#B5A88F",
    color: "#35465D",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
  }}
>
  ✓ Re-approve
</button>

                  <button
  onClick={() => handleModeration(photo._id, "reject")}
  style={{
    margin: "4px",
    padding: "9px 15px",
    background: "rgba(180, 90, 90, 0.18)",
    color: "#F2DADA",
    border: "1px solid rgba(220, 150, 150, 0.55)",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
  }}
>
  ✕ Reject
</button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}    </div>
  );
}

export default AdminDashboard;
