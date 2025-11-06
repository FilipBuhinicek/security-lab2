import express from "express";
import pool from "../db.js";
import fs from "fs";
import path from "path";
import escapeHtml from "escape-html";

const router = express.Router();
const cfgPath = path.join(process.cwd(), "config.json");

function readCfg(){ try { return JSON.parse(fs.readFileSync(cfgPath)); } catch(e){ return { vulnerableXSS:true }; } }

router.get("/comments", async (req,res)=>{
  const result = await pool.query("SELECT * FROM comments ORDER BY created_at DESC");
  const cfg = readCfg();
  const comments = result.rows.map(r => ({
    id: r.id,
    author: escapeHtml(r.author || ""),
    textRaw: r.text || "",
    textEsc: escapeHtml(r.text || ""),
    created_at: r.created_at
  }));
  res.render("comments", { comments, vulnerableXSS: cfg.vulnerableXSS });
});

router.post("/comments", async (req,res)=>{
  const { author, text } = req.body;
  await pool.query("INSERT INTO comments(author, text) VALUES($1,$2)", [author, text]);
  res.redirect("/comments");
});

export default router;
