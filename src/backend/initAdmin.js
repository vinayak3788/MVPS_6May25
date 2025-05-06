// src/server/initAdmin.js
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import path from "path";

const dbPath = path.resolve("data/orders.db");

const init = async () => {
  const db = await open({ filename: dbPath, driver: sqlite3.Database });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      role TEXT DEFAULT 'user'
    )
  `);

  await db.run(`
    INSERT OR REPLACE INTO users (email, role)
    VALUES ('vinayak3788@gmail.com', 'admin')
  `);

  console.log("✅ Admin user inserted.");
};

init();
