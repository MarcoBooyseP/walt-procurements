import { postgres } from "drizzle-orm/postgres-js";
import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function dropTable() {
  console.log("Dropping requests table...");
  try {
    await db.execute(sql`DROP TABLE IF EXISTS requests;`);
    console.log("Table dropped successfully.");
  } catch (err) {
    console.error("Error dropping table:", err);
  }
  process.exit(0);
}

dropTable();
