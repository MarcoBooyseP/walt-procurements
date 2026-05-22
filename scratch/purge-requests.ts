import { db } from "../src/db";
import { requests } from "../src/db/schema";

async function purge() {
  console.log("Purging all requests...");
  await db.delete(requests);
  console.log("Successfully deleted all requests.");
  process.exit(0);
}

purge().catch((err) => {
  console.error("Error purging requests:", err);
  process.exit(1);
});
