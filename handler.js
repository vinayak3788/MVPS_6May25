import serverless from "serverless-http";
import app from "./src/backend/index.js";
export const main = serverless(app);
