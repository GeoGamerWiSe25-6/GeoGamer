import pkg from "pg";
import { config } from "./env.js";
const { Pool } = pkg;

// export const pool = new Pool({
//     host:"localhost",
//     user:"postgres",
//     password: "user",
//     database: "geogamer",
//     port: 5432
// });

export const pool = new Pool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  port: config.db.port,

  // Connection Pool Settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("error", (err) => {
  console.error("Unexpected database error:", err);
  process.exit(-1);
});

// Test query
export async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("Database time:", result.rows[0].now);
    return true;
  } catch (error) {
    console.error("Database connection failed:", error.message);
    return false;
  }
}
