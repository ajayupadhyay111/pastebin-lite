import express from "express";
import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import { nanoid } from "nanoid";
import cors from 'cors';
import path from 'path';

dotenv.config();

const app = express();

const __dirname = path.resolve();


app.use(express.json());
app.use(cors())

// Neon SQL client
const sql = neon(process.env.DATABASE_URL);

// Deterministic Time Helper
function getNow(req) {
  if (process.env.TEST_MODE === "1") {
    const t = req.headers["x-test-now-ms"];
    if (t) return Number(t);
  }
  return Date.now();
}

// Health Check
app.get("/api/healthz", async (_req, res) => {
  try {
    await sql`SELECT 1`;
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

// Create Paste
app.post("/api/pastes", async (req, res) => {
  const { content, ttl_seconds, max_views } = req.body;
  // Validation
  if (!content || typeof content !== "string" || !content.trim()) {
    return res.status(400).json({ error: "Invalid content" });
  }
  if (ttl_seconds && (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)) {
    return res.status(400).json({ error: "Invalid ttl_seconds" });
  }
  if (max_views && (!Number.isInteger(max_views) || max_views < 1)) {
    return res.status(400).json({ error: "Invalid max_views" });
  }

  const now = getNow(req);
  const expiresAt = ttl_seconds ? now + ttl_seconds * 1000 : null;
  const id = nanoid();

  await sql`
    INSERT INTO "Paste"
      ("id", "content", "createdAt", "expiresAt", "maxViews", "viewsUsed")
    VALUES
      (${id}, ${content}, ${BigInt(now)}, ${expiresAt ? BigInt(expiresAt) : null
    }, ${max_views ?? null}, 0)
  `;

  res.status(201).json({
    id,
    url: `${process.env.VITE_API_BASE_URL}/p/${id}`,
  });
});

// fetch paste
app.get("/api/paste/:id", async (req, res) => {
  const now = getNow(req);

  const rows = await sql`
    UPDATE "Paste"
    SET "viewsUsed" = "viewsUsed" + 1
    WHERE id = ${req.params.id}
      AND ("expiresAt" IS NULL OR "expiresAt" > ${BigInt(now)})
      AND ("maxViews" IS NULL OR "viewsUsed" < "maxViews")
    RETURNING *;
  `;

  if (rows.length === 0) {
    return res.status(404).json({ error: "Unavailable" });
  }

  const paste = rows[0];

  res.json({
    content: paste.content,
    remaining_views:
      paste.maxViews === null
        ? null
        : paste.maxViews - paste.viewsUsed,
    expires_at: paste.expiresAt
      ? new Date(Number(paste.expiresAt)).toISOString()
      : null,
  });
});

// View Paste (HTML)
app.get("/p/:id", async (req, res) => {
  const now = getNow(req);

  const rows = await sql`
    UPDATE "Paste"
    SET "viewsUsed" = "viewsUsed" + 1
    WHERE id = ${req.params.id}
      AND ("expiresAt" IS NULL OR "expiresAt" > ${BigInt(now)})
      AND ("maxViews" IS NULL OR "viewsUsed" < "maxViews")
    RETURNING *;
  `;

  if (rows.length === 0) {
    return res.status(404).send("Paste not found or expired");
  }

  const paste = rows[0];

  res.setHeader("Content-Type", "text/html");
  res.send(`
    <html>
      <body>
        <pre>${paste.content.replace(/</g, "&lt;")}</pre>
      </body>
    </html>
  `);
});

app.use(express.static(path.join(__dirname, "/frontend/dist")))
app.get(/.*/, (req, res) => {
  res.sendFile(
    path.resolve(__dirname, "frontend", "dist", "index.html")
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
