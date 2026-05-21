"use server";

import { db } from "@/db";
import { locations } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function addLocation(formData: FormData) {
  try {
    const name = (formData.get("name") as string)?.trim();

    if (!name) {
      return { error: "Location name is required." };
    }

    // Check if location already exists
    const existing = await db
      .select()
      .from(locations)
      .where(eq(locations.name, name))
      .limit(1);

    if (existing.length > 0) {
      return { error: "A location with this name already exists." };
    }

    await db.insert(locations).values({ name });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("[addLocation] Error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function deleteLocation(id: string) {
  try {
    await db.delete(locations).where(eq(locations.id, id));
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("[deleteLocation] Error:", error);
    return { error: "Failed to delete location. It may be in use." };
  }
}
