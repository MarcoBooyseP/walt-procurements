import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const allUsers = await db.select().from(users);
  console.log("All users:");
  for (const user of allUsers) {
    console.log(`- ${user.name} ${user.surname} (${user.role}), managerId: ${user.managerId}, email: ${user.email}`);
  }
}

main().catch(console.error);
