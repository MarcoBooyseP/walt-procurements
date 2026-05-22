import { db } from "../src/db";
import { users, locations } from "../src/db/schema";
import { isNull, eq } from "drizzle-orm";

async function main() {
  const existingLocations = await db.select().from(locations);
  let defaultLocationId: string;

  if (existingLocations.length === 0) {
    console.log("No locations found. Creating a default location...");
    const [newLoc] = await db.insert(locations).values({ name: "Main Farm" }).returning({ id: locations.id });
    defaultLocationId = newLoc.id;
  } else {
    defaultLocationId = existingLocations[0].id;
  }

  const usersWithoutLocation = await db.select().from(users).where(isNull(users.locationId));
  console.log(`Found ${usersWithoutLocation.length} users without a location. Assigning to default location...`);

  for (const user of usersWithoutLocation) {
    await db.update(users).set({ locationId: defaultLocationId }).where(eq(users.id, user.id));
  }

  console.log("Backfill complete.");
}

main().catch(console.error);
