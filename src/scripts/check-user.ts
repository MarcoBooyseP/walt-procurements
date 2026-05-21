import { db } from "../db/index";
import { users } from "../db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function main() {
  const userRecord = await db.select().from(users).where(eq(users.email, "hello@betterisk.co.za"));
  console.log("Found user:", userRecord.length ? "Yes" : "No");

  if (userRecord.length) {
    const match = await bcrypt.compare("6Hoender", userRecord[0].password);
    console.log("Password matches:", match);
  }
  process.exit(0);
}

main();
