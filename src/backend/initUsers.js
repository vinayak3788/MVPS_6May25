// temporary script
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import path from "path";

const dbPath = path.resolve("data/users.db");

const initDb = async () => {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      role TEXT DEFAULT 'user'
    );
  `);

  console.log("✅ users table initialized.");
};

initDb();
