import pkg from "pg";
const { Pool } = pkg;
export const pool = new Pool({
    host:"localhost",
    user:"postgres",
    password: "user",
    database: "geogamer",
    port: 5432
});
