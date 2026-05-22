"use server";

import { db } from "@/db";
import { users, locations } from "@/db/schema";
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
    const locationName = formData.get("locationName") as string;

    if (!name || !surname || !email || !password || !role || !cell || !locationName) {
      return { error: "Missing required fields." };
    }
    
    if (role === "EMPLOYEE" && !managerId) {
      return { error: "A manager must be assigned for employees." };
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

    // Find or create location
    let locationId = "";
    const existingLocations = await db.select().from(locations).where(eq(locations.name, locationName.trim())).limit(1);
    
    if (existingLocations.length > 0) {
      locationId = existingLocations[0].id;
    } else {
      const [newLocation] = await db.insert(locations).values({ name: locationName.trim() }).returning({ id: locations.id });
      locationId = newLocation.id;
    }

    // Insert new user
    const [newUser] = await db.insert(users).values({
      name,
      surname,
      email,
      cell: cell || null,
      password: hashedPassword,
      role: role,
      managerId: managerId || null,
      locationId: locationId,
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

export async function editUser(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const surname = formData.get("surname") as string;
    const email = formData.get("email") as string;
    const cell = formData.get("cell") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;
    const managerId = formData.get("managerId") as string;
    const locationName = formData.get("locationName") as string;

    if (!id || !name || !surname || !email || !role || !cell || !locationName) {
      return { error: "Missing required fields." };
    }

    if (role === "EMPLOYEE" && !managerId) {
      return { error: "A manager must be assigned for employees." };
    }

    // Protect primary admin email
    const [target] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (target && target.email === PROTECTED_ADMIN_EMAIL) {
      if (email !== PROTECTED_ADMIN_EMAIL || role !== "ADMIN") {
        return { error: "The primary admin account email and role cannot be modified." };
      }
    }

    // Check email uniqueness if email changed
    if (target && target.email !== email) {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser.length > 0) {
        return { error: "A user with this email already exists." };
      }
    }

    // Find or create location
    let locationId = "";
    const existingLocations = await db.select().from(locations).where(eq(locations.name, locationName.trim())).limit(1);
    
    if (existingLocations.length > 0) {
      locationId = existingLocations[0].id;
    } else {
      const [newLocation] = await db.insert(locations).values({ name: locationName.trim() }).returning({ id: locations.id });
      locationId = newLocation.id;
    }

    const updateData: any = {
      name,
      surname,
      email,
      cell: cell || null,
      role: role,
      managerId: managerId || null,
      locationId: locationId,
    };

    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await db.update(users).set(updateData).where(eq(users.id, id));

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error editing user:", error);
    return { error: "Failed to update user. Please try again." };
  }
}
