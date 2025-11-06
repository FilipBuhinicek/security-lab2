import pool from "./db.js";
import bcrypt from "bcrypt";

async function seed(){
  await pool.query("DELETE FROM comments");
  await pool.query("DELETE FROM tickets");
  await pool.query("DELETE FROM users");

  const pwAlice = await bcrypt.hash("alice123", 10);
  const pwBob = await bcrypt.hash("bob123", 10);

  const a = await pool.query("INSERT INTO users(username, password_hash, role) VALUES($1,$2,$3) RETURNING id", ["alice", pwAlice, "user"]);
  const b = await pool.query("INSERT INTO users(username, password_hash, role) VALUES($1,$2,$3) RETURNING id", ["bob", pwBob, "user"]);

  await pool.query("INSERT INTO tickets(title, content, owner_id) VALUES($1,$2,$3)", ["Alice ticket", "Alice's secret ticket", a.rows[0].id]);
  await pool.query("INSERT INTO tickets(title, content, owner_id) VALUES($1,$2,$3)", ["Bob ticket", "Bob's content", b.rows[0].id]);

  await pool.query("INSERT INTO comments(author, text) VALUES($1,$2)", ["App","Dobrodošli u demo!"]);
  console.log("Seed complete");
  process.exit(0);
}

seed().catch(e=>{console.error(e); process.exit(1);});
