import express from "express";
import { readConfig, writeConfig } from "../lib/configStore.js";

const router = express.Router();

function ensureLogged(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

router.get("/admin", ensureLogged, async (req, res) => {
  const cfg = await readConfig();
  res.render("admin", { config: cfg });
});

router.post("/admin/toggles", ensureLogged, async (req, res) => {
  const { vulnerableXSS, brokenAccess } = req.body;
  const cfg = {
    vulnerableXSS: vulnerableXSS === "on",
    brokenAccess: brokenAccess === "on",
  };
  await writeConfig(cfg);
  res.redirect("/");
});

export default router;
