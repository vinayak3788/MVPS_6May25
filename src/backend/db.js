import pkg from "pg";
const { Pool } = pkg;

/**
 * Configure Postgres connection pool from environment variables.
 * Make sure you’ve set in your environment (e.g. Replit Secrets or .env):
 *   DB_HOST
 *   DB_PORT
 *   DB_USER
 *   DB_PASS
 *   DB_NAME
 */
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
});

/**
 * Initialize the database schema (run once at startup).
 */
export const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      role TEXT DEFAULT 'user',
      protected INTEGER DEFAULT 0,
      blocked INTEGER DEFAULT 0
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS profiles (
      email TEXT PRIMARY KEY,
      firstName TEXT,
      lastName TEXT,
      mobileNumber TEXT
    );
  `);
};

/**
 * Run any SQL query; returns the full result object.
 */
export const runQuery = async (text, params = []) => {
  try {
    return await pool.query(text, params);
  } catch (err) {
    console.error("Database query error:", err);
    throw err;
  }
};

/**
 * Run a query and return a single row (or undefined).
 */
export const fetchData = async (text, params = []) => {
  const res = await runQuery(text, params);
  return res.rows[0];
};

/**
 * Create a new order, generate its orderNumber, and return both.
 */
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

  // Insert and get the new ID
  const insertRes = await runQuery(
    `INSERT INTO orders
      (userEmail, fileNames, printType, sideOption, spiralBinding, totalPages, totalCost)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING id`,
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
  const id = insertRes.rows[0].id;
  const orderNumber = `ORD${id.toString().padStart(4, "0")}`;

  // Update the record with its generated orderNumber
  await runQuery(`UPDATE orders SET orderNumber = $1 WHERE id = $2`, [
    orderNumber,
    id,
  ]);

  return { id, orderNumber };
};

/**
 * Fetch all orders, most recent first.
 */
export const getAllOrders = async () => {
  const res = await runQuery(`SELECT * FROM orders ORDER BY createdAt DESC`);
  return { orders: res.rows };
};

/**
 * Change an order’s status.
 */
export const updateOrderStatus = async (id, status) => {
  await runQuery(`UPDATE orders SET status = $1 WHERE id = $2`, [status, id]);
};

/**
 * Ensure a user row exists; if not, insert with default role.
 */
export const ensureUserRole = async (email) => {
  const user = await fetchData(`SELECT * FROM users WHERE email = $1`, [email]);
  if (!user) {
    const role = email === "vinayak3788@gmail.com" ? "admin" : "user";
    await runQuery(
      `INSERT INTO users (email, role, protected, blocked)
       VALUES ($1,$2,1,0)`,
      [email, role],
    );
  }
  const ur = await fetchData(`SELECT role FROM users WHERE email = $1`, [
    email,
  ]);
  return ur?.role || "user";
};

/**
 * Update a user’s role (cannot change protected admin).
 */
export const updateUserRole = async (email, role) => {
  if (email === "vinayak3788@gmail.com") {
    throw new Error("Cannot update role for protected admin.");
  }
  await runQuery(`UPDATE users SET role = $1 WHERE email = $2`, [role, email]);
};

/**
 * Retrieve a user’s role.
 */
export const getUserRole = async (email) => {
  const ur = await fetchData(`SELECT role FROM users WHERE email = $1`, [
    email,
  ]);
  return ur?.role || "user";
};

/**
 * Block a user (cannot block protected admin).
 */
export const blockUser = async (email) => {
  if (email === "vinayak3788@gmail.com") {
    throw new Error("Cannot block protected admin.");
  }
  await runQuery(`UPDATE users SET blocked = 1 WHERE email = $1`, [email]);
};

/**
 * Unblock a user.
 */
export const unblockUser = async (email) => {
  await runQuery(`UPDATE users SET blocked = 0 WHERE email = $1`, [email]);
};

/**
 * Delete a user (cannot delete protected admin).
 */
export const deleteUser = async (email) => {
  if (email === "vinayak3788@gmail.com") {
    throw new Error("Cannot delete protected admin.");
  }
  await runQuery(`DELETE FROM users WHERE email = $1`, [email]);
};

/**
 * Check whether a user is blocked.
 */
export const isUserBlocked = async (email) => {
  const row = await fetchData(`SELECT blocked FROM users WHERE email = $1`, [
    email,
  ]);
  return row?.blocked === 1;
};

/**
 * Update the fileNames/totalPages for an existing order.
 */
export const updateOrderFiles = async (orderId, { fileNames, totalPages }) => {
  await runQuery(
    `UPDATE orders
       SET fileNames = $1,
           totalPages = $2
     WHERE id = $3`,
    [fileNames, totalPages, orderId],
  );
};
