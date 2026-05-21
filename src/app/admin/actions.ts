"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

const PROTECTED_ADMIN_EMAIL = "hello@betterisk.co.za";

export async function addUser(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const surname = formData.get("surname") as string;
    const email = formData.get("email") as string;
    const cell = formData.get("cell") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;
    const managerId = formData.get("managerId") as string;
    const accountantId = formData.get("accountantId") as string;

    if (!name || !surname || !email || !password || !role || !cell) {
      return { error: "Missing required fields." };
    }
    
    if (role === "EMPLOYEE" && !managerId) {
      return { error: "A manager must be assigned for employees." };
    }
    
    if (role === "MANAGER" && !accountantId) {
      return { error: "An accountant must be assigned for managers." };
    }

    if (role === "ADMIN" && !accountantId && email !== PROTECTED_ADMIN_EMAIL) {
      return { error: "An accountant must be assigned for admins." };
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return { error: "A user with this email already exists." };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [newUser] = await db.insert(users).values({
      name,
      surname,
      email,
      cell: cell || null,
      password: hashedPassword,
      role: role,
      managerId: managerId || null,
      accountantId: accountantId || null,
    }).returning({ id: users.id });

    revalidatePath("/admin");
    return { success: true, userId: newUser.id };
  } catch (error) {
    console.error("Error adding user:", error);
    return { error: "Failed to add user. Please try again." };
  }
}

export async function deleteUser(id: string) {
  try {
    // Fetch user first to enforce protection
    const [target] = await db.select().from(users).where(eq(users.id, id)).limit(1);

    if (!target) {
      return { error: "User not found." };
    }

    if (target.email === PROTECTED_ADMIN_EMAIL) {
      return { error: "This account is protected and cannot be deleted." };
    }

    await db.delete(users).where(eq(users.id, id));

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { error: "Failed to delete user. Please try again." };
  }
}
