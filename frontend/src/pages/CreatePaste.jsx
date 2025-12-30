import { useState } from "react";
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL;
export default function CreatePaste() {
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setResultUrl("");

    if (!content.trim()) {
      setError("Content is required");
      return;
    }

    const payload = {
      content,
    };

    if (ttl) payload.ttl_seconds = Number(ttl);
    if (maxViews) payload.max_views = Number(maxViews);
  try {
  const res = await axios.post(
    `${API_BASE}/api/pastes`,
    payload,
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  // Axios auto parses JSON
  setResultUrl(res.data.url);
} catch (err) {
  setError(
    err.response?.data?.error || "Something went wrong"
  );
}

  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "Arial" }}>
      <h2>Pastebin Lite</h2>

      <textarea
        rows={8}
        style={{ width: "100%" }}
        placeholder="Enter your text..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <div style={{ marginTop: 10 }}>
        <input
          type="number"
          placeholder="TTL (seconds)"
          value={ttl}
          onChange={(e) => setTtl(e.target.value)}
        />
        {"  "}
        <input
          type="number"
          placeholder="Max views"
          value={maxViews}
          onChange={(e) => setMaxViews(e.target.value)}
        />
      </div>

      <button
        onClick={handleSubmit}
        style={{ marginTop: 10, padding: "8px 16px" }}
      >
        Create Paste
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {resultUrl && (
        <p>
          ✅ Paste created:{" "}
          <a href={resultUrl} target="_blank">
            {resultUrl}
          </a>
        </p>
      )}
    </div>
  );
}
