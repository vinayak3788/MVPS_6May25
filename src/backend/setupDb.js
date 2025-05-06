//src/backend/setupDb.js

import sqlite3 from "sqlite3";
import { open } from "sqlite";

export const initDB = async () => {
  const db = await open({
    filename: "./data/orders.db", // ✅ Correct target confirmed
    driver: sqlite3.Database,
  });

  // Existing tables (no changes, safe)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      role TEXT DEFAULT 'user',
      protected INTEGER DEFAULT 0,
      blocked INTEGER DEFAULT 0
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userEmail TEXT,
      fileNames TEXT,
      printType TEXT,
      sideOption TEXT,
      spiralBinding INTEGER,
      totalPages INTEGER,
      totalCost REAL,
      status TEXT DEFAULT 'new',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      orderNumber TEXT
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      email TEXT PRIMARY KEY,
      firstName TEXT,
      lastName TEXT,
      mobileNumber TEXT,
      mobileVerified INTEGER DEFAULT 0
    );
  `);

  // 🆕 Stationery Products table (only new addition)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS stationery_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      discount REAL DEFAULT 0,
      images TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

initDB();
