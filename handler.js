// handler.js
import serverless from "serverless-http";
import app from "./src/backend/index.js";   // the refactored Express app

export const main = serverless(app);
