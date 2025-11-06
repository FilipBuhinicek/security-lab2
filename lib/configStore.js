import pool from "../db.js";

const DEFAULT_CFG = {
  vulnerableXSS: true,
  brokenAccess: true,
};

export async function readConfig() {
  try {
    const res = await pool.query("SELECT value FROM settings WHERE key='config'");
    return res.rows[0]?.value || DEFAULT_CFG;
  } catch (err) {
    console.error("⚠️ Greška pri čitanju konfiguracije:", err);
    return DEFAULT_CFG;
  }
}

export async function writeConfig(cfg) {
  try {
    await pool.query(
      `INSERT INTO settings (key, value)
       VALUES ('config', $1)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [cfg]
    );
  } catch (err) {
    console.error("⚠️ Greška pri spremanju konfiguracije:", err);
  }
}
