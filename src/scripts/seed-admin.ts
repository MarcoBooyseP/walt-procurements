import { db } from "../db/index";
import { users } from "../db/schema";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding admin user...");

  const passwordHash = await bcrypt.hash("6Hoender", 10);

  try {
    await db.insert(users).values({
      name: "Marco",
      surname: "Booyse",
      email: "hello@betterisk.co.za",
      cell: "0823294694",
      password: passwordHash,
      role: "ADMIN",
    });

    console.log("Admin user seeded successfully!");
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
  
  process.exit(0);
}

main();
