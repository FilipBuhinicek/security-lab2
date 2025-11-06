import express from "express";
import pool from "../db.js";
import fs from "fs";
import path from "path";

const router = express.Router();
const cfgPath = path.join(process.cwd(),"config.json");
function readCfg(){ try { return JSON.parse(fs.readFileSync(cfgPath)); } catch(e){ return { brokenAccess:true }; } }

function ensureLogged(req,res,next){
  if(!req.session.user) return res.redirect("/login");
  next();
}

router.get("/tickets", ensureLogged, async (req, res) => {
  const user = req.session.user;

  tickets = await pool.query(
    "SELECT t.*, u.username as owner_name FROM tickets t LEFT JOIN users u ON t.owner_id = u.id WHERE t.owner_id = $1 ORDER BY t.id",
    [user.id]
  );

  res.render("tickets", {
    tickets: tickets.rows,
    currentUser: user,
  });
});


router.get("/tickets/:id/edit", ensureLogged, async (req, res) => {
  const id = req.params.id;
  const user = req.session.user;
  const cfg = readCfg();

  const ticketRes = await pool.query("SELECT * FROM tickets WHERE id=$1", [id]);
  if (ticketRes.rows.length === 0) return res.send("Ticket ne postoji");
  const ticket = ticketRes.rows[0];

  if (!cfg.brokenAccess) {
    if (user.id !== ticket.owner_id) {
      console.log(`Korisnik ${user.username} pokušao pristupiti tuđem ticketu.`);
      return res.redirect("/tickets");
    }
  }

  res.render("edit_ticket", { ticket });
});


router.post("/tickets/:id/edit", ensureLogged, async (req,res)=>{
  const cfg = readCfg();
  const id = req.params.id;
  const ticketRes = await pool.query("SELECT * FROM tickets WHERE id=$1", [id]);
  if(ticketRes.rows.length===0) return res.send("Ne postoji");

  const ticket = ticketRes.rows[0];

  if(cfg.brokenAccess){
    await pool.query("UPDATE tickets SET title=$1, content=$2 WHERE id=$3", [req.body.title, req.body.content, id]);
    return res.redirect("/tickets");
  } else {
    const user = req.session.user;
    if(user.id === ticket.owner_id){
      await pool.query("UPDATE tickets SET title=$1, content=$2 WHERE id=$3", [req.body.title, req.body.content, id]);
      return res.redirect("/tickets");
    } else {
      return res.status(403).send("Nemaš pravo uređivati ovaj ticket (403)");
    }
  }
});

export default router;
