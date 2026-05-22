import { db } from "../src/db";
import { requests } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const allRequests = await db.select().from(requests);
  const now = new Date();

  console.log(`Found ${allRequests.length} requests. Backfilling dates...`);

  for (const req of allRequests) {
    const updates: any = {};
    
    if (req.status === "PENDING_DIRECTOR") {
      updates.managerApprovalDate = now;
    } else if (req.status === "AWAITING_PLACEMENT") {
      updates.managerApprovalDate = now;
      updates.directorApprovalDate = now;
    } else if (req.status === "ORDER_PLACED") {
      updates.managerApprovalDate = now;
      updates.directorApprovalDate = now;
      updates.orderPlacedDate = now;
    } else if (req.status === "READY_FOR_PICKUP") {
      updates.managerApprovalDate = now;
      updates.directorApprovalDate = now;
      updates.orderPlacedDate = now;
      updates.orderReceivedDate = now;
    } else if (req.status === "COMPLETED") {
      updates.managerApprovalDate = now;
      updates.directorApprovalDate = now;
      updates.orderPlacedDate = now;
      updates.orderReceivedDate = now;
      updates.orderPickedUpDate = now;
    }

    if (Object.keys(updates).length > 0) {
      await db.update(requests).set(updates).where(eq(requests.id, req.id));
    }
  }

  console.log("Backfill complete.");
}

main().catch(console.error);
