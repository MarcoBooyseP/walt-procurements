import { db } from "../src/db";
import { requests } from "../src/db/schema";

async function main() {
  console.log("Updating all requests...");
  
  await db.update(requests).set({
    status: "AWAITING_PLACEMENT",
    supplier: "Unsure (To be confirmed)",
  });
  
  console.log("Successfully updated all requests.");
}

main().catch((err) => {
  console.error("Failed to update requests:", err);
  process.exit(1);
});
