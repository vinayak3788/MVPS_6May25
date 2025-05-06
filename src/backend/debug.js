// src/server/debug.js
import { getAllOrders } from "./db.js";

const run = async () => {
  const orders = await getAllOrders();
  console.log("📝 Orders in DB:\n", orders);
};

run();
