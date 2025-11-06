import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";

const router = express.Router();

router.get("/login", (req,res)=>res.render("login",{error:null}));
router.post("/login", async (req,res)=>{
  const { username, password } = req.body;
  const userRes = await pool.query("SELECT id, username, password_hash, role FROM users WHERE username=$1", [username]);
  if(userRes.rows.length===0) return res.render("login", { error: "Pogrešno korisničko ime ili lozinka" });

  const user = userRes.rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if(!ok) return res.render("login", { error: "Pogrešno korisničko ime ili lozinka" });

  req.session.user = { id: user.id, username: user.username, role: user.role };
  res.redirect("/");
});

router.post("/logout", (req,res)=>{
  req.session.destroy(()=>res.redirect("/"));
});

export default router;
