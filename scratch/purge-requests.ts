import { db } from "../src/db";
import { requests } from "../src/db/schema";

async function purge() {
  console.log("Purging all requests...");
  await db.delete(requests);
  console.log("Purge complete.");
  process.exit(0);
}

purge().catch(e => {
  console.error(e);
  process.exit(1);
});
