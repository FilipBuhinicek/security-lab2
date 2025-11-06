import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

const cfgPath = path.join(process.cwd(), "config.json");

function ensureLogged(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

router.post("/admin/toggles", ensureLogged, (req, res) => {
  const { vulnerableXSS, brokenAccess } = req.body;
  const cfg = {
    vulnerableXSS: vulnerableXSS === "on",
    brokenAccess: brokenAccess === "on",
  };
  fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));
  res.redirect("/");
});

export default router;
