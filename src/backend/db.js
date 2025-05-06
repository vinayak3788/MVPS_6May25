// src/backend/db.js

import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const dbPath = path.resolve("data/orders.db");

// Function to initialize the database
const initDb = async () => {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      role TEXT DEFAULT 'user',
      protected INTEGER DEFAULT 0,
      blocked INTEGER DEFAULT 0
    );

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

    CREATE TABLE IF NOT EXISTS profiles (
      email TEXT PRIMARY KEY,
      firstName TEXT,
      lastName TEXT,
      mobileNumber TEXT
    );
  `);

  return db;
};

// Helper function to run queries with a single argument
const runQuery = async (query, params = []) => {
  const db = await initDb();
  return db.run(query, params);
};

// Helper function to fetch data with a single query
const fetchData = async (query, params = []) => {
  const db = await initDb();
  return db.get(query, params);
};

// Create order
export const createOrder = async (order) => {
  const {
    userEmail,
    fileNames = "",
    printType,
    sideOption,
    spiralBinding = 0,
    totalPages = 0,
    totalCost,
  } = order;

  const result = await runQuery(
    `INSERT INTO orders (userEmail, fileNames, printType, sideOption, spiralBinding, totalPages, totalCost) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      userEmail,
      fileNames,
      printType,
      sideOption,
      spiralBinding,
      totalPages,
      totalCost,
    ],
  );

  const orderNumber = `ORD${result.lastID.toString().padStart(4, "0")}`;
  await runQuery(`UPDATE orders SET orderNumber = ? WHERE id = ?`, [
    orderNumber,
    result.lastID,
  ]);

  return { id: result.lastID, orderNumber };
};

// Get all orders
export const getAllOrders = async () => {
  const db = await initDb();
  const rows = await db.all(`SELECT * FROM orders ORDER BY createdAt DESC`);
  return { orders: rows };
};

// Update order status
export const updateOrderStatus = async (id, status) => {
  await runQuery(`UPDATE orders SET status = ? WHERE id = ?`, [status, id]);
};

// Ensure user role exists, create if not
export const ensureUserRole = async (email) => {
  const user = await fetchData(`SELECT * FROM users WHERE email = ?`, [email]);

  if (!user) {
    const role = email === "vinayak3788@gmail.com" ? "admin" : "user";
    await runQuery(
      `INSERT INTO users (email, role, protected, blocked) VALUES (?, ?, 1, 0)`,
      [email, role],
    );
  }

  const userRole = await fetchData(`SELECT role FROM users WHERE email = ?`, [
    email,
  ]);
  return userRole?.role || "user";
};

// Update user role
export const updateUserRole = async (email, role) => {
  if (email === "vinayak3788@gmail.com")
    throw new Error("Cannot update role for protected admin.");
  await runQuery(`UPDATE users SET role = ? WHERE email = ?`, [role, email]);
};

// Get user role
export const getUserRole = async (email) => {
  const userRole = await fetchData(`SELECT role FROM users WHERE email = ?`, [
    email,
  ]);
  return userRole?.role || "user";
};

// Block user
export const blockUser = async (email) => {
  if (email === "vinayak3788@gmail.com")
    throw new Error("Cannot block protected admin.");
  await runQuery(`UPDATE users SET blocked = 1 WHERE email = ?`, [email]);
};

// Unblock user
export const unblockUser = async (email) => {
  await runQuery(`UPDATE users SET blocked = 0 WHERE email = ?`, [email]);
};

// Delete user
export const deleteUser = async (email) => {
  if (email === "vinayak3788@gmail.com")
    throw new Error("Cannot delete protected admin.");
  await runQuery(`DELETE FROM users WHERE email = ?`, [email]);
};

// Check if user is blocked
export const isUserBlocked = async (email) => {
  const result = await fetchData(`SELECT blocked FROM users WHERE email = ?`, [
    email,
  ]);
  return result?.blocked === 1;
};

// Update order files after upload
export const updateOrderFiles = async (orderId, { fileNames, totalPages }) => {
  await runQuery(
    `UPDATE orders SET fileNames = ?, totalPages = ? WHERE id = ?`,
    [fileNames, totalPages, orderId],
  );
};

// Export initDb for potential testing or direct usage elsewhere
export { initDb };
