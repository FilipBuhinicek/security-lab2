import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import expressLayouts from "express-ejs-layouts";

import pool from "./db.js";
import { readConfig } from "./lib/configStore.js";

import authRoutes from "./routes/auth.js";
import commentsRoutes from "./routes/comments.js";
import ticketsRoutes from "./routes/tickets.js";
import adminRoutes from "./routes/admin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();


app.set("trust proxy", 1)
app.use(expressLayouts);
app.set("layout", "layout");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
    },
  })
);

app.use(async (req, res, next) => {
  try {
    const cfg = await readConfig();
    res.locals.toggles = cfg;
  } catch (e) {
    console.error("⚠️ Ne mogu učitati konfiguraciju iz baze:", e);
    res.locals.toggles = { vulnerableXSS: true, brokenAccess: true };
  }

  res.locals.user = req.session.user || null;
  next();
});

app.use(authRoutes);
app.use(commentsRoutes);
app.use(ticketsRoutes);
app.use(adminRoutes);

app.get("/", async (req, res) => {
  try {
    const cnt = await pool.query("SELECT COUNT(*) FROM comments");
    res.render("index", { commentCount: cnt.rows[0].count });
  } catch (err) {
    console.error("Greška pri brojanju komentara:", err);
    res.render("index", { commentCount: 0 });
  }
});

app.get("/health", (req, res) => res.send("ok"));

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).send("Internal Server Error");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server up on ${PORT}`));
