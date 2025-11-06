import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import expressLayouts from "express-ejs-layouts";


import pool from "./db.js";

import authRoutes from "./routes/auth.js";
import commentsRoutes from "./routes/comments.js";
import ticketsRoutes from "./routes/tickets.js";
import adminRoutes from "./routes/admin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(expressLayouts);
app.set("layout", "layout");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: process.env.SESSION_SECRET || "keyboard cat",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24*60*60*1000 }
}));

app.use((req,res,next)=>{
  try {
    res.locals.toggles = JSON.parse(fs.readFileSync(path.join(__dirname,"config.json")));
  } catch (e) {
    res.locals.toggles = { vulnerableXSS: true, brokenAccess: true };
  }
  res.locals.user = req.session.user || null;
  next();
});

app.use(authRoutes);
app.use(commentsRoutes);
app.use(ticketsRoutes);
app.use(adminRoutes);

app.get("/", async (req,res)=>{
  const cnt = await pool.query("SELECT COUNT(*) FROM comments");
  res.render("index", { commentCount: cnt.rows[0].count });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Server up on ${PORT}`));
